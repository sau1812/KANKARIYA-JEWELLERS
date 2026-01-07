"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, ArrowRight, Tag, ShoppingBag, Loader2 } from 'lucide-react'
import { useCart } from '@/context/CartContext' 
import { client } from '@/sanity/lib/client'
import imageUrlBuilder from '@sanity/image-url'
import ShippingAddress from '@/components/ShippingAddress' // Component import
import { Address } from '@/src/types' // Type import
import { useUser } from "@clerk/nextjs";

const builder = imageUrlBuilder(client)

function urlFor(source: any) {
  try {
    return builder.image(source)
  } catch (error) {
    return null
  }
}

export default function CartPage() {
  const { cartItems, removeFromCart, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const { user } = useUser();

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ type: string, text: string } | null>(null);
  
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Display Only Calculations
  const subTotal = getCartTotal();
  const shipping = subTotal > 1000 ? 0 : 100; 
  const total = Math.max(0, subTotal + shipping - discount);

  const applyCoupon = async () => {
    if (!couponCode) return;
    setIsApplyingCoupon(true);
    setCouponMessage(null);
    try {
        const query = `*[_type == "coupon" && code == $code && isActive == true][0]`;
        const coupon = await client.fetch(query, { code: couponCode.toUpperCase() });
        
        if (coupon) {
            // Check expiry logic here if you added validUntil field
            const discountVal = Math.round(subTotal * (coupon.discountPercentage / 100));
            setDiscount(discountVal);
            setCouponMessage({ type: "success", text: `Coupon Applied! Saved ₹${discountVal}` });
        } else {
            setDiscount(0);
            setCouponMessage({ type: "error", text: "Invalid or Expired Code" });
        }
    } catch (error) {
        setCouponMessage({ type: "error", text: "Error applying coupon" });
    } finally {
        setIsApplyingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
        alert("Please select a shipping address.");
        return;
    }

    setIsProcessing(true);

    try {
        const userId = user?.id || "guest_user"; 
        
        // 👇 SECURITY FIX: Don't send 'totalAmount'. Let backend calculate it.
        const response = await fetch("/api/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cartItems: cartItems.map(item => ({ _id: item._id, quantity: item.quantity })), // Send only ID & Qty
                couponCode: discount > 0 ? couponCode : null, // Send code, not amount
                shippingAddress: selectedAddress,
                userId: userId, 
            }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Order Placed Successfully! Order ID: ${data.orderId}`);
            clearCart(); 
            router.push('/my-orders'); 
        } else {
            alert(`Failed: ${data.message}`);
        }

    } catch (error) {
        console.error(error);
        alert("Something went wrong processing your order.");
    } finally {
        setIsProcessing(false);
    }
  };

  if (!isClient) return null;

  if (cartItems.length === 0) {
    return (
       <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-stone-50">
         <ShoppingBag size={48} className="text-stone-300 mb-4" />
         <h2 className="text-2xl font-serif text-stone-800">Your Cart is Empty</h2>
         <Link href="/" className="mt-4 bg-stone-900 text-white px-6 py-2 rounded-full text-sm">Start Shopping</Link>
       </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-serif text-stone-900 mb-8">Shopping Cart ({cartItems.length})</h1>
        
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Cart Items List */}
          <div className="flex-1 flex flex-col gap-4">
            {cartItems.map((item) => (
                <div key={item._id} className="bg-white p-4 rounded-xl border border-stone-200 flex gap-4 items-center">
                  <div className="relative w-20 h-20 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.imageUrl && <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-stone-900">{item.title}</h3>
                    <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
                    <p className="font-bold">₹{item.price.toLocaleString()}</p>
                  </div>
                  <button onClick={() => removeFromCart(item._id)} className="text-stone-400 hover:text-red-500"><Trash2 size={18}/></button>
                </div>
            ))}
          </div>

          {/* Checkout Sidebar */}
          <div className="lg:w-[400px] h-fit flex flex-col gap-6">
            
            <ShippingAddress onAddressSelect={(addr) => setSelectedAddress(addr)} />

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              {/* Pricing */}
              <div className="space-y-2 text-sm text-stone-600 mb-6 border-b pb-4">
                 <div className="flex justify-between"><span>Subtotal</span><span>₹{subTotal.toLocaleString()}</span></div>
                 <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
                 {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount}</span></div>}
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-6">
                 <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-3 text-stone-400"/>
                    <input 
                        className="w-full pl-8 pr-2 py-2 border rounded text-sm uppercase" 
                        placeholder="COUPON" 
                        value={couponCode} 
                        onChange={(e)=>setCouponCode(e.target.value)} 
                    />
                 </div>
                 <button onClick={applyCoupon} disabled={isApplyingCoupon} className="bg-black text-white px-4 rounded text-xs font-bold disabled:opacity-50">
                    {isApplyingCoupon ? "..." : "APPLY"}
                 </button>
              </div>
              {couponMessage && <p className={`text-xs -mt-4 mb-4 ${couponMessage.type==='error'?'text-red-500':'text-green-600'}`}>{couponMessage.text}</p>}

              <div className="flex justify-between text-lg font-bold mb-6"><span>Estimated Total</span><span>₹{total.toLocaleString()}</span></div>

              <button 
                onClick={handleCheckout} 
                disabled={!selectedAddress || isProcessing}
                className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold disabled:opacity-50 flex justify-center gap-2 hover:bg-rose-700 transition-colors"
              >
                 {isProcessing ? <Loader2 className="animate-spin"/> : <>Proceed to Checkout <ArrowRight size={20}/></>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}