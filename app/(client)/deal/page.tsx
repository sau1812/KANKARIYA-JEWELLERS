"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { client } from '@/sanity/lib/client'
import ProductCard from '@/components/ProductCard'
import { Flame, Filter, ChevronDown } from 'lucide-react'

// 1. Data Types
interface Product {
  _id: string;
  title: string;
  originalPrice: number;
  slug: string;
  imageUrl: string;
  category: string;
  isHotDeal: boolean;
  stockQuantity: number;
  weight: number;
  makingCharges: number;
  avgRating?: number; 
}

export default function HotDealPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [silverRate, setSilverRate] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- FILTERS STATE ---
  const [priceRange, setPriceRange] = useState('All');
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rateQuery = `*[_type == "silverRate"][0].ratePerGram`;
        
        const productsQuery = `*[_type == "product" && isHotDeal == true]{
          _id,
          title,
          originalPrice,
          "slug": slug.current,
          "imageUrl": image[0].asset->url,
          category,
          isHotDeal,
          stockQuantity,
          weight,
          makingCharges
        }`;

        const reviewsQuery = `*[_type == "review" && approved == true]{
          rating,
          "productId": product._ref
        }`;

        const [rate, allProducts, allReviews] = await Promise.all([
          client.fetch(rateQuery),
          client.fetch(productsQuery),
          client.fetch(reviewsQuery)
        ]);

        // Combine Ratings Logic
        const productsWithRatings = allProducts.map((product: any) => {
          const productReviews = allReviews.filter((r: any) => r.productId === product._id);
          const totalRating = productReviews.reduce((acc: number, curr: any) => acc + curr.rating, 0);
          const avg = productReviews.length > 0 ? totalRating / productReviews.length : 0;
          
          return {
            ...product,
            avgRating: Math.round(avg * 10) / 10
          };
        });

        setSilverRate(rate || 0);
        setProducts(productsWithRatings);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- FILTER LOGIC ---
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const basePrice = (product.weight * silverRate) + product.makingCharges;
      const finalPrice = basePrice + (basePrice * 0.03); // GST 3%

      let matchesPrice = true;
      if (priceRange === 'under5k') matchesPrice = finalPrice < 5000;
      else if (priceRange === '5k-10k') matchesPrice = finalPrice >= 5000 && finalPrice <= 10000;
      else if (priceRange === 'above10k') matchesPrice = finalPrice > 10000;

      const matchesRating = (product.avgRating || 0) >= minRating;
      return matchesPrice && matchesRating;
    });
  }, [products, priceRange, minRating, silverRate]);

  if (loading) return <div className="h-screen flex items-center justify-center font-serif italic text-stone-400 animate-pulse">Loading Exclusive Deals...</div>;

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="container mx-auto px-4">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col items-center text-center mb-8">
           <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Flame size={32} className="text-orange-500 fill-orange-500" />
           </div>
           <h1 className="text-3xl md:text-5xl font-serif text-stone-900 mb-4 capitalize">
             best seller & Offers
           </h1>
           <p className="text-stone-500 max-w-xl text-sm md:text-base">
             Grab these limited-time offers before they run out! Handpicked exclusive jewelry at unbeatable prices.
           </p>
        </div>

        {/* --- NEW: FILTER BAR SECTION --- */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <div className="relative">
            <select 
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="appearance-none bg-stone-50 border border-stone-200 px-6 py-2.5 pr-12 rounded-full text-[10px] font-black uppercase tracking-widest text-stone-700 focus:outline-none focus:border-orange-500 transition-all cursor-pointer shadow-sm"
            >
              <option value="All">All Prices</option>
              <option value="under5k">Under ₹5,000</option>
              <option value="5k-10k">₹5,000 - ₹10,000</option>
              <option value="above10k">Above ₹10,000</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="appearance-none bg-stone-50 border border-stone-200 px-6 py-2.5 pr-12 rounded-full text-[10px] font-black uppercase tracking-widest text-stone-700 focus:outline-none focus:border-orange-500 transition-all cursor-pointer shadow-sm"
            >
              <option value="0">All Ratings</option>
              <option value="4">4★ & Above</option>
              <option value="3">3★ & Above</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>

          {(priceRange !== 'All' || minRating !== 0) && (
            <button 
              onClick={() => {setPriceRange('All'); setMinRating(0);}}
              className="text-orange-600 text-[10px] font-black uppercase tracking-widest hover:underline ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* --- Product Grid --- */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product: Product) => (
              <ProductCard key={product._id} item={product} silverRate={silverRate} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-stone-50 rounded-xl">
             <p className="text-stone-400 text-lg font-serif italic">No deals matching your current filters.</p>
          </div>
        )}

      </div>
    </div>
  )
}