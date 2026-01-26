import React from 'react'
import { client } from '@/sanity/lib/client'
import ProductDetails from '@/components/ProductDetails'
import { notFound } from 'next/navigation'

async function getProduct(slug: string) {
  const query = `*[_type == "product" && slug.current == $slug][0]{
    _id,
    title,
    originalPrice,
    description,
    stockQuantity,
    image,
    category,
    "slug": slug.current,
    weight,
    makingCharges,
    // 👇 Ye fetch hona sabse zaroori hai add-ons dikhane ke liye
    extraOptions[] {
      optionName,
      price,
      description
    }
  }`

  const product = await client.fetch(query, { slug }, { next: { revalidate: 0 } })
  return product
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SingleProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug)

  if (!product) return notFound();

  return (
    <div className="bg-white min-h-screen py-8 md:py-16">
       <div className="container mx-auto px-4 max-w-6xl">
          <ProductDetails product={product} />
       </div>
    </div>
  )
}