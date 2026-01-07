"use client"
import React, { useState, useEffect } from 'react'
import HomeTabBar from './HomeTabBar'
import { client } from '@/sanity/lib/client'
import ProductCard from './ProductCard'
import { Product } from '@/src/types'

interface ProductGridProps {
  products: Product[];
}

function ProductGrid({ products: initialProducts }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts || [])
  const [loading, setLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState('All');

  // Cache Logic
  const [cache, setCache] = useState<Record<string, Product[]>>({
    'All': initialProducts 
  });

  useEffect(() => {
    const fetchData = async () => {
      // 1. Agar 'All' hai to initial data reset kar do
      if (selectedTab === 'All') {
         // Agar cache me initial data hai to wahi use karo
         setProducts(cache['All'] || initialProducts);
         return;
      }

      // 2. Check Cache
      if (cache[selectedTab]) {
        setProducts(cache[selectedTab]);
        return; 
      }

      setLoading(true);
      
      const query = `*[_type == "product" && category == $category]{
          _id,
          title,
          price,
          originalPrice,
          "slug": slug.current,
          "imageUrl": image[0].asset->url,
          category,
          isHotDeal,
          stockQuantity
        }`;
      
      const params = { category: selectedTab.toLowerCase() };

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
    // ⚠️ IMPORTANT FIX: Dependency array se 'cache' hata diya.
    // Ab ye sirf tab chalega jab user tab badlega.
  }, [selectedTab]); 

  return (
    <div className="mt-10">
        <HomeTabBar 
            selectedTab={selectedTab} 
            onTabSelect={setSelectedTab} 
        />

        <div className="mt-8">
            {loading && (
                <div className="flex justify-center items-center h-40">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                </div>
            )}

            {!loading && products.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                    <p className="text-gray-400">No products found in {selectedTab}.</p>
                </div>
            )}

            {!loading && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
                    {products.map((product) => (
                        <ProductCard key={product._id} item={product} />
                    ))}
                </div>
            )}
        </div>
    </div>
  )
}

export default ProductGrid