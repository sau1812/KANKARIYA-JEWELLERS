import React from 'react'
import Container from '@/components/Container'
import HomeBanner from '@/components/HomeBanner'
import ProductGrid from '@/components/ProductGrid1' // Ensure correct import path
import { client } from '@/sanity/lib/client'

// 👇 Server Side Data Fetching Function
async function getProducts() {
  const query = `*[_type == "product"]{
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

  // next: { revalidate: 60 } ka matlab har 60 seconds baad data refresh hoga (ISR)
  const data = await client.fetch(query, {}, { next: { revalidate: 60 } });
  return data;
}

export default async function Home() {
  // Page render hone se pehle data server par fetch ho jayega
  const products = await getProducts();

  return (
    <> 
      <Container className='bg-shop-ligt-pink'>
         <HomeBanner />
         <div className='py-10'>
            {/* 👇 Data ko props ke through Client Component mein bhej rahe hain */}
            <ProductGrid products={products} />
         </div>
      </Container>
    </>
  )
}