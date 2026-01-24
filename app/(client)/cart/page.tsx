"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Trash2, ArrowRight, Tag, ShoppingBag, Loader2, Minus, Plus, Info, ShieldCheck, Truck 
} from 'lucide-react'
import { useCart } from '@/context/CartContext' 
import { client } from '@/sanity/lib/client'
import imageUrlBuilder from '@sanity/image-url'
import ShippingAddress from '@/components/ShippingAddress' 
import { Address } from '@/src/types' 
import { useUser } from "@clerk/nextjs";
import { calculateSilverPrice } from '@/utils/calculatePrice' // 👈 Import Calculation Logic

const builder = imageUrlBuilder(client)
function urlFor(source: any) { try { return builder.image(source) } catch { return null } }

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const { user } = useUser();

  // --- STATE ---
  const [silverRate, setSilverRate] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ type: string, text: string } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Breakdown State
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    // Fetch Silver Rate for Breakdown Display
    const fetchRate = async () => {
        const rate = await client.fetch(`*[_type == "silverRate"][0].ratePerGram`);
        setSilverRate(rate || 0);
    };
    fetchRate();
  }, []);

  // --- CALCULATIONS ---
  const subTotal = getCartTotal();
  const shipping = subTotal > 1000 ? 0 : 100; 
  const total = Math.max(0, subTotal + shipping - discount);

  // Calculate Aggregated Breakdown (For Summary)
  const cartBreakdown = cartItems.reduce((acc, item) => {
     // Use the utility to get breakdown for this item
     const { breakup } = calculateSilverPrice(item.weight, silverRate, item.makingCharges);
     
     // Multiply by quantity
     acc.silverValue += (breakup.silverValue || 0) * item.quantity;
     acc.makingCost += (breakup.makingCost || 0) * item.quantity;
     acc.gst += (breakup.gst || 0) * item.quantity;
     return acc;
  }, { silverValue: 0, makingCost: 0, gst: 0 });


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
        // 👇 SECURE CHECKOUT CALL
        const response = await fetch("/api/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cartItems: cartItems.map(item => ({ _id: item._id, quantity: item.quantity })), 
                couponCode: discount > 0 ? couponCode : null, 
                shippingAddress: selectedAddress,
                userId: userId, 
                email: user?.primaryEmailAddress?.emailAddress // Pass Email
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
         <div className="bg-white p-6 rounded-full shadow-sm mb-4">
            <ShoppingBag size={48} className="text-stone-300" />
         </div>
         <h2 className="text-2xl font-serif text-stone-800 mb-2">Your Cart is Empty</h2>
         <p className="text-stone-500 mb-6">Looks like you haven't added any silver treasures yet.</p>
         <Link href="/" className="bg-rose-600 hover:bg-rose-700 transition-colors text-white px-8 py-3 rounded-full font-medium">Start Shopping</Link>
       </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-serif text-stone-900 mb-8 flex items-center gap-2">
            Shopping Cart <span className="text-lg text-stone-400 font-sans">({cartItems.length} Items)</span>
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- LEFT: CART ITEMS LIST --- */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Header for Desktop */}
            <div className="hidden md:grid grid-cols-12 text-xs font-bold text-stone-400 uppercase tracking-wider pb-2 border-b border-stone-200 px-4">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-3 text-right">Price</div>
                <div className="col-span-1"></div>
            </div>

            {cartItems.map((item) => {
                // Individual Item Calculation for Tooltip
                const { breakup } = calculateSilverPrice(item.weight, silverRate, item.makingCharges);
                
                return (
                    <div key={item._id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm md:grid md:grid-cols-12 md:items-center md:gap-4 relative group">
                        
                        {/* 1. Product Info (Span 6) */}
                        <div className="flex gap-4 md:col-span-6 items-center">
                            <div className="relative w-20 h-20 md:w-24 md:h-24 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0 border border-stone-100">
                                {item.imageUrl && <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />}
                            </div>
                            <div>
                                <h3 className="font-serif text-stone-900 text-lg leading-tight">{item.title}</h3>
                                <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                                    <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-600 font-medium">{item.weight}g</span>
                                    <span>Making: {item.makingCharges}%</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Quantity (Span 2) */}
                        <div className="flex items-center justify-between md:justify-center md:col-span-2 mt-4 md:mt-0">
                            <span className="md:hidden text-sm font-medium text-stone-500">Qty:</span>
                            <div className="flex items-center bg-stone-50 border border-stone-200 rounded-lg h-9">
                                <button onClick={() => updateQuantity(item._id, item.quantity - 1)} disabled={item.quantity <= 1} className="px-2.5 hover:text-rose-600 disabled:opacity-30"><Minus size={14}/></button>
                                <span className="font-semibold text-sm w-6 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-2.5 hover:text-green-600"><Plus size={14}/></button>
                            </div>
                        </div>

                        {/* 3. Price & Breakdown (Span 3) */}
                        <div className="flex items-center justify-between md:justify-end md:col-span-3 mt-4 md:mt-0 relative">
                             <span className="md:hidden text-sm font-medium text-stone-500">Total:</span>
                             <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-stone-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                                
                                {/* ℹ️ PRICE INFO TOOLTIP */}
                                <div className="relative">
                                    <button 
                                        onMouseEnter={() => setActiveTooltip(item._id)}
                                        onMouseLeave={() => setActiveTooltip(null)}
                                        className="text-stone-300 hover:text-rose-600 transition-colors"
                                    >
                                        <Info size={16} />
                                    </button>

                                    {/* Tooltip Content */}
                                    {activeTooltip === item._id && (
                                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-stone-900 text-white text-xs rounded-lg p-3 shadow-xl z-20 animate-in fade-in slide-in-from-bottom-1">
                                            <div className="font-bold mb-2 border-b border-stone-700 pb-1">Price Per Unit Breakdown</div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-stone-400">Silver ({item.weight}g)</span>
                                                <span>₹{breakup?.silverValue}</span>
                                            </div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-stone-400">Making ({item.makingCharges}%)</span>
                                                <span>₹{breakup?.makingCost}</span>
                                            </div>
                                            <div className="flex justify-between text-stone-300">
                                                <span>GST (3%)</span>
                                                <span>₹{breakup?.gst}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                             </div>
                        </div>

                        {/* 4. Remove Button (Span 1) */}
                        <div className="absolute top-2 right-2 md:relative md:top-0 md:right-0 md:col-span-1 text-right">
                             <button onClick={() => removeFromCart(item._id)} className="p-2 text-stone-300 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all">
                                <Trash2 size={18} />
                             </button>
                        </div>
                    </div>
                );
            })}
          </div>

          {/* --- RIGHT: ORDER SUMMARY SIDEBAR --- */}
          <div className="lg:w-[380px] h-fit flex flex-col gap-6">
            
            <ShippingAddress onAddressSelect={(addr) => setSelectedAddress(addr)} />

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h2 className="text-xl font-serif font-bold text-stone-900 mb-6">Order Summary</h2>

              {/* 🧾 DETAILED BILL BREAKDOWN */}
              <div className="space-y-3 text-sm text-stone-600 mb-6 border-b border-stone-100 pb-6">
                 
                 {/* Silver Cost */}
                 <div className="flex justify-between">
                    <span className="text-stone-500">Total Silver Value</span>
                    <span className="font-medium text-stone-900">₹{cartBreakdown.silverValue.toLocaleString()}</span>
                 </div>
                 
                 {/* Making Charges */}
                 <div className="flex justify-between">
                    <span className="text-stone-500">Total Making Charges</span>
                    <span className="font-medium text-stone-900">+ ₹{cartBreakdown.makingCost.toLocaleString()}</span>
                 </div>
                 
                 {/* GST */}
                 <div className="flex justify-between">
                    <span className="text-stone-500">Total GST (3%)</span>
                    <span className="font-medium text-stone-900">+ ₹{cartBreakdown.gst.toLocaleString()}</span>
                 </div>
                 
                 {/* Discount */}
                 {discount > 0 && (
                    <div className="flex justify-between text-green-600 bg-green-50 px-2 py-1 rounded">
                        <span>Coupon Discount</span>
                        <span>- ₹{discount.toLocaleString()}</span>
                    </div>
                 )}
                 
                 {/* Shipping */}
                 <div className="flex justify-between pt-2 border-t border-dashed border-stone-200">
                    <span>Shipping Charges</span>
                    <span className={shipping === 0 ? "text-green-600 font-bold" : ""}>
                        {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                 </div>
              </div>

              {/* Coupon Input */}
              <div className="flex gap-2 mb-6">
                 <div className="relative flex-1">
                    <Tag size={16} className="absolute left-3 top-3 text-stone-400"/>
                    <input 
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm uppercase focus:outline-none focus:border-rose-500 transition-colors" 
                        placeholder="COUPON CODE" 
                        value={couponCode} 
                        onChange={(e)=>setCouponCode(e.target.value)} 
                    />
                 </div>
                 <button onClick={applyCoupon} disabled={isApplyingCoupon} className="bg-stone-900 text-white px-5 rounded-lg text-xs font-bold hover:bg-stone-800 disabled:opacity-50 transition-colors">
                    {isApplyingCoupon ? "..." : "APPLY"}
                 </button>
              </div>
              {couponMessage && (
                  <div className={`text-xs -mt-4 mb-4 p-2 rounded ${couponMessage.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>
                      {couponMessage.text}
                  </div>
              )}

              {/* Grand Total */}
              <div className="flex justify-between items-end mb-6">
                  <span className="text-stone-500 font-medium">Grand Total</span>
                  <span className="text-2xl font-bold text-stone-900">₹{total.toLocaleString()}</span>
              </div>

              {/* Checkout Button */}
              <button 
                onClick={handleCheckout} 
                disabled={!selectedAddress || isProcessing}
                className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold disabled:opacity-50 flex justify-center items-center gap-2 hover:bg-rose-700 active:scale-95 transition-all shadow-lg shadow-rose-100"
              >
                 {isProcessing ? <Loader2 className="animate-spin"/> : <>Proceed to Checkout <ArrowRight size={20}/></>}
              </button>
              
              {/* Trust Badges */}
              <div className="flex justify-center gap-4 mt-6 text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                  <div className="flex items-center gap-1"><ShieldCheck size={14}/> Secure Payment</div>
                  <div className="flex items-center gap-1"><Truck size={14}/> Fast Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}