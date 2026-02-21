"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  CreditCard, Truck, Lock, ChevronRight, CheckCircle, 
  MapPin, Tag, ShieldCheck, Loader2 
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { client } from '@/sanity/lib/client'
import imageUrlBuilder from '@sanity/image-url'
import ShippingAddress from '@/components/ShippingAddress'
import { Address } from '@/src/types' 
import { useUser } from "@clerk/nextjs";
import { calculateSilverPrice } from '@/utils/calculatePrice' 

const builder = imageUrlBuilder(client)
function urlFor(source: any) { try { return builder.image(source) } catch { return null } }

// 👇 Razorpay SDK load karne ke liye helper function
const loadScript = (src: string) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const { user } = useUser();

  // --- STATE ---
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [silverRate, setSilverRate] = useState(0);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ type: string, text: string } | null>(null);

  useEffect(() => {
    setIsClient(true);
    // Fetch Silver Rate for Visual Breakdown
    const fetchRate = async () => {
        const rate = await client.fetch(`*[_type == "silverRate"][0].ratePerGram`);
        setSilverRate(rate || 0);
    };
    fetchRate();
  }, []);

  // --- CALCULATIONS (Visual Only - Server Re-calculates) ---
  const cartBreakdown = cartItems.reduce((acc, item) => {
     const { breakup } = calculateSilverPrice(item.weight, silverRate, item.makingCharges);
     acc.silverValue += (breakup.silverValue || 0) * item.quantity;
     acc.makingCost += (breakup.makingCost || 0) * item.quantity;
     acc.gst += (breakup.gst || 0) * item.quantity;
     return acc;
  }, { silverValue: 0, makingCost: 0, gst: 0 });

  const subTotal = getCartTotal();
  const shipping = subTotal > 1000 ? 0 : 100;
  const total = Math.max(0, subTotal + shipping - discount);

  // --- HANDLERS ---
  const applyCoupon = async () => {
    if (!couponCode) return;
    setIsApplyingCoupon(true);
    setCouponMessage(null);
    try {
        const query = `*[_type == "coupon" && code == $code && isActive == true][0]`;
        const coupon = await client.fetch(query, { code: couponCode.toUpperCase() });
        
        if (coupon) {
            const discountVal = Math.round(subTotal * (coupon.discountPercentage / 100));
            setDiscount(discountVal);
            setCouponMessage({ type: "success", text: `Saved ₹${discountVal}` });
        } else {
            setDiscount(0);
            setCouponMessage({ type: "error", text: "Invalid Code" });
        }
    } catch (error) {
        setCouponMessage({ type: "error", text: "Error" });
    } finally {
        setIsApplyingCoupon(false);
    }
  };

  // 👇 UPDATED RAZORPAY PAYMENT HANDLER
  const handlePayment = async () => {
    if (!selectedAddress) {
      alert("Please select a delivery address.");
      return;
    }

    setIsProcessing(true);

    try {
        // 1. Load Razorpay Script
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            setIsProcessing(false);
            return;
        }

        // 2. Create Order on your backend
        const rzpOrderResponse = await fetch("/api/razorpay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: total }), 
        });

        if (!rzpOrderResponse.ok) {
            alert("Payment initialization failed!");
            setIsProcessing(false);
            return;
        }

        const rzpOrderData = await rzpOrderResponse.json();

        // 3. Open Razorpay Modal
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
            amount: rzpOrderData.amount,
            currency: rzpOrderData.currency,
            name: "KANKARIYA JEWELLERS",
            description: "Secure Jewellery Purchase",
            order_id: rzpOrderData.id,
            handler: async function (response: any) {
                // PAYMENT SUCCESSFUL! Now save order to Sanity
                try {
                    const userId = user?.id || "guest_user";
                    const orderResponse = await fetch("/api/create-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            cartItems: cartItems.map(item => ({ _id: item._id, quantity: item.quantity })), 
                            shippingAddress: selectedAddress,
                            userId: userId,
                            email: user?.primaryEmailAddress?.emailAddress || "guest@kankariya.com",
                            couponCode: discount > 0 ? couponCode : null,
                            paymentId: response.razorpay_payment_id, 
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature,
                        }),
                    });

                    const orderData = await orderResponse.json();

                    if (orderResponse.ok) {
                        clearCart();
                        router.push(`/success?order_id=${orderData.orderId}`); 
                    } else {
                        alert(`Order Failed: ${orderData.message}`);
                        setIsProcessing(false);
                    }
                } catch (error) {
                    console.error("Order save error:", error);
                    alert("Payment successful, but order saving failed. Please contact support.");
                    setIsProcessing(false);
                }
            },
            prefill: {
                name: user?.fullName || "",
                email: user?.primaryEmailAddress?.emailAddress || "",
            },
            theme: {
                color: "#E11D48", // matches rose-600
            },
            modal: {
                ondismiss: function() {
                    setIsProcessing(false); // Reset button if user closes popup
                }
            }
        };

        const paymentObject = new (window as any).Razorpay(options);
        
        paymentObject.on('payment.failed', function (response: any) {
            alert(`Payment Failed: ${response.error.description}`);
            setIsProcessing(false);
        });

        paymentObject.open();

    } catch (error) {
        console.error("Payment Error:", error);
        alert("Something went wrong processing payment.");
        setIsProcessing(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F4] py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        
        <div className="flex items-center gap-3 mb-8">
            <div className="bg-stone-900 text-white p-2 rounded-full"><Lock size={20} /></div>
            <h1 className="text-3xl font-serif text-stone-900">Secure Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Address Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                <div className="flex items-center gap-2 mb-4 border-b border-stone-100 pb-4">
                    <MapPin className="text-rose-600" size={20}/>
                    <h2 className="text-lg font-bold text-stone-900">Shipping Address</h2>
                </div>
                <ShippingAddress onAddressSelect={(addr) => setSelectedAddress(addr)} />
            </div>

            {/* 2. Payment Method */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
               <div className="flex items-center gap-2 mb-4 border-b border-stone-100 pb-4">
                  <CreditCard className="text-rose-600" size={20} /> 
                  <h2 className="text-lg font-bold text-stone-900">Payment Method</h2>
               </div>
               
               <label className="border-2 border-green-500 bg-green-50/50 p-4 rounded-xl flex items-center gap-4 cursor-pointer relative overflow-hidden transition-all hover:shadow-md">
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] px-2 py-1 font-bold uppercase rounded-bl-lg">Recommended</div>
                  <div className="w-6 h-6 rounded-full border-2 border-green-600 flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-600 rounded-full" />
                  </div>
                  <div>
                      <p className="font-bold text-stone-900 flex items-center gap-2">
                          Razorpay Secure <span className="bg-stone-200 text-stone-600 text-[10px] px-1.5 py-0.5 rounded border border-stone-300">ONLINE</span>
                      </p>
                      <p className="text-xs text-stone-500 mt-1">Pay securely via UPI, Cards, Netbanking</p>
                  </div>
               </label>

               <div className="mt-4 flex items-center gap-2 text-xs text-stone-400">
                   <ShieldCheck size={14} /> Payments are SSL encrypted and secured by Razorpay.
               </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Summary */}
          <div className="lg:col-span-1">
             <div className="bg-white p-6 rounded-2xl shadow-lg border border-stone-200 sticky top-24">
                <h2 className="text-xl font-serif font-bold text-stone-900 mb-6">Order Summary</h2>

                {/* Items Scroll Area */}
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-6 custom-scrollbar">
                   {cartItems.map((item) => (
                      <div key={item._id} className="flex gap-3 group">
                         <div className="w-14 h-14 bg-stone-100 rounded-md overflow-hidden relative border border-stone-100 flex-shrink-0">
                            {item.imageUrl && <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />}
                         </div>
                         <div className="flex-1">
                            <p className="text-sm font-medium text-stone-900 line-clamp-1 group-hover:text-rose-600 transition-colors">{item.title}</p>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-stone-500">{item.weight}g x {item.quantity}</p>
                                <p className="text-xs font-bold text-stone-900">₹{item.price.toLocaleString()}</p>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>

                {/* Detailed Breakdown */}
                <div className="border-t border-stone-100 pt-4 space-y-2 text-sm text-stone-600">
                    <div className="flex justify-between text-xs">
                       <span>Total Silver Value</span>
                       <span>₹{cartBreakdown.silverValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                       <span>Making Charges</span>
                       <span>+ ₹{cartBreakdown.makingCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs pb-2 border-b border-dashed border-stone-200">
                       <span>GST (3%)</span>
                       <span>+ ₹{cartBreakdown.gst.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between font-medium text-stone-900 pt-1">
                       <span>Subtotal</span>
                       <span>₹{subTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                       <span>Shipping</span>
                       {shipping === 0 ? <span className="text-green-600 font-bold">Free</span> : <span>₹{shipping}</span>}
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-green-600 font-bold">
                           <span>Discount</span>
                           <span>- ₹{discount}</span>
                        </div>
                    )}
                </div>

                {/* Coupon Input */}
                <div className="mt-6 pt-6 border-t border-stone-100">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                           <Tag size={14} className="absolute left-3 top-3 text-stone-400"/>
                           <input 
                               className="w-full pl-8 pr-2 py-2 bg-stone-50 border border-stone-200 rounded text-xs uppercase focus:outline-none focus:border-rose-500" 
                               placeholder="COUPON CODE" 
                               value={couponCode} 
                               onChange={(e)=>setCouponCode(e.target.value)} 
                           />
                        </div>
                        <button onClick={applyCoupon} disabled={isApplyingCoupon} className="bg-stone-800 text-white px-3 rounded text-xs font-bold disabled:opacity-50">
                           APPLY
                        </button>
                    </div>
                    {couponMessage && (
                        <p className={`text-[10px] mt-1 ${couponMessage.type==='error'?'text-red-500':'text-green-600'}`}>{couponMessage.text}</p>
                    )}
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-center font-bold text-xl text-stone-900 border-t-2 border-stone-100 pt-4 mt-4">
                   <span>Total to Pay</span>
                   <span>₹{total.toLocaleString()}</span>
                </div>

                <button 
                   onClick={handlePayment}
                   disabled={!selectedAddress || isProcessing}
                   className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold mt-6 hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                   {isProcessing ? (
                      <><Loader2 className="animate-spin" /> Processing...</>
                   ) : (
                      <>Confirm & Pay <ChevronRight size={18} /></>
                   )}
                </button>

             </div>
          </div>

        </div>
      </div>
    </div>
  )
}