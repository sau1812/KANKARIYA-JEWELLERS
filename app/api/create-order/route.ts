import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

// 👇 Helper: Server-Side Calculation Logic (Must match your frontend logic)
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

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    // --- STEP 1: Fetch Live Silver Rate (The Source of Truth) ---
    const rateQuery = `*[_type == "silverRate"][0].ratePerGram`;
    const currentSilverRate = await client.fetch(rateQuery);

    if (!currentSilverRate) {
       return NextResponse.json({ message: "Server Error: Silver Rate not found" }, { status: 500 });
    }

    // --- STEP 2: Fetch Products with Weight & Making Charges ---
    const productIds = cartItems.map((item: any) => item._id);
    
    // We fetch 'weight', 'makingCharges', and 'stockQuantity' to calculate fresh price
    const products = await client.fetch(
      `*[_type == "product" && _id in $ids]{
          _id, 
          title, 
          weight, 
          makingCharges, 
          stockQuantity,
          price // Fallback for fixed items if needed
      }`,
      { ids: productIds }
    );

    let calculatedTotal = 0;
    const finalOrderItems = [];
    
    // --- STEP 3: Secure Calculation Loop ---
    for (const cartItem of cartItems) {
        const product = products.find((p: any) => p._id === cartItem._id);
        
        if (!product) {
            return NextResponse.json({ message: `Product ${cartItem._id} not found` }, { status: 400 });
        }

        // 🛑 Security Check: Stock Availability
        if (product.stockQuantity < cartItem.quantity) {
            return NextResponse.json({ message: `Out of Stock: ${product.title}` }, { status: 400 });
        }

        // 💰 Calculate Price on Server (Hacker cannot bypass this)
        // If product has weight, use Formula. If not, use fixed price (fallback).
        let unitPrice = 0;
        if (product.weight && product.weight > 0) {
            unitPrice = calculateItemPrice(product.weight, currentSilverRate, product.makingCharges);
        } else {
            unitPrice = product.price || 0;
        }

        const lineTotal = unitPrice * cartItem.quantity;
        calculatedTotal += lineTotal;

        finalOrderItems.push({
            _key: product._id,
            product: { _type: 'reference', _ref: product._id },
            quantity: cartItem.quantity,
            priceAtPurchase: unitPrice, // Saving the calculated price
            productName: product.title
        });
    }

    // --- STEP 4: Shipping & Coupon Logic ---
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

    // --- STEP 5: Create Order in Sanity ---
    const newOrder = await client.create({
        _type: "order",
        orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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

        products: finalOrderItems, // Using our securely calculated items
        
        totalPrice: finalAmount,
        amountDiscount: discountAmount,
        currency: "INR",
        
        status: "pending",
        clerkUserId: userId,
        
        // Payment Info (You can update this later based on Payment Gateway response)
        stripeCustomerId: "manual_order", 
        stripePaymentIntentId: "cod_pending", 
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