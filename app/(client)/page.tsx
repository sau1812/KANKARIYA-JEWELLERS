import React from 'react'
import Container from '@/components/Container'
import HomeBanner from '@/components/HomeBanner'
import ProductGrid from '@/components/ProductGrid1' 
import { client } from '@/sanity/lib/client'

// 👇 Server Side Data Fetching Function
async function getProducts() {
  const query = `*[_type == "product"]{
    _id,
    title,
    originalPrice,
    "slug": slug.current,
    "imageUrl": image[0].asset->url,
    category,
    isHotDeal,
    stockQuantity,
    weight,
    makingCharges,
    // 👇 Ye add karna zaroori hai tabhi frontend pe dikhega
    extraOptions[] {
      optionName,
      price,
      description
    }
  }`;

  const data = await client.fetch(query, {}, { next: { revalidate: 60 } });
  return data;
}
export default async function Home() {
  const products = await getProducts();

  return (
    // 👇 Background color ko yahan lagaya taaki full width dikhe
    <div className='bg-shop-light-pink min-h-screen'> 
      <Container>
         <HomeBanner />
         <div className='py-10'>
            <ProductGrid products={products} />
         </div>
      </Container>
    </div>
  )
}