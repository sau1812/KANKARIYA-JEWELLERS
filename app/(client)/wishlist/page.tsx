"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleMoveToCart = (product: any) => {
    addToCart(product, 1);
    removeFromWishlist(product._id);
    alert("Moved to Cart!");
  };

  // 👇 SPECIAL HELPER: Har tarah ki image ko handle karega
  const getImageUrl = (item: any) => {
    // 1. Agar Product Card se aaya hai (imageUrl string hai)
    if (item.imageUrl) return item.imageUrl;

    // 2. Agar image field khud string hai
    if (typeof item.image === "string") return item.image;

    // 3. Agar Sanity Object Array hai
    if (item.image && Array.isArray(item.image) && item.image[0]) {
      return urlFor(item.image[0])?.width(400).url();
    }

    // 4. Agar Single Sanity Object hai
    if (item.image && item.image.asset) {
      return urlFor(item.image)?.width(400).url();
    }

    return null;
  };

  if (!isClient) return null;

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-stone-50">
        <Heart size={48} className="text-stone-300 mb-4" />
        <h2 className="text-2xl font-serif text-stone-800 mb-2">Your Wishlist is Empty</h2>
        <p className="text-stone-500 mb-6">Start saving your favorite jewelry pieces.</p>
        <Link href="/" className="bg-stone-900 text-white px-8 py-3 rounded-full font-medium hover:bg-rose-600 transition-all">
          Browse Collection
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl font-serif text-stone-900 mb-8 flex items-center gap-2">
           <Heart className="text-rose-500 fill-rose-500" /> My Wishlist ({wishlist.length})
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {wishlist.map((item) => {
              // 👇 Get Correct Image URL
              const finalImageUrl = getImageUrl(item);

              return (
                 <div key={item._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 group hover:shadow-md transition-all">
                    {/* Image Area */}
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
                       
                       {/* Remove Button */}
                       <button 
                          onClick={() => removeFromWishlist(item._id)}
                          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-stone-500 hover:text-red-500 hover:bg-white transition-all shadow-sm z-10"
                          title="Remove"
                       >
                          <Trash2 size={16} />
                       </button>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                       <Link href={`/product/${item.slug || '#'}`}>
                          <h3 className="font-serif text-lg text-stone-900 line-clamp-1 mb-1 hover:text-rose-600 transition-colors">
                              {item.title}
                          </h3>
                       </Link>
                       <p className="text-rose-600 font-bold mb-4">₹{item.price.toLocaleString()}</p>
                       
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
      </div>
    </div>
  )
}