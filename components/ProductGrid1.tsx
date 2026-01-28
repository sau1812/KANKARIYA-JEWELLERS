"use client"
import React, { useState, useEffect } from 'react'
import { client } from '@/sanity/lib/client'
import ProductCard from './ProductCard'
import { Product } from '@/src/types'
import Image from 'next/image'
import { productType } from '@/constants/data'
import { motion } from 'framer-motion' 
import { Clock, TrendingUp } from 'lucide-react' 

// --- 1. IMAGE MAPPING HELPER (FIXED IMAGE LINKS) ---
const getCategoryImage = (val: string) => {
  switch (val.toLowerCase()) {
    case 'ring': return 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop';
    case 'necklace': return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=400&auto=format&fit=crop'; // Fixed link
    case 'earring': return 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&auto=format&fit=crop';
    case 'bracelet': return 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&auto=format&fit=crop';
    case 'bangle': return 'https://images.unsplash.com/photo-1619119069152-a2b331eb392a?q=80&w=400&auto=format&fit=crop'; // Fixed link
    case 'coins': return 'https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?q=80&w=400&auto=format&fit=crop';
    default: return 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&auto=format&fit=crop';
  }
}

// --- 2. CATEGORIES ARRAY BUILDER ---
const categories = [
  { 
    name: 'All', 
    value: 'All',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&auto=format&fit=crop'
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
  const [silverRate, setSilverRate] = useState(0); 
  const [lastUpdated, setLastUpdated] = useState<string>(""); 

  const [cache, setCache] = useState<Record<string, Product[]>>({
    'All': initialProducts 
  });

  useEffect(() => {
    const fetchRate = async () => {
        try {
            const data = await client.fetch(`*[_type == "silverRate"][0]{ratePerGram, _updatedAt}`);
            if (data) {
                setSilverRate(data.ratePerGram || 0);
                const date = new Date(data._updatedAt);
                const formattedDate = date.toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                });
                setLastUpdated(formattedDate);
            }
        } catch (err) {
            console.error("Rate fetch error:", err);
        }
    };
    fetchRate();
  }, []);

  const handleTabClick = (value: string) => {
    if (selectedTab === value) return; 
    setSelectedTab(value);
  }

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
      const query = `*[_type == "product" && category == $category]{
          _id,
          title,
          "slug": slug.current,
          "imageUrl": image[0].asset->url,
          category,
          isHotDeal,
          stockQuantity,
          weight,
          makingCharges,
          originalPrice
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
        
        {silverRate > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center mb-14 px-4"
          >
            <div className="inline-flex flex-col md:flex-row items-center gap-4 md:gap-10 bg-white border border-rose-100 shadow-2xl shadow-rose-100/50 px-10 py-6 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-600"></div>
              <div className="flex items-center gap-5">
                <div className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600"></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-stone-400 font-black leading-none mb-2">Live Silver Market</span>
                  <div className="flex items-center gap-3">
                    <TrendingUp size={24} className="text-rose-600" />
                    <span className="text-3xl md:text-5xl font-serif font-black text-stone-900 tracking-tighter">
                      ₹{silverRate.toLocaleString('en-IN')}<span className="text-lg font-medium text-stone-400 ml-1">/g</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block w-px h-16 bg-stone-100"></div>
              <div className="flex items-center gap-4 text-stone-500">
                <div className="p-3 bg-stone-50 rounded-2xl">
                  <Clock size={20} className="text-stone-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest font-black text-stone-400 mb-1">Last Verified</span>
                  <span className="text-sm md:text-base font-bold tabular-nums text-stone-700">{lastUpdated}</span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-stone-400 uppercase tracking-[0.3em] font-bold">
              *Real-time pricing for Kankariya Jewellers nashik
            </p>
          </motion.div>
        )}

        <div className="relative w-full mb-10">
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