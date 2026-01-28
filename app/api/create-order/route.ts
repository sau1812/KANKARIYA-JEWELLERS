import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

interface ExtraOption {
  optionName: string;
  price: number;
  description?: string;
}

const calculateItemPrice = (weight: number, rate: number, makingCharges: number) => {
  const silverValue = weight * rate;
  const makingCost = silverValue * (makingCharges / 100);
  const subTotal = silverValue + makingCost;
  const gstAmount = subTotal * 0.03;
  return Math.round(subTotal + gstAmount);
};

export async function POST(req: Request) {
  try {
    const { cartItems, shippingAddress, userId, couponCode, email } = await req.json();

    const currentSilverRate = await client.fetch(`*[_type == "silverRate"][0].ratePerGram`);
    const productIds = cartItems.map((item: any) => item._id);
    const products = await client.fetch(
      `*[_type == "product" && _id in $ids]{
          _id, title, weight, makingCharges, stockQuantity, price, extraOptions
      }`,
      { ids: productIds }
    );

    let calculatedTotal = 0;
    const finalOrderItems = [];
    
    // --- TRANSACTION START (FOR STOCK UPDATE) ---
    const transaction = client.transaction();

    for (const cartItem of cartItems) {
        const product = products.find((p: any) => p._id === cartItem._id);
        if (!product) continue;

        // 🚨 STOCK VALIDATION
        if (product.stockQuantity < cartItem.quantity) {
          return NextResponse.json({ message: `Insufficient stock for ${product.title}` }, { status: 400 });
        }

        // 📉 DECREASE STOCK LOGIC (Added to transaction)
        transaction.patch(product._id, (p) => 
          p.dec({ stockQuantity: cartItem.quantity })
        );

        let unitPrice = product.weight > 0 
          ? calculateItemPrice(product.weight, currentSilverRate, product.makingCharges) 
          : (product.price || 0);

        let extrasPriceTotal = 0;
        const validatedExtras: any[] = [];

        if (cartItem.selectedExtras && cartItem.selectedExtras.length > 0) {
            cartItem.selectedExtras.forEach((extra: any) => {
                const validOption = product.extraOptions?.find((o: any) => o.optionName === extra.optionName);
                if (validOption) {
                    extrasPriceTotal += validOption.price;
                    validatedExtras.push({
                        _key: `extra-${Math.random().toString(36).substring(2, 9)}`, 
                        optionName: validOption.optionName,
                        price: validOption.price,
                        description: validOption.description || ""
                    });
                }
            });
        }

        const totalUnitPrice = unitPrice + extrasPriceTotal;
        calculatedTotal += (totalUnitPrice * cartItem.quantity);

        finalOrderItems.push({
            _key: `item-${product._id}-${Date.now()}`,
            product: { _type: 'reference', _ref: product._id },
            quantity: cartItem.quantity,
            priceAtPurchase: totalUnitPrice,
            productName: product.title,
            selectedExtras: validatedExtras
        });
    }

    const shippingCost = calculatedTotal > 1000 ? 0 : 100;
    let discountAmount = 0;
    if (couponCode) {
        const coupon = await client.fetch(`*[_type == "coupon" && code == $code && isActive == true][0]`, { code: couponCode });
        if (coupon) discountAmount = Math.round(calculatedTotal * (coupon.discountPercentage / 100));
    }

    // 📦 CREATE ORDER LOGIC (Added to transaction)
    const orderDoc = {
        _type: "order",
        orderNumber: `ORD-${Date.now()}`,
        orderDate: new Date().toISOString(),
        customerName: shippingAddress.name,
        email: email,
        phone: shippingAddress.phone,
        shippingAddress: {
            name: shippingAddress.name,
            address: shippingAddress.streetAddress,
            city: shippingAddress.city,
            state: shippingAddress.state,
            pinCode: shippingAddress.pinCode,
            phone: shippingAddress.phone,
        },
        products: finalOrderItems,
        totalPrice: calculatedTotal + shippingCost - discountAmount,
        amountDiscount: discountAmount,
        currency: "INR",
        status: "pending",
        clerkUserId: userId,
        stripeCustomerId: "manual_order",
        stripePaymentIntentId: "cod_pending",
    };

    transaction.create(orderDoc);

    // ✅ COMMIT BOTH (Stock Update + Order Creation)
    const result = await transaction.commit();

    // Result se order number nikalne ke liye humne wahi number use kiya jo upar generate kiya tha
    return NextResponse.json({ orderId: orderDoc.orderNumber }, { status: 200 });

  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}