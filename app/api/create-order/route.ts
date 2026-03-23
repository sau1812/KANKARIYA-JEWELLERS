import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import crypto from "crypto";

const calculateItemPrice = (weight: number, rate: number, makingCharges: number) => {
  const silverValue = weight * rate;
  const makingCost = silverValue * (makingCharges / 100);
  const subTotal = silverValue + makingCost;
  const gstAmount = subTotal * 0.03;
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

    // 2. FETCH DATA FOR VALIDATION
    const currentSilverRate = await client.fetch(`*[_type == "silverRate"][0].ratePerGram`);
    const productIds = cartItems.map((item: any) => item._id);
    
    const products = await client.fetch(
      `*[_type == "product" && _id in $ids]{
          _id, title, weight, makingCharges, stockQuantity, price, pricingType, fixedPrice, extraOptions
      }`,
      { ids: productIds }
    );

    let calculatedTotal = 0;
    const finalOrderItems = [];
    const transaction = client.transaction();

    for (const cartItem of cartItems) {
        const product = products.find((p: any) => p._id === cartItem._id);
        if (!product) continue;

        // STOCK VALIDATION
        if (product.stockQuantity < cartItem.quantity) {
          return NextResponse.json({ message: `Insufficient stock for ${product.title}` }, { status: 400 });
        }

        // DECREASE STOCK
        transaction.patch(product._id, (p) => p.dec({ stockQuantity: cartItem.quantity }));

        // PRICE CALCULATION (Handled Fixed vs Calculated)
        let unitPrice = product.pricingType === 'fixed' 
          ? (product.fixedPrice || 0) 
          : calculateItemPrice(product.weight || 0, currentSilverRate, product.makingCharges || 0);

        // EXTRAS VALIDATION
        const validatedExtras: any[] = [];
        if (cartItem.selectedExtras && cartItem.selectedExtras.length > 0) {
            cartItem.selectedExtras.forEach((extra: any) => {
                const validOption = product.extraOptions?.find((o: any) => o.optionName === extra.optionName);
                if (validOption) {
                    unitPrice += validOption.price;
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
    }

    const shippingCost = calculatedTotal > 1000 ? 0 : 100;
    let discountAmount = 0;
    if (couponCode) {
        const coupon = await client.fetch(`*[_type == "coupon" && code == $code && isActive == true][0]`, { code: couponCode });
        if (coupon) discountAmount = Math.round(calculatedTotal * (coupon.discountPercentage / 100));
    }

    // 3. CREATE ORDER DOCUMENT
    const orderDoc = {
        _type: "order",
        orderNumber: `ORD-${Date.now()}`,
        orderDate: new Date().toISOString(),
        customerName: shippingAddress.name,
        email: email,
        phone: shippingAddress.phone,
        shippingAddress: {
            name: shippingAddress.name,
            address: shippingAddress.street, // 👈 Match with frontend state 'street'
            city: shippingAddress.city,
            state: shippingAddress.state,
            pinCode: shippingAddress.pincode, // 👈 Match with frontend state 'pincode'
            phone: shippingAddress.phone,
        },
        products: finalOrderItems,
        totalPrice: calculatedTotal + shippingCost - discountAmount,
        amountDiscount: discountAmount,
        currency: "INR",
        status: "paid",
        clerkUserId: userId,
        razorpayPaymentId: paymentId,
        razorpayOrderId: razorpayOrderId,
    };

    transaction.create(orderDoc);
    await transaction.commit();

    return NextResponse.json({ orderId: orderDoc.orderNumber }, { status: 200 });

  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}