"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext' // 👈 Import Cart Context

function CartIcon() {
  const { cartItems } = useCart();
  const [isClient, setIsClient] = useState(false);

  // Hydration Fix: Ensure this runs only on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate total quantity of items (e.g. 2 rings + 1 necklace = 3)
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <Link 
      href="/cart" 
      className="relative group p-2 flex items-center justify-center transition-all duration-200 active:scale-95"
    >
      {/* Bag Icon */}
      <ShoppingBag 
        className={`w-5 h-5 transition-colors duration-300 ${totalItems > 0 ? 'text-black' : 'text-stone-600'} group-hover:text-black`} 
        strokeWidth={1.5} 
      />
      
      {/* Notification Badge - Only show if items > 0 */}
      {isClient && totalItems > 0 && (
        <span className="absolute top-0 right-0 bg-rose-600 text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white shadow-sm animate-in fade-in zoom-in duration-300">
          {totalItems}
        </span>
      )}
    </Link>
  )
}

export default CartIcon