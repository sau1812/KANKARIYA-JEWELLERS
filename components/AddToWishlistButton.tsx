"use client"
import React from 'react'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/context/WishlistContext'
import { Product } from '@/src/types'

interface AddToWishlistBtnProps {
    product: Product;
    className?: string;
}

const AddToWishlistButton = ({ product, className }: AddToWishlistBtnProps) => {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    
    const isIn = isInWishlist(product._id);

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isIn) {
            removeFromWishlist(product._id);
        } else {
            addToWishlist(product);
        }
    };

    return (
        <button
            onClick={handleWishlist}
            // 👇 Ye line add karein (Extension error fix karne ke liye)
            suppressHydrationWarning 
            className={`p-2 rounded-full bg-white shadow-md transition-all hover:scale-110 active:scale-95 ${className}`}
        >
            <Heart 
                size={18} 
                className={isIn ? "fill-rose-500 text-rose-500" : "text-stone-400"} 
            />
        </button>
    )
}

export default AddToWishlistButton