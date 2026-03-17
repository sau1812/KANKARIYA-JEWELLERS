"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { client } from '@/sanity/lib/client'
import ProductCard from '@/components/ProductCard'
import { Filter, ChevronDown } from 'lucide-react'

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
  pricingType?: 'calculated' | 'fixed';
  fixedPrice?: number;
}

export default function ManBracelet() {
  const [products, setProducts] = useState<Product[]>([]);
  const [silverRate, setSilverRate] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sirf Price Range ka state bacha hai
  const [priceRange, setPriceRange] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rateQuery = `*[_type == "silverRate"][0].ratePerGram`;
        
        // Basic product data fetch
        const productsQuery = `*[_type == "product" && category == "ring" && (gender == "women" || gender == "unisex")]{
          _id,
          title,
          originalPrice,
          "slug": slug.current,
          "imageUrl": image[0].asset->url,
          category,
          isHotDeal,
          stockQuantity,
          weight,
          makingCharges,
          pricingType,
          fixedPrice
        }`;

        // Ab sirf Rate aur Products fetch kar rahe hain (Reviews hata diya)
        const [rate, allProducts] = await Promise.all([
          client.fetch(rateQuery),
          client.fetch(productsQuery)
        ]);

        setSilverRate(rate || 0);
        setProducts(allProducts); // Direct set kar diya bina mapping ke
      } catch (err) {
        console.error("Data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // ⚡ Price calculation logic
      let basePrice = 0;
      
      if (product.pricingType === 'fixed') {
        basePrice = product.fixedPrice || 0;
      } else {
        basePrice = (product.weight * silverRate) + product.makingCharges;
      }
      
      const finalPrice = basePrice + (basePrice * 0.03); // 3% GST

      // Price Filter logic
      let matchesPrice = true;
      if (priceRange === 'under5k') matchesPrice = finalPrice < 5000;
      else if (priceRange === '5k-10k') matchesPrice = finalPrice >= 5000 && finalPrice <= 10000;
      else if (priceRange === 'above10k') matchesPrice = finalPrice > 10000;

      return matchesPrice;
    });
  }, [products, priceRange, silverRate]);

  // Handle Loading State
  if (loading) return (
     <div className="h-screen flex items-center justify-center font-serif italic text-stone-400">
         Loading Men's Watches...
     </div>
  );

  return (
    <div className="bg-stone-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="mb-8 border-b border-stone-200 pb-6 flex flex-col md:flex-row justify-between items-end gap-6">
           <div>
               <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-2">Men's Watches</h1>
               <p className="text-stone-500 text-sm md:text-base max-w-lg">Bold, durable, and crafted for the modern man.</p>
           </div>
           
           <div className="flex items-center gap-2 text-stone-400 text-sm font-medium uppercase tracking-wider">
              <Filter size={16} /> Showing {filteredProducts.length} Items
           </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 mb-10">
          <div className="relative">
            <select 
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="appearance-none bg-white border border-stone-200 px-6 py-2.5 pr-12 rounded-full text-sm font-bold text-stone-700 focus:outline-none focus:border-rose-500 transition-all cursor-pointer shadow-sm"
            >
              <option value="All">All Prices</option>
              <option value="under5k">Under ₹5,000</option>
              <option value="5k-10k">₹5,000 - ₹10,000</option>
              <option value="above10k">Above ₹10,000</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>

          {priceRange !== 'All' && (
            <button 
              onClick={() => setPriceRange('All')}
              className="text-rose-600 text-xs font-black uppercase tracking-widest hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Grid Display */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} item={product} silverRate={silverRate} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="text-stone-300 mb-4 text-6xl font-serif">"</div>
             <h3 className="text-xl font-medium text-stone-800 mb-2">No Matching Designs</h3>
             <p className="text-stone-500 max-w-md">Try adjusting your filters to explore other premium pieces.</p>
          </div>
        )}
      </div>
    </div>
  )
}