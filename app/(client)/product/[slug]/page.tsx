import React from 'react'
import { client } from '@/sanity/lib/client'
import ProductDetails from '@/components/ProductDetails' 

async function getProduct(slug: string) {
  // 👇 FIX: "images": image[].asset->url HATA DIYA.
  // Hum seedha raw 'image' array le rahe hain taaki component usse handle kare.
  const query = `*[_type == "product" && slug.current == $slug][0]{
    _id,
    title,
    price,
    originalPrice,
    description,
    stockQuantity,
    image,  // 👈 IMPORTANT: Raw Image Array fetch karo (Schema name: 'image')
    category,
    "slug": slug.current
  }`

  const product = await client.fetch(query, { slug })
  return product
}

export default async function SingleProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)

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