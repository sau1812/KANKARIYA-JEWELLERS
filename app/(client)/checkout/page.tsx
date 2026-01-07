"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { CreditCard, Truck, Lock, ChevronRight, CheckCircle } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { client } from '@/sanity/lib/client'
import imageUrlBuilder from '@sanity/image-url'
import ShippingAddress, { Address } from '@/components/ShippingAddress'
import { useUser } from "@clerk/nextjs";

const builder = imageUrlBuilder(client)

function urlFor(source: any) {
  try {
    return builder.image(source)
  } catch (error) {
    return null
  }
}

export default function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const { user } = useUser();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Display Only Calculations (For Visuals)
  const subTotal = getCartTotal();
  const shipping = subTotal > 1000 ? 0 : 100;
  const total = subTotal + shipping;

  const getImageUrl = (item: any) => {
    if (item.imageUrl) return item.imageUrl;
    if (typeof item.image === "string") return item.image;
    if (item.image && Array.isArray(item.image) && item.image[0]) {
      return urlFor(item.image[0])?.width(150).url();
    }
    return null;
  };

  const handlePayment = async () => {
    if (!selectedAddress) {
      alert("Please select a delivery address.");
      return;
    }

    setIsProcessing(true);

    try {
        const userId = user?.id || "guest_user";
        
        // 👇 SECURITY FIX: Don't send 'totalAmount'. Backend calculates it.
        const orderResponse = await fetch("/api/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                // Send only IDs and Quantity to be safe
                cartItems: cartItems.map(item => ({ _id: item._id, quantity: item.quantity })), 
                shippingAddress: selectedAddress,
                userId: userId,
                email: user?.primaryEmailAddress?.emailAddress || "guest@example.com",
                // Status is handled by backend default ("pending"), but we can pass metadata if needed
            }),
        });

        const orderData = await orderResponse.json();

        if (orderResponse.ok) {
            // Fake Delay for Real Feel
            setTimeout(() => {
                clearCart();
                // 👇 Redirect to Success Page with Order ID
                router.push(`/success?order_id=${orderData.orderId}`); 
            }, 2000); 
        } else {
            alert(`Order Failed: ${orderData.message}`);
            setIsProcessing(false);
        }

    } catch (error) {
        console.error("Payment Error:", error);
        alert("Something went wrong processing payment.");
        setIsProcessing(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        
        <h1 className="text-3xl font-serif text-stone-900 mb-8 flex items-center gap-2">
          <Lock size={28} className="text-stone-400" /> Checkout (Test Mode)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Address */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                <ShippingAddress onAddressSelect={(addr) => setSelectedAddress(addr)} />
            </div>

            {/* Payment Method Display */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
               <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <CreditCard className="text-rose-600" /> Payment Method
               </h2>
               
               <div className="border border-green-500 bg-green-50 p-4 rounded-xl flex items-center gap-4 cursor-pointer ring-1 ring-green-500 transition-all">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-green-600">
                     <CheckCircle size={20} />
                  </div>
                  <div>
                      <p className="font-bold text-stone-900">Instant Pay (Test Mode)</p>
                      <p className="text-xs text-stone-600">Clicking Pay will simulate a successful payment.</p>
                  </div>
               </div>
            </div>

          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 sticky top-24">
                <h2 className="text-xl font-bold text-stone-900 mb-4">Order Summary</h2>

                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-6 custom-scrollbar">
                   {cartItems.map((item) => (
                      <div key={item._id} className="flex gap-3">
                         <div className="w-16 h-16 bg-stone-100 rounded-md overflow-hidden relative border border-stone-100 flex-shrink-0">
                            {getImageUrl(item) ? (
                                <Image src={getImageUrl(item)!} alt={item.title} fill className="object-cover" />
                            ) : (
                                <span className="text-[8px] flex items-center justify-center h-full">No Img</span>
                            )}
                         </div>
                         <div className="flex-1">
                            <p className="text-sm font-bold text-stone-900 line-clamp-1">{item.title}</p>
                            <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                            <p className="text-xs font-bold text-rose-600 mt-1">₹{item.price.toLocaleString()}</p>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="border-t border-stone-100 pt-4 space-y-2 text-sm text-stone-600">
                   <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{subTotal.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between">
                      <span>Shipping</span>
                      {shipping === 0 ? <span className="text-green-600">Free</span> : <span>₹{shipping}</span>}
                   </div>
                   <div className="flex justify-between font-bold text-lg text-stone-900 border-t border-stone-200 pt-3 mt-3">
                      <span>Total</span>
                      <span>₹{total.toLocaleString()}</span>
                   </div>
                </div>

                {selectedAddress ? (
                   <div className="mt-4 bg-stone-50 p-3 rounded-lg text-xs text-stone-600 border border-stone-100">
                      <p className="font-bold text-stone-900 mb-1 flex items-center gap-1"><Truck size={12}/> Delivering to:</p>
                      <p className="font-bold">{selectedAddress.name}</p>
                      <p>{selectedAddress.streetAddress}, {selectedAddress.city}</p>
                      <p>{selectedAddress.state} - {selectedAddress.pinCode}</p>
                      <p className="font-bold mt-1">Ph: {selectedAddress.phone}</p>
                   </div>
                ) : (
                   <div className="mt-4 p-3 rounded-lg text-xs text-red-500 bg-red-50 border border-red-100 text-center">
                      Please select an address to continue
                   </div>
                )}

                <button 
                   onClick={handlePayment}
                   disabled={!selectedAddress || isProcessing}
                   className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold mt-6 hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                   {isProcessing ? (
                      <span>Processing Payment...</span>
                   ) : (
                      <>Pay Now (Test) <ChevronRight size={18} /></>
                   )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-stone-400 uppercase tracking-widest">
                   <Lock size={10} /> Test Environment Active
                </div>

             </div>
          </div>

        </div>
      </div>
    </div>
  )
}