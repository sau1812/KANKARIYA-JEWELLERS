import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export async function POST(req: Request) {
  try {
    // 👇 UPDATED: Now extracting 'email' from the request body
    const { cartItems, shippingAddress, userId, couponCode, email } = await req.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    // --- STEP 1: Server-Side Price Calculation ---
    const productIds = cartItems.map((item: any) => item._id);
    
    // Fetch fresh data from Sanity
    const products = await client.fetch(
      `*[_type == "product" && _id in $ids]{_id, price, title}`,
      { ids: productIds }
    );

    let calculatedTotal = 0;
    
    const orderItems = cartItems.map((cartItem: any) => {
        const product = products.find((p: any) => p._id === cartItem._id);
        if (!product) throw new Error(`Product ${cartItem._id} not found`);
        
        calculatedTotal += product.price * cartItem.quantity;

        return {
            _key: product._id,
            product: { _type: 'reference', _ref: product._id },
            quantity: cartItem.quantity,
            priceAtPurchase: product.price,
            productName: product.title
        };
    });

    // --- STEP 2: Shipping & Coupon ---
    const shippingCost = calculatedTotal > 1000 ? 0 : 100;
    let discountAmount = 0;

    if (couponCode) {
        const coupon = await client.fetch(
            `*[_type == "coupon" && code == $code && isActive == true][0]`,
            { code: couponCode }
        );
        if (coupon) {
            discountAmount = Math.round(calculatedTotal * (coupon.discountPercentage / 100));
        }
    }

    const finalAmount = calculatedTotal + shippingCost - discountAmount;

    // --- STEP 3: Create Order in Sanity ---
    const newOrder = await client.create({
        _type: "order",
        orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        orderDate: new Date().toISOString(),
        customerName: shippingAddress.name,
        
        // 👇 UPDATED: Using the real email passed from Frontend
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

        products: orderItems,
        
        totalPrice: finalAmount,
        amountDiscount: discountAmount,
        currency: "INR",
        
        status: "pending",
        clerkUserId: userId,
        
        stripeCustomerId: "manual_order", 
        stripePaymentIntentId: "manual_payment",
    });

    return NextResponse.json({ 
        message: "Order created successfully", 
        orderId: newOrder.orderNumber 
    }, { status: 200 });

  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}