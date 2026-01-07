"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/context/WishlistContext'

const FavoriteButton = () => {
  const { wishlist } = useWishlist();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const count = wishlist.length;

  return (
    <Link href="/wishlist" className="relative group p-2 flex items-center justify-center transition-all active:scale-95">
      <Heart 
        className={`w-5 h-5 transition-colors duration-300 ${count > 0 ? 'text-rose-500 fill-rose-500' : 'text-stone-600 group-hover:text-rose-500'}`} 
        strokeWidth={1.5}
      />
      
      {/* Badge */}
      {isClient && count > 0 && (
        <span className="absolute top-0 right-0 bg-rose-600 text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white">
          {count}
        </span>
      )}
    </Link>
  )
}

export default FavoriteButton