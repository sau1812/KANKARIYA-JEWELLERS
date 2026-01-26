"use client"

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Trash2, ArrowRight, Tag, ShoppingBag, Loader2, Minus, Plus, Info, ShieldCheck, Truck, CheckCircle2 
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

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const { user } = useUser();

  // --- STATE ---
  const [silverRate, setSilverRate] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null); // Store coupon object
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ type: string, text: string } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const fetchRate = async () => {
        const rate = await client.fetch(`*[_type == "silverRate"][0].ratePerGram`);
        setSilverRate(rate || 0);
    };
    fetchRate();
  }, []);

  // --- CALCULATIONS ---
  // Memoize breakdown to avoid unnecessary recalculations
  const cartBreakdown = useMemo(() => {
    return cartItems.reduce((acc, item) => {
       const { breakup } = calculateSilverPrice(item.weight, silverRate, item.makingCharges);
       const itemExtrasTotal = item.selectedExtras?.reduce((sum, ext) => sum + ext.price, 0) || 0;

       acc.silverValue += (breakup.silverValue || 0) * item.quantity;
       acc.makingCost += (breakup.makingCost || 0) * item.quantity;
       acc.gst += (breakup.gst || 0) * item.quantity;
       acc.extrasTotal += itemExtrasTotal * item.quantity;
       return acc;
    }, { silverValue: 0, makingCost: 0, gst: 0, extrasTotal: 0 });
  }, [cartItems, silverRate]);

  // Recalculate discount whenever makingCost or appliedCoupon changes
  useEffect(() => {
    if (appliedCoupon) {
      const discountVal = Math.round(cartBreakdown.makingCost * (appliedCoupon.discountPercentage / 100));
      setDiscount(discountVal);
    }
  }, [cartBreakdown.makingCost, appliedCoupon]);

  const subTotal = getCartTotal();
  const shipping = subTotal > 1000 ? 0 : 100; 
  const total = Math.max(0, subTotal + shipping - discount);

  // --- ✅ HANDLERS ---
  
  const applyCoupon = async () => {
    if (!couponCode) return;
    setIsApplyingCoupon(true);
    setCouponMessage(null);
    try {
        const query = `*[_type == "coupon" && code == $code && isActive == true][0]`;
        const coupon = await client.fetch(query, { code: couponCode.toUpperCase() });
        
        if (coupon) {
            setAppliedCoupon(coupon); // Save coupon to state
            const discountVal = Math.round(cartBreakdown.makingCost * (coupon.discountPercentage / 100));
            setDiscount(discountVal);
            setCouponMessage({ type: "success", text: `Coupon Applied! Saved ₹${discountVal} on Making Charges` });
        } else {
            setAppliedCoupon(null);
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
        const response = await fetch("/api/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cartItems: cartItems.map(item => ({ 
                    _id: item._id, 
                    quantity: item.quantity,
                    selectedExtras: item.selectedExtras 
                })), 
                couponCode: discount > 0 ? couponCode : null, 
                shippingAddress: selectedAddress,
                userId: userId, 
                email: user?.primaryEmailAddress?.emailAddress,
                totalAmount: total,
                discount: discount
            }),
        });

        const data = await response.json();
        if (response.ok) {
            alert(`Order Placed! ID: ${data.orderId}`);
            clearCart(); 
            router.push('/my-orders'); 
        } else {
            alert(`Failed: ${data.message}`);
        }
    } catch (error) {
        alert("Something went wrong.");
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
         <Link href="/" className="bg-rose-600 text-white px-8 py-3 rounded-full font-medium">Start Shopping</Link>
       </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-serif text-stone-900 mb-8">Shopping Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: ITEMS */}
          <div className="flex-1 flex flex-col gap-4">
            {cartItems.map((item) => {
                const { breakup } = calculateSilverPrice(item.weight, silverRate, item.makingCharges);
                return (
                    <div key={item._id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm md:grid md:grid-cols-12 md:items-center relative">
                        <div className="flex gap-4 md:col-span-6 items-center">
                            <div className="relative w-20 h-20 bg-stone-100 rounded-lg overflow-hidden border">
                                {item.imageUrl && <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />}
                            </div>
                            <div>
                                <h3 className="font-serif text-stone-900 text-lg leading-tight">{item.title}</h3>
                                {item.selectedExtras && item.selectedExtras.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {item.selectedExtras.map((ex, i) => (
                                      <span key={i} className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-100">
                                        <CheckCircle2 size={10} className="inline mr-1" /> {ex.optionName}
                                      </span>
                                    ))}
                                  </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-center md:col-span-2 mt-4 md:mt-0">
                            <div className="flex items-center bg-stone-50 border rounded-lg h-9">
                                <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-3"><Minus size={14}/></button>
                                <span className="font-bold w-6 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-3"><Plus size={14}/></button>
                            </div>
                        </div>

                        <div className="flex items-center justify-end md:col-span-3 mt-4 md:mt-0 gap-2">
                             <span className="font-bold text-lg text-stone-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                             <button onMouseEnter={() => setActiveTooltip(item._id)} onMouseLeave={() => setActiveTooltip(null)} className="text-stone-300"><Info size={16} /></button>
                             {activeTooltip === item._id && (
                                <div className="absolute bottom-full right-0 mb-2 w-40 bg-stone-900 text-white text-[10px] rounded p-2 z-30">
                                    <div className="flex justify-between"><span>Silver</span><span>₹{breakup?.silverValue}</span></div>
                                    <div className="flex justify-between"><span>Making</span><span>₹{breakup?.makingCost}</span></div>
                                    <div className="flex justify-between text-rose-400 font-bold"><span>GST (3%)</span><span>₹{breakup?.gst}</span></div>
                                </div>
                             )}
                        </div>

                        <button onClick={() => removeFromCart(item._id)} className="absolute top-2 right-2 text-stone-300 hover:text-rose-600"><Trash2 size={18} /></button>
                    </div>
                );
            })}
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="lg:w-[380px] space-y-6">
            <ShippingAddress onAddressSelect={(addr) => setSelectedAddress(addr)} />
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h2 className="text-xl font-serif mb-6">Summary</h2>
              <div className="space-y-3 text-sm border-b pb-6 mb-6">
                 <div className="flex justify-between text-stone-500"><span>Silver Value</span><span>₹{cartBreakdown.silverValue.toLocaleString()}</span></div>
                 <div className="flex justify-between text-stone-500"><span>Making Charges</span><span>+₹{cartBreakdown.makingCost.toLocaleString()}</span></div>
                 {cartBreakdown.extrasTotal > 0 && <div className="flex justify-between text-rose-600 font-bold"><span>Customizations</span><span>+₹{cartBreakdown.extrasTotal.toLocaleString()}</span></div>}
                 <div className="flex justify-between text-stone-500"><span>GST (3%)</span><span>+₹{cartBreakdown.gst.toLocaleString()}</span></div>
                 
                 {/* Discount Display */}
                 {discount > 0 && (
                    <div className="flex flex-col gap-1 bg-green-50 p-2 rounded border border-green-100">
                        <div className="flex justify-between text-green-700 font-bold">
                            <span>Making Discount ({appliedCoupon?.discountPercentage}%)</span>
                            <span>-₹{discount.toLocaleString()}</span>
                        </div>
                    </div>
                 )}
              </div>
              
              <div className="space-y-2 mb-6">
                  <div className="flex gap-2">
                     <input 
                        className="flex-1 px-3 py-2 bg-stone-50 border rounded-lg text-sm" 
                        placeholder="COUPON CODE" 
                        value={couponCode} 
                        onChange={(e)=>setCouponCode(e.target.value)} 
                     />
                     <button 
                        onClick={applyCoupon} 
                        disabled={isApplyingCoupon}
                        className="bg-stone-900 text-white px-4 rounded-lg text-xs hover:bg-stone-800 transition-colors"
                     >
                        {isApplyingCoupon ? "..." : "APPLY"}
                     </button>
                  </div>
                  {couponMessage && (
                      <p className={`text-[11px] ${couponMessage.type === 'success' ? 'text-green-600' : 'text-rose-600'}`}>
                          {couponMessage.text}
                      </p>
                  )}
              </div>

              <div className="flex justify-between items-end mb-6">
                  <span className="text-stone-500">Grand Total</span>
                  <span className="text-2xl font-bold">₹{total.toLocaleString()}</span>
              </div>

              <button 
                onClick={handleCheckout} 
                disabled={!selectedAddress || isProcessing} 
                className={`w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${
                    !selectedAddress ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-rose-600 text-white hover:bg-rose-700'
                }`}
              >
                  {isProcessing ? <Loader2 className="animate-spin"/> : <>Checkout <ArrowRight size={20}/></>}
              </button>
              {!selectedAddress && <p className="text-[10px] text-center mt-2 text-stone-400">Please select an address to proceed</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}