import React from 'react'
import { client } from '@/sanity/lib/client'
import ProductDetails from '@/components/ProductDetails'
import { notFound } from 'next/navigation'

// 👇 Fetch Function (Ye sahi tha, bas slug pass hone ka wait kar raha tha)
async function getProduct(slug: string) {
  const query = `*[_type == "product" && slug.current == $slug][0]{
    _id,
    title,
    price,
    originalPrice,
    description,
    stockQuantity,
    image,
    category,
    "slug": slug.current
  }`

  const product = await client.fetch(query, { slug })
  return product
}

// 👇 TYPE CHANGE: params ab Promise hai
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SingleProductPage({ params }: PageProps) {
  // 👇 FIX: Pehle params ko Await karein
  const { slug } = await params;

  // Ab slug use karein
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
          <ProductDetails product={product} />
       </div>
    </div>
  )
}