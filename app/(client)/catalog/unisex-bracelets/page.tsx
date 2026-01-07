import React from 'react'
import { client } from '@/sanity/lib/client'
import ProductCard from '@/components/ProductCard'
import { Filter } from 'lucide-react'

// 1. Product Type Definition
interface Product {
  _id: string;
  title: string;
  price: number;
  originalPrice: number;
  slug: string;
  imageUrl: string;
  category: string;
  isHotDeal: boolean;
  stockQuantity: number;
}

// 2. Data Fetching Function
async function getUnisexBracelets() {
  // 👇 LOGIC UPDATE:
  // Fetch products where category is 'bracelet' 
  // AND gender is STRICTLY 'unisex'
  
  const query = `*[_type == "product" && category == "bracelet" && gender == "unisex"]{
    _id,
    title,
    price,
    originalPrice,
    "slug": slug.current,
    "imageUrl": image[0].asset->url,
    category,
    isHotDeal,
    stockQuantity
  }`

  // Revalidate every 60 seconds
  const data = await client.fetch(query, {}, { next: { revalidate: 60 } })
  return data
}

export default async function UnisexBracelet() {
  const products: Product[] = await getUnisexBracelets()

  return (
    <div className="bg-stone-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        
        {/* --- Header Section --- */}
        <div className="mb-10 border-b border-stone-200 pb-6 flex flex-col md:flex-row justify-between items-end gap-4">
           <div>
               <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-2">
                 Unisex Bracelets
               </h1>
               <p className="text-stone-500 text-sm md:text-base max-w-lg">
                 Versatile designs made for everyone. Minimalist, stylish, and perfect for matching sets.
               </p>
           </div>
           
           {/* Filter Label */}
           <div className="flex items-center gap-2 text-stone-400 text-sm font-medium uppercase tracking-wider">
              <Filter size={16} /> Showing {products.length} Items
           </div>
        </div>

        {/* --- Product Grid --- */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} item={product} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="text-stone-300 mb-4 text-6xl font-serif">"</div>
             <h3 className="text-xl font-medium text-stone-800 mb-2">Collection Arriving Soon</h3>
             <p className="text-stone-500 max-w-md">
               We are currently curating versatile designs for everyone.
             </p>
          </div>
        )}

      </div>
    </div>
  )
}