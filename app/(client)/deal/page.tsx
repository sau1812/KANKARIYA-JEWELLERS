import React from 'react'
import { client } from '@/sanity/lib/client' // 👈 Make sure path sahi ho
import ProductCard from '@/components/ProductCard'
import { Flame } from 'lucide-react'

// 1. Data Types Define kiye
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

// 2. Data Fetching Function (Server Side)
async function getHotDeals() {
  const query = `*[_type == "product" && isHotDeal == true]{
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

  // Revalidate: 60 seconds (Har 1 min me naya data check karega)
  const data = await client.fetch(query, {}, { next: { revalidate: 60 } })
  return data
}

export default async function HotDealPage() {
  const products: Product[] = await getHotDeals()

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="container mx-auto px-4">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col items-center text-center mb-12">
           <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Flame size={32} className="text-orange-500 fill-orange-500" />
           </div>
           <h1 className="text-3xl md:text-5xl font-serif text-stone-900 mb-4">
             Hot Deals & Offers
           </h1>
           <p className="text-stone-500 max-w-xl">
             Grab these limited-time offers before they run out! Handpicked exclusive jewelry at unbeatable prices.
           </p>
        </div>

        {/* --- Product Grid --- */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} item={product} />
            ))}
          </div>
        ) : (
          /* Empty State (Agar koi hot deal na ho) */
          <div className="text-center py-20 bg-stone-50 rounded-xl">
             <p className="text-stone-400 text-lg">No hot deals active right now. Check back later!</p>
          </div>
        )}

      </div>
    </div>
  )
}