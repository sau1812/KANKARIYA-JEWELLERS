"use client"
import React, { useState, useEffect } from 'react'
import HomeTabBar from './HomeTabBar' // Ensure ye file components folder mein ho
import { client } from '@/sanity/lib/client'
import ProductCard from './ProductCard' // Ensure ye file components folder mein ho
import { Product } from '@/src/types' // Step 1 wali file import

// Interface for Props
interface ProductGridProps {
  products: Product[]; 
}

function ProductGrid({ products: initialProducts }: ProductGridProps) {
  // Initial state mein server data set kar rahe hain
  const [products, setProducts] = useState<Product[]>(initialProducts || [])
  const [loading, setLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState('All');

  // --- FETCHING LOGIC ---
  useEffect(() => {
    // Optimization: Agar "All" tab select kiya aur hamare paas initial data hai,
    // to naya fetch mat karo, wahi purana data use karo.
    if (selectedTab === 'All') {
        setProducts(initialProducts);
        return;
    }

    const fetchData = async () => {
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
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTab, initialProducts]);

  return (
    <div className="mt-10">
        
        {/* --- Tab Bar --- */}
        <HomeTabBar 
            selectedTab={selectedTab} 
            onTabSelect={setSelectedTab} 
        />

        {/* --- GRID SECTION --- */}
        <div className="mt-8">
            
            {/* 1. Loading State */}
            {loading && (
                <div className="flex justify-center items-center h-40">
                    <p className="text-gray-500 animate-pulse tracking-wide">Loading jewelry...</p>
                </div>
            )}

            {/* 2. Empty State */}
            {!loading && products.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                    <p className="text-gray-400">No products found in {selectedTab}.</p>
                </div>
            )}

            {/* 3. Products Grid */}
            {!loading && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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