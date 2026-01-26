"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { client } from '@/sanity/lib/client'
import { Package, Clock, CheckCircle, XCircle, X, Eye, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import imageUrlBuilder from '@sanity/image-url'
import { motion, AnimatePresence } from 'framer-motion'

const builder = imageUrlBuilder(client)
function urlFor(source: any) {
  if (!source) return null; // Safety check
  try { return builder.image(source) } catch (error) { return null }
}

export default function MyOrdersPage() {
  const { user, isLoaded } = useUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) router.push('/sign-in');
    
    const fetchOrders = async () => {
      if (user?.id) {
        const query = `*[_type == "order" && clerkUserId == $userId] | order(orderDate desc) {
          _id, orderNumber, orderDate, totalPrice, status,
          products[]{
            product->{ title, image, "slug": slug.current },
            quantity, priceAtPurchase,
            selectedExtras[]{ optionName, price, description }
          }
        }`;
        try {
            const data = await client.fetch(query, { userId: user.id });
            setOrders(data);
        } catch (e) { console.error("Fetch Error:", e); }
        finally { setLoading(false); }
      }
    };
    fetchOrders();
  }, [user, isLoaded, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif italic text-stone-400">Loading your treasures...</div>;

  return (
    <div className="min-h-screen bg-[#FDFCFB] py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-serif text-stone-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
            <ShoppingBag size={48} className="mx-auto text-stone-200 mb-4" />
            <h2 className="text-xl font-serif text-stone-800">No orders found</h2>
            <Link href="/" className="text-rose-600 font-bold mt-4 inline-block hover:underline">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <div key={order._id} className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="bg-stone-50 p-4 border-b flex flex-wrap justify-between items-center gap-4 text-sm font-medium">
                  <div className="flex gap-6">
                    <div>
                      <p className="text-stone-400 text-[10px] uppercase font-bold tracking-widest">Order Number</p>
                      <p className="font-mono text-stone-700">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-stone-400 text-[10px] uppercase font-bold tracking-widest">Total Price</p>
                      <p className="text-stone-700 font-bold">₹{order.totalPrice?.toLocaleString()}</p>
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="p-6 divide-y divide-stone-50">
                  {order.products?.map((item: any, idx: number) => {
                    const imgSource = item.product?.image?.[0];
                    const imgUrl = imgSource ? urlFor(imgSource)?.url() : null;

                    return (
                        <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden border shrink-0 bg-stone-50">
                            {imgUrl && <Image src={imgUrl} alt="img" fill className="object-cover" />}
                            </div>
                            <div>
                            <h4 className="font-serif text-stone-800 leading-tight">{item.product?.title}</h4>
                            <p className="text-[11px] text-stone-400 mt-1 uppercase font-bold">Qty: {item.quantity}</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setSelectedItem({ ...item, status: order.status })}
                            className="bg-stone-900 text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-stone-800 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
                        >
                            <Eye size={14} /> View Item
                        </button>
                        </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- PREMIUM PRODUCT POP-UP (Matches Your Screenshot Style) --- */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 p-2 hover:bg-stone-50 rounded-full text-stone-400"><X size={20}/></button>

              <h2 className="text-2xl font-serif mb-6 text-stone-900">Price Breakdown</h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-2xl border border-stone-100">
                   <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border bg-white">
                      {selectedItem.product?.image?.[0] && (
                        <Image 
                          src={urlFor(selectedItem.product.image[0])?.url() || ""} 
                          alt="img" 
                          fill 
                          className="object-cover" 
                        />
                      )}
                   </div>
                   <div>
                      <p className="text-sm font-bold text-stone-800 mb-1">{selectedItem.product?.title}</p>
                      <StatusBadge status={selectedItem.status} />
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500 font-medium italic">Silver & Making</span>
                    <span className="text-stone-900 font-bold">₹{selectedItem.priceAtPurchase?.toLocaleString()}</span>
                  </div>

                  {selectedItem.selectedExtras && selectedItem.selectedExtras.length > 0 && (
                    <div className="pt-2 border-t border-stone-100 space-y-2">
                      <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Customizations</p>
                      {selectedItem.selectedExtras.map((ex: any, i: number) => (
                        <div key={i} className="flex justify-between text-xs">
                          <div>
                            <span className="text-stone-700 font-bold block">• {ex.optionName}</span>
                            {ex.description && <span className="text-[10px] text-stone-400 italic">"{ex.description}"</span>}
                          </div>
                          <span className="text-rose-600 font-bold">+₹{ex.price}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 border-t-2 border-stone-900 flex justify-between items-center">
                    <div className="flex flex-col">
                       <span className="text-xs text-stone-400 uppercase font-bold">Grand Total</span>
                       <span className="text-stone-500 text-[10px]">Qty: {selectedItem.quantity}</span>
                    </div>
                    <span className="text-2xl font-serif text-stone-900 font-bold">
                       ₹{(selectedItem.priceAtPurchase * selectedItem.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedItem(null)}
                className="mt-8 w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-stone-800 transition-all shadow-lg active:scale-95"
              >
                Done
              </button>
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
      processing: "bg-blue-50 text-blue-700 border-blue-100",
      shipped: "bg-purple-50 text-purple-700 border-purple-100",
      delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
      cancelled: "bg-rose-50 text-rose-700 border-rose-100",
   };
   const style = styles[status] || "bg-gray-50 text-gray-700";
   return (
     <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${style}`}>
        {status}
     </span>
   )
}