"use client"

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Trash2, ArrowRight, Tag, ShoppingBag, Minus, Plus, Info, CheckCircle2, AlertCircle, Package 
} from 'lucide-react' // 👈 Package icon add kiya
import { useCart } from '@/context/CartContext' 
import { client } from '@/sanity/lib/client'
import imageUrlBuilder from '@sanity/image-url'
import { calculateSilverPrice } from '@/utils/calculatePrice' 

const builder = imageUrlBuilder(client)
function urlFor(source: any) { try { return builder.image(source) } catch { return null } }

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const router = useRouter();

  // --- STATE ---
  const [silverRate, setSilverRate] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null); 
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ type: string, text: string } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [stockStatus, setStockStatus] = useState<Record<string, number>>({}); 

  useEffect(() => {
    setIsClient(true);
    const fetchData = async () => {
        const rate = await client.fetch(`*[_type == "silverRate"][0].ratePerGram`);
        setSilverRate(rate || 0);

        if (cartItems.length > 0) {
          const ids = cartItems.map(item => item._id);
          const stocks = await client.fetch(`*[_type == "product" && _id in $ids]{_id, stockQuantity}`, { ids });
          const stockMap = stocks.reduce((acc: any, curr: any) => {
            acc[curr._id] = curr.stockQuantity;
            return acc;
          }, {});
          setStockStatus(stockMap);
        }
    };
    fetchData();
  }, [cartItems.length]);

  // --- CALCULATIONS ---
  const cartBreakdown = useMemo(() => {
    return cartItems.reduce((acc, item) => {
       const { breakup } = calculateSilverPrice(
         item.weight || 0, silverRate, item.makingCharges || 0, item.pricingType, item.fixedPrice
       );
       const itemExtrasTotal = item.selectedExtras?.reduce((sum, ext) => sum + ext.price, 0) || 0;

       acc.silverValue += (breakup.silverValue || 0) * item.quantity;
       acc.makingCost += (breakup.makingCost || 0) * item.quantity;
       acc.gst += (breakup.gst || 0) * item.quantity;
       acc.extrasTotal += itemExtrasTotal * item.quantity;
       return acc;
    }, { silverValue: 0, makingCost: 0, gst: 0, extrasTotal: 0 });
  }, [cartItems, silverRate]);

  useEffect(() => {
    if (appliedCoupon) {
      const discountVal = Math.round(cartBreakdown.makingCost * (appliedCoupon.discountPercentage / 100));
      setDiscount(discountVal);
    }
  }, [cartBreakdown.makingCost, appliedCoupon]);

  const subTotal = getCartTotal();
  const shipping = subTotal > 1000 ? 0 : 100; 
  const total = Math.max(0, subTotal + shipping - discount);

  // --- HANDLERS ---
  const handleCheckout = () => {
    const itemsOutOfStock = cartItems.filter(item => item.quantity > (stockStatus[item._id] || 0));
    if (itemsOutOfStock.length > 0) {
        alert(`Some items are out of stock. Please check the alerts.`);
        return;
    }
    router.push('/checkout'); 
  };

  if (!isClient) return null;

  if (cartItems.length === 0) {
    return (
       <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-stone-50">
         <div className="bg-white p-6 rounded-full shadow-sm mb-4"><ShoppingBag size={48} className="text-stone-300" /></div>
         <h2 className="text-2xl font-serif text-stone-800 mb-2">Your Cart is Empty</h2>
         <Link href="/" className="bg-rose-600 text-white px-8 py-3 rounded-full font-medium">Start Shopping</Link>
         {/* Empty cart mein bhi track order ka option de dete hain */}
         <Link href="/my-orders" className="mt-4 text-stone-400 text-sm font-bold flex items-center gap-2 hover:text-stone-600">
            <Package size={16}/> Track Existing Order
         </Link>
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
                const { breakup } = calculateSilverPrice(item.weight || 0, silverRate, item.makingCharges || 0, item.pricingType, item.fixedPrice);
                const currentAvailableStock = stockStatus[item._id] ?? 99; 
                const isInsufficient = item.quantity > currentAvailableStock;

                return (
                    <div key={item._id} className={`bg-white p-5 rounded-xl border shadow-sm md:grid md:grid-cols-12 md:items-center relative ${isInsufficient ? 'border-rose-300 bg-rose-50/30' : 'border-stone-200'}`}>
                        <div className="flex gap-4 md:col-span-6 items-center">
                            <div className="relative w-20 h-20 bg-stone-100 rounded-lg overflow-hidden border">
                                {item.imageUrl && <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />}
                            </div>
                            <div>
                                <h3 className="font-serif text-stone-900 text-lg leading-tight">{item.title}</h3>
                                {item.pricingType === 'fixed' && <span className="inline-block mt-2 bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Flat Rate</span>}
                                {isInsufficient && <p className="text-rose-600 text-[10px] font-bold mt-2"><AlertCircle size={12} className="inline"/> Only {currentAvailableStock} left</p>}
                            </div>
                        </div>

                        <div className="flex items-center justify-center md:col-span-2 mt-4 md:mt-0">
                            <div className="flex items-center bg-stone-50 border rounded-lg h-9">
                                <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-3"><Minus size={14}/></button>
                                <span className="font-bold w-6 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item._id, item.quantity + 1)} disabled={item.quantity >= currentAvailableStock} className="px-3"><Plus size={14}/></button>
                            </div>
                        </div>

                        <div className="flex items-center justify-end md:col-span-3 mt-4 md:mt-0 gap-2">
                             <span className="font-bold text-lg text-stone-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                        <button onClick={() => removeFromCart(item._id)} className="absolute top-2 right-2 text-stone-300 hover:text-rose-600"><Trash2 size={18} /></button>
                    </div>
                );
            })}
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="lg:w-[380px] space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h2 className="text-xl font-serif mb-6">Summary</h2>
              <div className="space-y-3 text-sm border-b pb-6 mb-6">
                 <div className="flex justify-between text-stone-500"><span>Items Base Value</span><span>₹{cartBreakdown.silverValue.toLocaleString('en-IN')}</span></div>
                 {cartBreakdown.makingCost > 0 && <div className="flex justify-between text-stone-500"><span>Making Charges</span><span>+₹{cartBreakdown.makingCost.toLocaleString('en-IN')}</span></div>}
                 <div className="flex justify-between text-stone-500"><span>GST (3%)</span><span>+₹{cartBreakdown.gst.toLocaleString('en-IN')}</span></div>
                 {discount > 0 && <div className="flex justify-between text-green-700 font-bold"><span>Discount</span><span>-₹{discount.toLocaleString('en-IN')}</span></div>}
              </div>

              <div className="flex justify-between items-end mb-6">
                  <span className="text-stone-500">Grand Total</span>
                  <span className="text-2xl font-bold">₹{total.toLocaleString('en-IN')}</span>
              </div>

              {/* CHECKOUT BUTTON */}
              <button 
                onClick={handleCheckout} 
                disabled={cartItems.some(item => item.quantity > (stockStatus[item._id] || 0))} 
                className="w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200 disabled:opacity-50 transition-all active:scale-95"
              >
                  Pay ₹{total.toLocaleString('en-IN')} Now <ArrowRight size={20}/>
              </button>

              {/* --- 👈 TRACK ORDER BUTTON ADDED HERE --- */}
              <div className="mt-4 pt-4 border-t border-stone-100">
                <Link href="/my-orders">
                  <button className="w-full py-3 rounded-xl font-bold text-sm flex justify-center items-center gap-2 text-stone-500 hover:text-stone-900 hover:bg-stone-50 border border-transparent hover:border-stone-100 transition-all">
                    <Package size={18}/> Track Your Orders
                  </button>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}