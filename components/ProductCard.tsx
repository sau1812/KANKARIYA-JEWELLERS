"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye, Flame, Plus, Check } from 'lucide-react';
import AddToWishlistButton from './AddToWishlistButton'; 
import { useCart } from '@/context/CartContext';
import { Product } from '@/src/types'; 
import { calculateSilverPrice } from '@/utils/calculatePrice';

interface ProductProps {
  item: Product; 
  silverRate: number; 
}

function ProductCard({ item, silverRate }: ProductProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  // ⚡ DYNAMIC PRICE CALCULATION
  const { finalPrice } = calculateSilverPrice(
    item.weight || 0, 
    silverRate, 
    item.makingCharges || 0, 
    item.pricingType, 
    item.fixedPrice   
  );

  const isOutOfStock = item.stockQuantity === 0;

  // --- IMAGE LOGIC ---
  const primaryImage = item.imageUrl;
  const secondaryImage = item.images && item.images.length > 1 ? item.images[1] : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    if (isOutOfStock) return;
    
    addToCart({ ...item, price: finalPrice }, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="group flex flex-col gap-2 w-full pb-3 relative transition-all duration-500 md:hover:-translate-y-1">
        
        {/* --- IMAGE CONTAINER --- */}
        <div className="relative w-full aspect-[4/5] bg-[#F9F8F6] overflow-hidden rounded-sm border border-gray-100/50">
            
            <Link href={`/product/${item.slug}`} className="block w-full h-full relative">
                {/* Desktop: Hover Reveal | Mobile: Primary Static */}
                {primaryImage && (
                    <Image 
                        src={primaryImage} 
                        alt={item.title} 
                        fill
                        className={`object-cover object-center transition-all duration-[1000ms] ease-in-out 
                          ${secondaryImage ? 'md:group-hover:opacity-0' : 'md:group-hover:scale-110'} 
                          ${isOutOfStock ? 'opacity-50 grayscale' : 'opacity-100'}`}
                        priority
                        sizes="(max-width: 768px) 50vw, 33vw"
                    />
                )}

                {/* Secondary Image (Desktop Hover Only) */}
                {secondaryImage && (
                    <Image 
                        src={secondaryImage} 
                        alt={item.title} 
                        fill
                        className="hidden md:block object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-[1000ms] ease-in-out group-hover:scale-110"
                        sizes="33vw"
                    />
                )}

                {/* 🚫 OUT OF STOCK OVERLAY */}
                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 z-10 backdrop-blur-[1px]">
                        <span className="text-kankariya-charcoal text-[9px] md:text-xs font-sans font-medium tracking-[0.15em] uppercase border border-kankariya-charcoal/10 px-3 py-1 bg-white/90">
                            Sold Out
                        </span>
                    </div>
                )}

                {/* Dark Gradient Overlay (Desktop Only) */}
                <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
            </Link>

            {/* --- WISHLIST BUTTON (Mobile/Desktop) --- */}
            <div className="absolute top-2 right-2 md:top-3 md:right-3 z-30">
              <AddToWishlistButton 
                  product={{...item, price: finalPrice}} 
                  className="scale-90 md:scale-100 text-kankariya-charcoal hover:text-kankariya-gold transition-colors" 
              />
            </div>

            {/* --- BADGES --- */}
            {!isOutOfStock && item.isHotDeal && (
                <div className="absolute top-2 left-2 md:top-3 md:left-3 z-20">
                    <span className="flex items-center gap-1 bg-kankariya-charcoal text-white text-[8px] md:text-[9px] font-sans tracking-[0.1em] uppercase px-1.5 py-0.5 md:px-2 md:py-1 shadow-sm">
                        <Flame size={10} fill="currentColor" strokeWidth={1} /> Best
                    </span>
                </div>
            )}

            {/* --- MOBILE QUICK ADD (Floating Plus Button) --- */}
            {!isOutOfStock && (
              <button 
                onClick={handleAddToCart}
                className={`md:hidden absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center z-30 shadow-lg active:scale-90 transition-all border
                  ${isAdded ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-200 text-kankariya-charcoal'}`}
              >
                {isAdded ? <Check size={14} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
              </button>
            )}

            {/* --- DESKTOP QUICK ACTIONS --- */}
            <div className="hidden md:flex absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 items-end justify-center p-4 z-20 pointer-events-none">
                 <div className="flex gap-2 w-full translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-out pointer-events-auto">
                    <button 
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-sans tracking-[0.2em] uppercase font-bold transition-all border
                            ${isAdded 
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white text-kankariya-charcoal border-white hover:bg-kankariya-gold hover:text-white hover:border-kankariya-gold shadow-2xl'
                            }`}
                    >
                        {isAdded ? <><Check size={14} strokeWidth={2} /> Added</> : 'Add to Bag'}
                    </button>

                    <Link 
                        href={`/product/${item.slug}`}
                        className="flex items-center justify-center w-12 h-12 bg-white text-kankariya-charcoal border border-white hover:text-kankariya-gold shadow-2xl transition-all"
                    >
                        <Eye size={18} strokeWidth={1.5} />
                    </Link>
                 </div>
            </div>
        </div>

        {/* --- DETAILS SECTION --- */}
        <Link href={`/product/${item.slug}`} className="flex flex-col gap-1 px-0.5 mt-0.5 text-center md:text-left md:px-1">
            <span className="text-[8px] md:text-[9px] text-stone-400 font-sans tracking-[0.15em] uppercase">
                {item.category}
            </span>

            <h3 className="text-[12px] md:text-sm font-serif font-medium text-kankariya-charcoal leading-tight line-clamp-1">
                {item.title}
            </h3>
            
            <div className="flex flex-col md:flex-row items-center md:justify-between mt-0.5 gap-1">
                <span className={`text-[14px] md:text-[15px] font-sans font-semibold ${isOutOfStock ? 'text-stone-400' : 'text-kankariya-charcoal'}`}>
                    ₹{finalPrice.toLocaleString('en-IN')} 
                </span>
                
                <div className="flex items-center gap-1.5">
                    {item.weight > 0 && (
                        <span className="text-[9px] md:text-[10px] text-stone-500 font-sans">
                            {item.weight}g
                        </span>
                    )}
                    {item.pricingType === 'fixed' && (
                        <span className="text-[8px] md:text-[9px] text-kankariya-gold font-sans tracking-[0.05em] uppercase font-bold">
                            • Fixed
                        </span>
                    )}
                </div>
            </div>
        </Link>
    </div>
  )
}

export default ProductCard;