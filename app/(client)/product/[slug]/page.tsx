import React from 'react'
import { client } from '@/sanity/lib/client'
import ProductDetails from '@/components/ProductDetails'
import { notFound } from 'next/navigation'

// 👇 Fetch Function Update
async function getProduct(slug: string) {
  // ✅ QUERY UPDATE: weight aur makingCharges add kiya
  const query = `*[_type == "product" && slug.current == $slug][0]{
    _id,
    title,
    // price hata sakte hain ya rakh sakte hain, but calculation weight se hogi
    originalPrice,
    description,
    stockQuantity,
    image,
    category,
    "slug": slug.current,
    
    // 👇 Ye 2 fields zaroori hain Dynamic Pricing ke liye
    weight,
    makingCharges
  }`

  const product = await client.fetch(query, { slug })
  return product
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SingleProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug)

  if (!product) {
     return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-2xl font-serif text-stone-800 mb-2">Product Not Found</h2>
            <p className="text-stone-500">The jewelry you are looking for might have been removed.</p>
        </div>
     )
  }

  return (
    <div className="bg-white min-h-screen py-8 md:py-16">
       <div className="container mx-auto px-4 max-w-6xl">
          {/* Ab product ke andar weight hai, toh ProductDetails sahi price calculate karega */}
          <ProductDetails product={product} />
       </div>
    </div>
  )
}