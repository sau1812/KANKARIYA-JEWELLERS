import React from 'react'
import { client } from '@/sanity/lib/client'
import ProductCard from '@/components/ProductCard'
import { Filter } from 'lucide-react'

// 1. Product Type Definition (Updated for Dynamic Calculation)
interface Product {
  _id: string;
  title: string;
  originalPrice: number;
  slug: string;
  imageUrl: string;
  category: string;
  isHotDeal: boolean;
  stockQuantity: number;
  // 👇 Fields needed for calculation
  weight: number;
  makingCharges: number;
}

// 2. Fetch Live Silver Rate
async function getSilverRate() {
  const query = `*[_type == "silverRate"][0].ratePerGram`;
  const rate = await client.fetch(query, {}, { next: { revalidate: 60 } });
  return rate || 0;
}

// 3. Data Fetching Function
async function getWomenNecklaces() {
  // 👇 LOGIC UPDATE: Fetch weight & makingCharges
  // Gender remains STRICTLY 'women' as per your code
  const query = `*[_type == "product" && category == "necklace" && gender == "women"]{
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
  }`

  const data = await client.fetch(query, {}, { next: { revalidate: 60 } })
  return data
}

export default async function WomenNecklace() {
  // Parallel Fetching: Get Data & Rate together
  const productsData = getWomenNecklaces();
  const silverRateData = getSilverRate();

  const [products, silverRate] = await Promise.all([productsData, silverRateData]);

  return (
    <div className="bg-stone-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        
        {/* --- Header Section --- */}
        <div className="mb-10 border-b border-stone-200 pb-6 flex flex-col md:flex-row justify-between items-end gap-4">
           <div>
               <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-2">
                 Women's Necklaces
               </h1>
               <p className="text-stone-500 text-sm md:text-base max-w-lg">
                 Graceful chains and stunning pendants designed exclusively for her.
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
            {products.map((product: Product) => (
              // 👇 Passing silverRate for dynamic calculation
              <ProductCard key={product._id} item={product} silverRate={silverRate} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="text-stone-300 mb-4 text-6xl font-serif">"</div>
             <h3 className="text-xl font-medium text-stone-800 mb-2">Collection Arriving Soon</h3>
             <p className="text-stone-500 max-w-md">
               We are currently crafting beautiful necklaces for this collection.
             </p>
          </div>
        )}

      </div>
    </div>
  )
}