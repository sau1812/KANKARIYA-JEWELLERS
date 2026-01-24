"use client"
import React, { useState, useEffect } from 'react'
import { client } from '@/sanity/lib/client'
import ProductCard from './ProductCard'
import { Product } from '@/src/types'
import Image from 'next/image'
import { productType } from '@/constants/data'

// --- 1. IMAGE MAPPING HELPER ---
const getCategoryImage = (val: string) => {
  switch (val.toLowerCase()) {
    case 'ring': return 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=200&auto=format&fit=crop';
    case 'necklace': return 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=200&auto=format&fit=crop';
    case 'earring': return 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=200&auto=format&fit=crop';
    case 'bracelet': return 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=200&auto=format&fit=crop';
    case 'bangle': return 'https://plus.unsplash.com/premium_photo-1681276170054-e69622d0a09e?q=80&w=200&auto=format&fit=crop';
    case 'coins': return 'https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?q=80&w=200&auto=format&fit=crop';
    default: return 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=200&auto=format&fit=crop';
  }
}

// --- 2. CATEGORIES ARRAY BUILDER ---
const categories = [
  { 
    name: 'All', 
    value: 'All',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=200&auto=format&fit=crop'
  },
  ...productType.map((item) => ({
    name: item.title,
    value: item.value,
    image: getCategoryImage(item.value)
  }))
];

interface ProductGridProps {
  products: Product[];
}

function ProductGrid({ products: initialProducts }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts || [])
  const [loading, setLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState('All');
  
  // ⚡ Silver Rate State
  const [silverRate, setSilverRate] = useState(0); 

  const [cache, setCache] = useState<Record<string, Product[]>>({
    'All': initialProducts 
  });

  // --- 1. FETCH SILVER RATE ON MOUNT ---
  useEffect(() => {
    const fetchRate = async () => {
        try {
            const rate = await client.fetch(`*[_type == "silverRate"][0].ratePerGram`);
            setSilverRate(rate || 0);
        } catch (err) {
            console.error("Rate fetch error:", err);
        }
    };
    fetchRate();
  }, []);

  // --- CLICK HANDLER ---
  const handleTabClick = (value: string) => {
    if (selectedTab === value) return; 
    setSelectedTab(value);
  }

  // --- 2. FETCH PRODUCTS WHEN TAB CHANGES ---
  useEffect(() => {
    const fetchData = async () => {
      if (selectedTab === 'All') {
         setProducts(cache['All'] || initialProducts);
         return;
      }

      if (cache[selectedTab]) {
        setProducts(cache[selectedTab]);
        return; 
      }

      setLoading(true);
      
      // ✅ Query Updated: Added 'weight' & 'makingCharges'
      const query = `*[_type == "product" && category == $category]{
          _id,
          title,
          "slug": slug.current,
          "imageUrl": image[0].asset->url,
          category,
          isHotDeal,
          stockQuantity,
          weight,         // 👈 Required for calc
          makingCharges,   // 👈 Required for calc
          originalPrice    // Optional display
        }`;
      
      const params = { category: selectedTab };

      try {
        const data = await client.fetch(query, params);
        setProducts(data);
        setCache(prev => ({ ...prev, [selectedTab]: data }));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTab]); 

  return (
    <div className="mt-10">
        
        {/* --- DYNAMIC CATEGORY GRID --- */}
        <div className="relative w-full mb-10">
            {/* Optional: Show Today's Rate */}
            {silverRate > 0 && (
                <div className="text-center mb-4 text-xs font-medium text-gray-500">
                    Current Silver Rate: <span className="text-rose-600 font-bold">₹{silverRate}/g</span>
                </div>
            )}

            <div className="flex gap-4 md:gap-8 overflow-x-auto pb-4 scrollbar-hide px-2 md:justify-center">
                {categories.map((cat) => {
                    const isActive = selectedTab === cat.value;
                    
                    return (
                        <button 
                            key={cat.name} 
                            type="button"
                            onClick={() => handleTabClick(cat.value)}
                            className="flex flex-col items-center gap-2 min-w-[80px] group focus:outline-none transition-all active:scale-95"
                        >
                            {/* Circle Image */}
                            <div className={`
                                relative w-[70px] h-[70px] md:w-[90px] md:h-[90px] rounded-full p-1 transition-all duration-300
                                ${isActive 
                                    ? 'border-[3px] border-[#D61C22] shadow-lg scale-105' 
                                    : 'border-[2px] border-[#C5A25D] hover:border-[#D61C22]'
                                }
                            `}>
                                <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-100">
                                    <Image 
                                        src={cat.image} 
                                        alt={cat.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                            
                            {/* Text Label */}
                            <span className={`
                                text-xs md:text-sm font-medium tracking-wide uppercase whitespace-nowrap
                                ${isActive ? 'text-[#D61C22] font-bold' : 'text-stone-700'}
                            `}>
                                {cat.name}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>

        {/* --- PRODUCTS LIST --- */}
        <div className="mt-8 px-4">
            {loading && (
                <div className="flex justify-center items-center h-40">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-[#D61C22] rounded-full animate-spin"></div>
                </div>
            )}

            {!loading && products.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                    <p className="text-gray-400">No products found in category "{selectedTab}".</p>
                </div>
            )}

            {!loading && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
                    {products.map((product) => (
                        // ✅ Silver Rate Pass Kiya
                        <ProductCard 
                            key={product._id} 
                            item={product} 
                            silverRate={silverRate} 
                        />
                    ))}
                </div>
            )}
        </div>
    </div>
  )
}

export default ProductGrid