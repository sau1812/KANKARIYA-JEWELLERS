import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import crypto from "crypto";

// --- HELPERS ---
const calculateItemPrice = (weight: number, rate: number, makingCharges: number) => {
  const silverValue = weight * rate;
  const makingCost = silverValue * (makingCharges / 100);
  const subTotal = silverValue + makingCost;
  const gstAmount = subTotal * 0.03; // 3% GST
  return Math.round(subTotal + gstAmount);
};

export async function POST(req: Request) {
  try {
    const { 
        cartItems, shippingAddress, userId, couponCode, email,
        paymentId, razorpayOrderId, razorpaySignature 
    } = await req.json();

    // 1. RAZORPAY SIGNATURE VERIFICATION
    if (!paymentId || !razorpayOrderId || !razorpaySignature) {
        return NextResponse.json({ message: "Missing Payment Details" }, { status: 400 });
    }

    const body = razorpayOrderId + "|" + paymentId;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature !== razorpaySignature) {
        return NextResponse.json({ message: "Payment Verification Failed!" }, { status: 400 });
    }

    // 2. FETCH LATEST DATA FROM SANITY
    const currentSilverRate = await client.fetch(`*[_type == "silverRate"][0].ratePerGram`);
    const productIds = cartItems.map((item: any) => item._id);
    
    const products = await client.fetch(
      `*[_type == "product" && _id in $ids]{
          _id, title, weight, makingCharges, stockQuantity, pricingType, fixedPrice, extraOptions
      }`,
      { ids: productIds }
    );

    let calculatedTotal = 0;
    const finalOrderItems = [];
    const transaction = client.transaction();

    for (const cartItem of cartItems) {
        const product = products.find((p: any) => p._id === cartItem._id);
        if (!product) continue;

        // STOCK CHECK
        if (product.stockQuantity < cartItem.quantity) {
          return NextResponse.json({ message: `Insufficient stock for ${product.title}` }, { status: 400 });
        }

        // --- UPDATED PRICE CALCULATION LOGIC ---
        let unitPrice = 0;
        if (product.pricingType === 'fixed') {
            // FIXED PRICE: Base + 3% GST
            const baseFixedPrice = product.fixedPrice || 0;
            const gstOnFixed = baseFixedPrice * 0.03;
            unitPrice = Math.round(baseFixedPrice + gstOnFixed);
        } else {
            // CALCULATED: (Wgt * Rate + Making%) + 3% GST
            unitPrice = calculateItemPrice(product.weight || 0, currentSilverRate, product.makingCharges || 0);
        }

        // VALIDATE EXTRAS
        const validatedExtras: any[] = [];
        if (cartItem.selectedExtras && cartItem.selectedExtras.length > 0) {
            cartItem.selectedExtras.forEach((extra: any) => {
                const validOption = product.extraOptions?.find((o: any) => o.optionName === extra.optionName);
                if (validOption) {
                    unitPrice += validOption.price; // Extras are added to unit price
                    validatedExtras.push({
                        _key: `extra-${Math.random().toString(36).substring(2, 9)}`, 
                        optionName: validOption.optionName,
                        price: validOption.price,
                        description: validOption.description || ""
                    });
                }
            });
        }

        calculatedTotal += (unitPrice * cartItem.quantity);

        finalOrderItems.push({
            _key: `item-${product._id}-${Date.now()}`,
            product: { _type: 'reference', _ref: product._id },
            quantity: cartItem.quantity,
            priceAtPurchase: unitPrice,
            selectedExtras: validatedExtras
        });

        // DECREASE STOCK
        transaction.patch(product._id, (p) => p.dec({ stockQuantity: cartItem.quantity }));
    }

    // 3. DISCOUNTS & SHIPPING
    let discountAmount = 0;
    if (couponCode) {
        const coupon = await client.fetch(`*[_type == "coupon" && code == $code && isActive == true][0]`, { code: couponCode });
        if (coupon) {
            discountAmount = Math.round(calculatedTotal * (coupon.discountPercentage / 100));
        }
    }

    const finalPayable = calculatedTotal - discountAmount;
    const shippingCost = finalPayable > 1000 ? 0 : 100;

    // 4. CREATE ORDER DOCUMENT
    const orderDoc = {
        _type: "order",
        orderNumber: `ORD-${Date.now()}`,
        orderDate: new Date().toISOString(),
        customerName: shippingAddress.name,
        email: email || "",
        phone: shippingAddress.phone,
        shippingAddress: {
            name: shippingAddress.name,
            address: shippingAddress.street || shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            pinCode: shippingAddress.pincode || shippingAddress.pinCode,
            phone: shippingAddress.phone,
        },
        products: finalOrderItems,
        totalPrice: finalPayable + shippingCost,
        amountDiscount: discountAmount,
        currency: "INR",
        status: "paid", // Initial status after Razorpay success
        clerkUserId: userId || "guest_user",
        razorpayPaymentId: paymentId,
        razorpayOrderId: razorpayOrderId,
    };

    transaction.create(orderDoc);
    await transaction.commit();

    return NextResponse.json({ orderId: orderDoc.orderNumber }, { status: 200 });

  } catch (error: any) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}