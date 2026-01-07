"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  Minus, Plus, ShoppingBag, Truck, ShieldCheck, Zap, 
  Star, ArrowRight 
} from 'lucide-react'
import { client } from '@/sanity/lib/client'
import { useCart } from '@/context/CartContext'
import ProductCard from './ProductCard'
import imageUrlBuilder from '@sanity/image-url'
import { Product } from '@/src/types' // 👈 Global Type import kiya

const builder = imageUrlBuilder(client)

function urlFor(source: any) {
  return builder.image(source)
}

// Props Interface (Global Product se thoda zyada data chahiye yahan)
interface ProductDetailsProps {
  product: {
    _id: string;
    title: string;
    price: number;
    originalPrice?: number;
    description: string;
    stockQuantity: number;
    image: any[]; // Raw Sanity Image Array for Gallery
    category: string;
    slug: string;
  }
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  
  // Image Setup: Pehli image ko default select kiya
  const [selectedImage, setSelectedImage] = useState<string | null>(
    product.image && product.image[0] 
      ? urlFor(product.image[0]).width(1000).url() 
      : null
  );

  const [realTimeStock, setRealTimeStock] = useState(product.stockQuantity);
  const [isCheckingStock, setIsCheckingStock] = useState(true);
  
  // Related Products ko Global 'Product' type diya
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const { addToCart } = useCart();
  const router = useRouter();

  // Price Calculation
  const totalPrice = product.price * quantity;
  // Use optional chaining just in case originalPrice is missing
  const originalPrice = product.originalPrice || 0;
  const isOutOfStock = realTimeStock === 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Fresh Stock
        const stockQuery = `*[_type == "product" && _id == $id][0].stockQuantity`;
        const freshStock = await client.fetch(stockQuery, { id: product._id });
        setRealTimeStock(freshStock);

        // 2. Fetch Related Products
        const relatedQuery = `*[_type == "product" && category == $category && _id != $id][0...4] {
          _id,
          title,
          price,
          originalPrice,
          "slug": slug.current,
          "imageUrl": image[0].asset->url, 
          category,
          stockQuantity,
          isHotDeal
        }`;
        
        const relatedData = await client.fetch(relatedQuery, { 
            category: product.category, 
            id: product._id 
        });
        
