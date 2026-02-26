"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, ShoppingBag, Eye, Flame, Plus, Check } from 'lucide-react'
import AddToWishlistButton from './AddToWishlistButton' 
import { useCart } from '@/context/CartContext'
import { Product } from '@/src/types' 
import { calculateSilverPrice } from '@/utils/calculatePrice' // 👈 Import Calculation Logic

interface ProductProps {
  item: Product; 
  silverRate: number; // 👈 Naya Prop: Aaj ka Silver Rate parent se aayega
}

function ProductCard({ item, silverRate }: ProductProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  // ⚡ DYNAMIC PRICE CALCULATION
  const { finalPrice } = calculateSilverPrice(item.weight, silverRate, item.makingCharges);

  const isOutOfStock = item.stockQuantity === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    if (isOutOfStock) return;
    
    // 🛒 Cart me Calculated Price bhejna zaroori hai
    // Hum item ki existing properties le rahe hain aur 'price' ko override kar rahe hain
    addToCart({ ...item, price: finalPrice }, 1);
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="group flex flex-col gap-2 bg-white w-full rounded-xl hover:shadow-xl border border-stone-200 transition-all duration-300 pb-2 overflow-hidden relative">
        
        {/* --- IMAGE CONTAINER --- */}
        <div className="relative w-full aspect-[4/5] bg-stone-100 overflow-hidden">
            
            <Link href={`/product/${item.slug}`} className="block w-full h-full relative">
                {item.imageUrl ? (
                    <Image 
                        src={item.imageUrl} 
                        alt={item.title} 
                        fill
                        className={`object-cover transition-transform duration-500 ease-in-out group-hover:scale-110 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <ShoppingBag size={24} />
                    </div>
                )}

                {/* 🚫 OUT OF STOCK OVERLAY */}
                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 backdrop-blur-[1px]">
                        <span className="text-white text-xs md:text-sm font-bold tracking-widest uppercase border border-white px-3 py-1 bg-black/20">
                            Sold Out
                        </span>
                    </div>
                )}
            </Link>

            {/* --- WISHLIST BUTTON --- */}
            <AddToWishlistButton 
                product={{...item, price: finalPrice}} // Wishlist me bhi updated price store karein
                className="absolute top-2 right-2 z-20" 
            />

            {/* --- BADGES --- */}
            {!isOutOfStock && (
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {item.isHotDeal && (
                        <span className="flex items-center gap-1 bg-orange-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm w-fit backdrop-blur-[2px]">
                            <Flame size={10} fill="currentColor" /> HOT
                        </span>
                    )}
                    {/* Sale Badge Hata Diya (No MRP) */}
                </div>
            )}

            {/* --- MOBILE ADD TO CART --- */}
            {!isOutOfStock && (
                <button 
                    onClick={handleAddToCart}
                    className={`md:hidden absolute bottom-2 right-2 flex items-center justify-center w-9 h-9 rounded-full shadow-lg active:scale-90 transition-all z-20
                        ${isAdded ? 'bg-green-600 text-white' : 'bg-white text-black'}`}
                >
                    {isAdded ? <Check size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
                </button>
            )}

            {/* --- DESKTOP HOVER OVERLAY --- */}
            <div className="hidden md:flex absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-end justify-center p-4 z-10 pointer-events-none">
                 <div className="flex gap-2 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300 pointer-events-auto">
                    
                    <button 
                        onClick={handleAddToCart}
                        suppressHydrationWarning={true}
                        disabled={isOutOfStock}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded shadow-lg text-xs font-bold transition-colors
                            ${isOutOfStock 
                                ? 'bg-stone-300 text-stone-500 cursor-not-allowed' 
                                : isAdded 
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-white text-stone-900 hover:bg-stone-50'
                            }`}
                    >
                        {isOutOfStock 
                            ? 'OUT OF STOCK' 
                            : isAdded 
                                ? <><Check size={16} /> ADDED</>
                                : 'ADD TO CART'
                        }
                    </button>

                    <Link 
                        href={`/product/${item.slug}`}
                        className="flex items-center justify-center w-10 h-10 bg-white text-stone-900 rounded shadow-lg hover:text-rose-600"
                    >
                        <Eye size={18} />
                    </Link>
                 </div>
            </div>
        </div>

        {/* --- DETAILS SECTION --- */}
        <Link href={`/product/${item.slug}`} className="flex flex-col gap-1 px-2.5 pt-1">
            <h3 className="text-[13px] md:text-sm font-medium text-stone-700 leading-tight truncate">
                {item.title}
            </h3>
            
            <div className="flex items-center gap-2">
                {/* 💰 DYNAMIC PRICE DISPLAY */}
                <span className={`text-base md:text-lg font-bold ${isOutOfStock ? 'text-stone-400' : 'text-stone-900'}`}>
                    ₹{finalPrice.toLocaleString()} 
                </span>
                
                {/* Weight Info (Optional but helpful) */}
                <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                    {item.weight}g
                </span>
            </div>
             <span className="text-[10px] text-stone-400 uppercase tracking-wider">
                {item.category}
            </span>
        </Link>
    </div>
  )
}

export default ProductCard