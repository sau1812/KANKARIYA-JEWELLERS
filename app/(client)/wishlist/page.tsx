"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Trash2, BellRing, CheckCircle2, AlertCircle } from 'lucide-react' 
import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import { client } from '@/sanity/lib/client'
import imageUrlBuilder from '@sanity/image-url'

const builder = imageUrlBuilder(client)

function urlFor(source: any) {
  try {
    return builder.image(source)
  } catch (error) {
    return null
  }
}

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  const [isClient, setIsClient] = useState(false);
  const [silverRate, setSilverRate] = useState<number>(0);

  // Marketing Form State
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: "" });

  useEffect(() => {
    setIsClient(true);
    const fetchRate = async () => {
      try {
        const query = `*[_type == "silverRate"][0].ratePerGram`;
        const rate = await client.fetch(query);
        setSilverRate(rate || 0);
      } catch (error) {
        console.error("Failed to fetch silver rate", error);
      }
    };
    fetchRate();
  }, []);

  const calculatePrice = (item: any) => {
    if (item.weight && item.makingCharges && silverRate) {
      return (item.weight * silverRate) + item.makingCharges;
    }
    return item.price || 0;
  };

  const handleMoveToCart = (product: any) => {
    const finalPrice = calculatePrice(product);
    const productWithPrice = { ...product, price: finalPrice };
    addToCart(productWithPrice, 1);
    removeFromWishlist(product._id);
    // Alert hatakar yaha toast ya silent notification use kar sakte hain
  };

  // Marketing Handle Function (Alert Hata Diya Hai)
  const handleSubscribe = async () => {
    if (phone.length !== 10) {
        setStatus({ type: 'error', msg: "Please enter a valid 10-digit number" });
        return;
    }
    
    setIsSubmitting(true);
    setStatus({ type: null, msg: "" });

    try {
      const res = await fetch("/api/marketing/subscribe", {
        method: "POST",
        body: JSON.stringify({ phoneNumber: phone }),
      });
      
      if (res.ok) {
        setStatus({ type: 'success', msg: "✅ Success! You'll receive updates on WhatsApp soon." });
        setPhone("");
      } else {
        setStatus({ type: 'error', msg: "❌ Server issue. Please try again." });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: "❌ Error saving number." });
    } finally {
      setIsSubmitting(false);
      // 3 second baad message hide karne ke liye
      setTimeout(() => setStatus({ type: null, msg: "" }), 4000);
    }
  };

  const getImageUrl = (item: any) => {
    if (item.imageUrl) return item.imageUrl;
    if (typeof item.image === "string") return item.image;
    if (item.image && Array.isArray(item.image) && item.image[0]) {
      return urlFor(item.image[0])?.width(400).url();
    }
    if (item.image && item.image.asset) {
      return urlFor(item.image)?.width(400).url();
    }
    return null;
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        {wishlist.length === 0 ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
            <Heart size={48} className="text-stone-300 mb-4" />
            <h2 className="text-2xl font-serif text-stone-800 mb-2">Your Wishlist is Empty</h2>
            <p className="text-stone-500 mb-6">Start saving your favorite jewelry pieces.</p>
            <Link href="/" className="bg-stone-900 text-white px-8 py-3 rounded-full font-medium hover:bg-rose-600 transition-all">
              Browse Collection
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-serif text-stone-900 mb-8 flex items-center gap-2">
               <Heart className="text-rose-500 fill-rose-500" /> My Wishlist ({wishlist.length})
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {wishlist.map((item) => {
                 const finalImageUrl = getImageUrl(item);
                 const finalPrice = calculatePrice(item);

                 return (
                     <div key={item._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 group hover:shadow-md transition-all">
                        <div className="relative h-64 bg-stone-100 overflow-hidden">
                           {finalImageUrl ? (
                              <Image 
                                src={finalImageUrl} 
                                alt={item.title} 
                                fill 
                                className="object-cover group-hover:scale-105 transition-transform duration-500" 
                              />
                           ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                                 <ShoppingBag size={30} className="mb-2 opacity-30"/>
                                 <span className="text-xs">No Image</span>
                              </div>
                           )}
                           
                           <button 
                             onClick={() => removeFromWishlist(item._id)}
                             className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-stone-500 hover:text-red-500 hover:bg-white transition-all shadow-sm z-10"
                             title="Remove"
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>

                        <div className="p-5">
                           <Link href={`/product/${item.slug || '#'}`}>
                              <h3 className="font-serif text-lg text-stone-900 line-clamp-1 mb-1 hover:text-rose-600 transition-colors">
                                 {item.title}
                              </h3>
                           </Link>
                           
                           <p className="text-rose-600 font-bold mb-4">
                             {silverRate > 0 ? `₹${finalPrice.toLocaleString()}` : "Loading Price..."}
                           </p>
                           
                           <button 
                             onClick={() => handleMoveToCart(item)}
                             className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
                           >
                             <ShoppingBag size={18} /> Move to Cart
                           </button>
                        </div>
                     </div>
                 )
               })}
            </div>
          </>
        )}

        {/* --- 📢 MARKETING SECTION --- */}
        <div className="mt-20 max-w-2xl mx-auto bg-stone-100 border-2 border-dashed border-stone-300 rounded-3xl p-8 text-center shadow-inner">
           <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-sm text-rose-600">
              <BellRing size={28} />
           </div>
           <h2 className="text-2xl font-serif text-stone-900 mb-2">Notify on New Offers!</h2>
           <p className="text-stone-600 mb-6">
             Naya product launch ya special discount aane par direct WhatsApp par update payein.
           </p>
           
           <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-4">
              <input 
                  type="tel" 
                  placeholder="Enter 10 digit number"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full sm:w-72 px-5 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500 text-center font-bold tracking-widest"
              />
              <button 
                  onClick={handleSubscribe}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-2xl font-bold transition-all disabled:opacity-50 shadow-md active:scale-95"
              >
                  {isSubmitting ? "Registering..." : "Notify Me"}
              </button>
           </div>

           {/* --- 🔄 IN-UI MESSAGES (Alert Replacement) --- */}
           {status.type && (
             <div className={`flex items-center justify-center gap-2 text-sm font-bold animate-pulse ${status.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {status.msg}
             </div>
           )}

           <p className="mt-4 text-[10px] text-stone-400 uppercase tracking-tighter">
             *Safe & Secure | No Spam Policy
           </p>
        </div>
      </div>
    </div>
  )
}