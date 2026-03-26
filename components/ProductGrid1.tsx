"use client"
import React, { useState, useEffect } from 'react'
import { client } from '@/sanity/lib/client'
import ProductCard from './ProductCard'
import { Product } from '@/src/types'
import Image from 'next/image'
import { productType } from '@/constants/data'

// 🚫 Yahan se 'getProductsByCategoryQuery' ka import hata diya gaya hai

const getCategoryImage = (val: string) => {
  switch (val.toLowerCase()) {
    case 'ring': return 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop';
    case 'necklace': return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=400&auto=format&fit=crop';
    case 'earring': return 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&auto=format&fit=crop';
    case 'bracelet': return 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&auto=format&fit=crop';
    case 'bangle': return 'https://images.unsplash.com/photo-1619119069152-a2b331eb392a?q=80&w=400&auto=format&fit=crop';
    case 'chains': return 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?q=80&w=400&auto=format&fit=crop'; 
    case 'watches': return 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=400&auto=format&fit=crop'; 
    default: return 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&auto=format&fit=crop';
  }
}

const categories = productType.map((item) => ({
  name: item.title,
  value: item.value, 
  image: getCategoryImage(item.value)
}));

interface ProductGridProps {
  products: Product[];
  silverRate: number; 
}

export default function ProductGrid({ products: initialProducts, silverRate }: ProductGridProps) {
  const defaultCategory = categories.length > 0 ? categories[0].value : 'ring';
  const [selectedTab, setSelectedTab] = useState(defaultCategory); 
  
  const getInitialFilteredProducts = () => {
    return initialProducts?.filter(p => p.category?.toLowerCase() === defaultCategory.toLowerCase()) || [];
  };

  const [products, setProducts] = useState<Product[]>(getInitialFilteredProducts());
  const [loading, setLoading] = useState(false);

  const [cache, setCache] = useState<Record<string, Product[]>>({
    [defaultCategory]: getInitialFilteredProducts()
  });

  const handleTabClick = (value: string) => {
    if (selectedTab === value) return; 
    setSelectedTab(value);
  }

  useEffect(() => {
    const fetchData = async () => {
      if (cache[selectedTab]) {
        setProducts(cache[selectedTab]);
        return; 
      }
      
      setLoading(true);
      const params = { category: selectedTab };
      
      // ✅ YAHAN FIX KIYA HAI: Direct wahi query likhi hai jisme 'hoverImage' aur Price ki calculation hai
      const updatedCategoryQuery = `*[_type == "product" && category == $category && isArchived != true]{
          _id, 
          title, 
          "image": image[0].asset->url, 
          "hoverImage": image[1].asset->url,
          "slug": slug.current,
          category,
          isHotDeal,
          stockQuantity,
          originalPrice,
          weight,
          makingCharges,
          pricingType,
          fixedPrice
      }`;
      
      try {
        const data = await client.fetch(updatedCategoryQuery, params);
        const fetchedProducts = data || [];
        
        setProducts(fetchedProducts);
        setCache(prev => ({ ...prev, [selectedTab]: fetchedProducts }));
        
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
                            suppressHydrationWarning
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
                                        sizes="90px"
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

        {/* --- PRODUCT GRID --- */}
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
                    {products.map((product) => {
                        return (
                            <ProductCard 
                                key={product._id} 
                                item={product as any} 
                                silverRate={silverRate} 
                            />
                        )
                    })}
                </div>
            )}
        </div>
    </div>
  )
}