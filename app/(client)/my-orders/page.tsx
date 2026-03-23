"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { client } from '@/sanity/lib/client'
import { Package, Clock, CheckCircle, XCircle, X, Eye, ShoppingBag, Phone, Search, Loader2, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import imageUrlBuilder from '@sanity/image-url'
import { motion, AnimatePresence } from 'framer-motion'

const builder = imageUrlBuilder(client)
function urlFor(source: any) {
  if (!source) return null;
  try { return builder.image(source) } catch (error) { return null }
}

export default function MyOrdersPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [guestPhone, setGuestPhone] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  
  // Professional Error States
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      fetchOrders(user.id, null);
    }
  }, [user, isLoaded, isSignedIn]);

  const fetchOrders = async (userId: string | null, phone: string | null) => {
    setLoading(true);
    setError(null);

    const query = userId 
      ? `*[_type == "order" && clerkUserId == $userId] | order(orderDate desc)`
      : `*[_type == "order" && phone == $phone] | order(orderDate desc)`;
    
    const params = userId ? { userId } : { phone };

    try {
        const data = await client.fetch(`${query} {
          _id, orderNumber, orderDate, totalPrice, status,
          products[]{
            product->{ title, image, "slug": slug.current },
            quantity, priceAtPurchase,
            selectedExtras[]{ optionName, price, description }
          }
        }`, params);

        if (!data || data.length === 0) {
            if (!userId) setError("no_orders"); // Phone search me kuch nahi mila
        }
        setOrders(data);
        setHasSearched(true);
    } catch (e) { 
        setError("server_error");
    } finally { 
        setLoading(false); 
    }
  };

  const handleGuestSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Validation: Professional Check
    if (!/^\d{10}$/.test(guestPhone)) {
        setError("invalid_format");
        return;
    }

    fetchOrders(null, guestPhone);
  };

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center font-serif italic text-stone-400 text-sm tracking-widest animate-pulse">Loading Your Treasures...</div>;

  return (
    <div className="min-h-screen bg-[#FDFCFB] py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        
        <div className="flex items-center gap-3 mb-10">
            <Package className="text-stone-900" size={32} strokeWidth={1.5} />
            <h1 className="text-4xl font-serif text-stone-900 tracking-tight">Order Tracking</h1>
        </div>

        {/* --- PROFESSIONAL SEARCH SECTION --- */}
        {!isSignedIn && (!hasSearched || error === "no_orders") && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white p-10 rounded-[32px] shadow-xl shadow-stone-200/50 border border-stone-100 mb-12 text-center"
            >
                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Phone className={error ? "text-rose-500" : "text-stone-400"} size={24} />
                </div>
                <h2 className="text-2xl font-serif text-stone-900 mb-2">Track as Guest</h2>
                <p className="text-stone-500 mb-8 text-sm max-w-sm mx-auto leading-relaxed">Enter the 10-digit mobile number used for your purchase.</p>
                
                <form onSubmit={handleGuestSearch} className="max-w-lg mx-auto">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm border-r pr-3 group-focus-within:text-stone-900 transition-colors">🇮🇳</span>
                            <input 
                                type="tel" 
                                placeholder="90211XXXXX" 
                                className={`w-full pl-16 pr-4 py-4 bg-stone-50 border ${error === 'invalid_format' ? 'border-rose-500 ring-1 ring-rose-500' : 'border-stone-200'} rounded-2xl focus:ring-2 focus:ring-stone-900 focus:bg-white outline-none transition-all font-mono text-lg tracking-widest`}
                                value={guestPhone}
                                onChange={(e) => {
                                    setGuestPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); // Sirf numbers allow karo
                                    setError(null);
                                }}
                            />
                        </div>
                        <button type="submit" disabled={loading} className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin" size={20}/> : <><Search size={18}/> Track Order</>}
                        </button>
                    </div>

                    {/* Inline Error Messages */}
                    <AnimatePresence>
                        {error === "invalid_format" && (
                            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-rose-600 text-xs font-bold mt-3 flex items-center justify-center gap-1">
                                <AlertCircle size={14}/> Please enter a valid 10-digit mobile number
                            </motion.p>
                        )}
                        {error === "no_orders" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                                <p className="text-rose-800 text-sm font-medium">No orders found for <span className="font-bold underline">{guestPhone}</span></p>
                                <p className="text-rose-600 text-[10px] mt-1 uppercase font-bold tracking-wider">Please check the number and try again</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </motion.div>
        )}

        {/* --- ORDERS LIST --- */}
        {loading ? (
            <div className="flex flex-col items-center py-20 text-stone-300">
                <Loader2 className="animate-spin mb-4" size={40}/>
                <p className="text-sm font-bold tracking-widest uppercase">Fetching Records...</p>
            </div>
        ) : (
          <div className="space-y-8">
            {orders.length > 0 && orders.map((order: any) => (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                    key={order._id} 
                    className="bg-white rounded-[32px] shadow-sm border border-stone-100 overflow-hidden hover:shadow-xl transition-all duration-500"
                >
                    <div className="bg-stone-50/50 p-6 border-b flex flex-wrap justify-between items-center gap-4">
                      <div className="flex gap-8">
                        <div>
                          <p className="text-stone-400 text-[10px] uppercase font-black tracking-widest mb-1">Order ID</p>
                          <p className="font-mono text-stone-800 font-bold">#{order.orderNumber}</p>
                        </div>
                        <div>
                          <p className="text-stone-400 text-[10px] uppercase font-black tracking-widest mb-1">Total</p>
                          <p className="text-stone-900 font-bold">₹{order.totalPrice?.toLocaleString()}</p>
                        </div>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="p-8 space-y-6">
                      {order.products?.map((item: any, idx: number) => {
                        const imgSource = item.product?.image?.[0];
                        const imgUrl = imgSource ? urlFor(imgSource)?.url() : null;
                        return (
                            <div key={idx} className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="relative w-20 h-20 rounded-[20px] overflow-hidden border shrink-0 bg-stone-50">
                                        {imgUrl && <Image src={imgUrl} alt="product" fill className="object-cover" />}
                                    </div>
                                    <div>
                                        <h4 className="font-serif text-lg text-stone-900 leading-tight mb-1">{item.product?.title}</h4>
                                        <p className="text-[11px] text-stone-500 font-bold">QTY: {item.quantity}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedItem({ ...item, status: order.status })} className="border border-stone-200 text-stone-900 px-6 py-2.5 rounded-2xl text-xs font-bold hover:bg-stone-900 hover:text-white transition-all">Details</button>
                            </div>
                        )
                      })}
                    </div>
                </motion.div>
            ))}
            
            {isSignedIn && orders.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[40px] border border-stone-100">
                    <ShoppingBag size={48} className="mx-auto text-stone-100 mb-4" />
                    <h2 className="text-xl font-serif text-stone-800">You haven't placed any orders yet</h2>
                    <Link href="/" className="text-rose-600 font-bold mt-4 inline-block">Start Shopping →</Link>
                </div>
            )}
          </div>
        )}
      </div>

      {/* --- PRICE BREAKDOWN POP-UP --- */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl overflow-hidden">
              <button onClick={() => setSelectedItem(null)} className="absolute top-8 right-8 p-2 hover:bg-stone-50 rounded-full text-stone-400"><X size={20}/></button>
              <h2 className="text-3xl font-serif mb-8 text-stone-900">Price Summary</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-[24px] border border-stone-100">
                    <div className="relative w-20 h-20 rounded-[18px] overflow-hidden shrink-0 border bg-white">
                      {selectedItem.product?.image?.[0] && <Image src={urlFor(selectedItem.product.image[0])?.url() || ""} alt="p" fill className="object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-stone-900 leading-tight mb-2">{selectedItem.product?.title}</p>
                      <StatusBadge status={selectedItem.status} />
                    </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm"><span className="text-stone-400">Unit Price</span><span className="text-stone-900 font-bold">₹{selectedItem.priceAtPurchase?.toLocaleString()}</span></div>
                  <div className="pt-4 border-t-2 border-stone-900 flex justify-between items-center">
                    <span className="text-[10px] text-stone-400 uppercase font-black tracking-widest">Total (Qty: {selectedItem.quantity})</span>
                    <span className="text-2xl font-serif text-stone-900 font-bold">₹{(selectedItem.priceAtPurchase * selectedItem.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="mt-8 w-full bg-stone-900 text-white py-4 rounded-[20px] font-bold text-sm shadow-xl active:scale-[0.98]">Done</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
   const styles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-100",
      paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
      delivered: "bg-stone-900 text-white border-stone-900",
      cancelled: "bg-rose-50 text-rose-700 border-rose-100",
   };
   const style = styles[status] || "bg-gray-50 text-gray-700";
   return <span className={`px-4 py-1.5 rounded-full text-[9px] font-black border uppercase tracking-widest ${style}`}>{status}</span>;
}