        setRelatedProducts(relatedData);

      } catch (error) {
        console.error("Data fetch failed", error);
      } finally {
        setIsCheckingStock(false);
      }
    };
    
    fetchData();
  }, [product._id, product.category]);

  const handleIncrement = () => {
    if (quantity < realTimeStock) setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  // Convert current detail to CartItem format
  const cartItemData = {
      ...product,
      imageUrl: selectedImage || "", // Ensure string
      originalPrice: originalPrice,
      isHotDeal: false // Default
  };

  const handleAddToCart = () => {
    if (quantity > realTimeStock) { alert("Stock update: Please refresh page."); return; }
    addToCart(cartItemData, quantity); // 👈 Fixed: Passing clean data
    alert(`${quantity} item(s) added to cart!`);
  };

  const handleBuyNow = () => {
    if (quantity > realTimeStock) { alert("Stock update: Please refresh page."); return; }
    addToCart(cartItemData, quantity);
    router.push('/cart'); 
  };

  return (
    <div className="flex flex-col gap-16 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        
        {/* LEFT: IMAGE GALLERY */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
             {selectedImage ? (
               <Image 
                 src={selectedImage} 
                 alt={product.title} 
                 fill 
                 className={`object-cover transition-all duration-500 hover:scale-105 cursor-zoom-in ${isOutOfStock ? "grayscale opacity-50" : ""}`}
                 priority
               />
             ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100">
                    <ShoppingBag size={40} className="mb-2 opacity-20"/>
                    <span className="text-sm font-medium">No Image Uploaded</span>
                </div>
             )}

             {isOutOfStock && (
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold text-xl uppercase tracking-widest border-2 border-white px-6 py-2">Sold Out</span>
               </div>
             )}
          </div>
          
          {/* Thumbnails */}
          {product.image && product.image.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {product.image.map((img: any, idx: number) => {
                 const imgUrl = urlFor(img).width(200).url(); 
                 return (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedImage(imgUrl)}
                    // 👇 Added suppressHydrationWarning
                    suppressHydrationWarning
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 
                      ${selectedImage === imgUrl ? 'border-rose-500 ring-2 ring-rose-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <Image src={imgUrl} alt="thumb" fill className="object-cover" />
                  </button>
                 )
              })}
            </div>
          )}
        </div>

        {/* RIGHT: PRODUCT INFO */}
        <div className="flex flex-col gap-6">
           <div>
              <div className="flex justify-between items-start">
                <span className="text-rose-600 text-sm font-bold uppercase tracking-wider bg-rose-50 px-2 py-1 rounded-md">{product.category}</span>
                <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
                    <Star fill="currentColor" size={16} /> 4.8 (120 Reviews)
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mt-3 leading-tight">{product.title}</h1>
           </div>

           <div className="border-b border-stone-200 pb-6">
              <div className="flex items-end gap-3">
                 <span className="text-4xl font-bold text-stone-900">₹{product.price.toLocaleString()}</span>
                 {originalPrice > product.price && (
                    <div className="flex flex-col mb-1">
                        <span className="text-stone-400 line-through text-sm">₹{originalPrice.toLocaleString()}</span>
                        <span className="text-green-600 text-xs font-bold">
                            {Math.round(((originalPrice - product.price) / originalPrice) * 100)}% OFF
                        </span>
                    </div>
                 )}
              </div>
              
              <div className="mt-4">
                 {!isCheckingStock && !isOutOfStock && realTimeStock < 10 && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-orange-600">Hurry! Only {realTimeStock} left</span>
                            <span className="text-stone-400">Low Stock</span>
                        </div>
                        <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full rounded-full animate-pulse" style={{ width: `${(realTimeStock / 10) * 100}%` }}></div>
                        </div>
                    </div>
                 )}
              </div>
           </div>

           <p className="text-stone-600 leading-relaxed">{product.description}</p>

           {/* ACTION AREA */}
           <div className="flex flex-col gap-6 bg-stone-50 p-6 rounded-2xl border border-stone-200">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 {/* Quantity Selector */}
                 <div className="flex items-center gap-3">
                    <span className="font-semibold text-stone-700 text-sm">Quantity</span>
                    <div className="flex items-center bg-white border border-stone-300 rounded-lg px-1 shadow-sm">
                       {/* 👇 Added suppressHydrationWarning to buttons */}
                       <button onClick={handleDecrement} disabled={isOutOfStock || quantity <= 1} suppressHydrationWarning className="p-2 hover:text-rose-600 disabled:opacity-30"><Minus size={16} /></button>
                       <span className="font-bold w-8 text-center text-stone-900">{quantity}</span>
                       <button onClick={handleIncrement} disabled={isCheckingStock || isOutOfStock || quantity >= realTimeStock} suppressHydrationWarning className="p-2 hover:text-rose-600 disabled:opacity-30"><Plus size={16} /></button>
                    </div>
                 </div>

                 {/* Total Price Display */}
                 <div className="text-right">
                    <span className="text-xs text-stone-500 block">Total Price:</span>
                    <span className="text-2xl font-bold text-stone-900">₹{totalPrice.toLocaleString()}</span>
                 </div>
              </div>

              <div className="flex gap-3">
                 <button 
                    onClick={handleAddToCart} 
                    disabled={isOutOfStock || isCheckingStock}
                    suppressHydrationWarning
                    className="flex-1 bg-white text-stone-900 border border-stone-300 py-3.5 rounded-xl font-bold hover:bg-stone-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                    <ShoppingBag size={18} /> Add to Cart
                 </button>
                 
                 <button 
                    onClick={handleBuyNow} 
                    disabled={isOutOfStock || isCheckingStock}
                    suppressHydrationWarning
                    className="flex-1 bg-rose-600 text-white py-3.5 rounded-xl font-bold hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-rose-200"
                 >
                    <Zap size={18} fill="currentColor" /> Buy Now
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 text-stone-600 text-sm">
              <div className="flex items-center gap-3"><Truck size={18} className="text-rose-500"/> <span>Free Delivery</span></div>
              <div className="flex items-center gap-3"><ShieldCheck size={18} className="text-rose-500"/> <span>1 Year Warranty</span></div>
           </div>
        </div>
      </div>

      <div className="border-t border-stone-200 pt-10">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-bold text-stone-900">You Might Also Like</h2>
              <a href="/shop" className="text-rose-600 text-sm font-semibold flex items-center gap-1 hover:underline">
                  View All <ArrowRight size={16} />
              </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.length > 0 ? (
                  relatedProducts.map((item) => (
                      <ProductCard key={item._id} item={item} />
                  ))
              ) : (
                  <p className="col-span-4 text-center text-stone-400 py-10">
                      Loading suggestions or no related items found...
                  </p>
              )}
          </div>
      </div>

    </div>
  )
}