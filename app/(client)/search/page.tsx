import React from 'react'
import { client } from '@/sanity/lib/client'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/src/types'
import { SearchX, Search } from 'lucide-react'

// 1. Silver Rate Fetch Helper
async function getSilverRate() {
  const query = `*[_type == "silverRate"][0].ratePerGram`;
  const rate = await client.fetch(query, {}, { next: { revalidate: 60 } });
  return rate || 0;
}

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Update 2: Next.js 15 Rule (Await params)
  const resolvedSearchParams = await searchParams; 
  const query = resolvedSearchParams.q;

  // Debugging Log
  console.log("Search Query:", query);

  if (!query || typeof query !== 'string') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-stone-500">
        <Search size={48} className="mb-4 opacity-50" />
        <h2 className="text-xl font-medium">Search for jewelry...</h2>
      </div>
    )
  }

  // 👇 QUERY UPDATE: 'price' hataya, 'weight' aur 'makingCharges' add kiya
  const sanityQuery = `*[_type == "product" && (
    title match $searchTerm + "*" || 
    category match $searchTerm + "*" || 
    description match $searchTerm + "*"
  )]{
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

  // 👇 PARALLEL FETCHING: Products aur Silver Rate ek sath layenge
  const productsPromise = client.fetch(sanityQuery, { searchTerm: query });
  const silverRatePromise = getSilverRate();

  const [products, silverRate] = await Promise.all([productsPromise, silverRatePromise]);

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="container mx-auto px-4">
        
        <div className="mb-8 border-b border-stone-200 pb-4">
            <h1 className="text-2xl font-serif text-stone-900">
                Search Results
            </h1>
            <p className="text-stone-500 mt-2">
                Searching for: <span className="text-black font-bold">"{query}"</span>
            </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: Product) => (
              // 👇 Pass silverRate to ProductCard for calculation
              <ProductCard key={product._id} item={product} silverRate={silverRate} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-stone-50 rounded-lg">
            <SearchX size={50} className="text-stone-400 mb-4" />
            <h3 className="text-lg font-medium text-stone-800">No matching jewelry found</h3>
            <p className="text-stone-500 text-sm mt-1">
               Try searching for 'Ring', 'Necklace' or 'Gold'.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}