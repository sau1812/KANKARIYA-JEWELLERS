import React from 'react'
import Container from '@/components/Container'
import HomeBanner from '@/components/HomeBanner'
import VideoSlider from '@/components/VideoSlider' // 👈 NAYA IMPORT YAHAN ADD KIYA
import ProductGrid from '@/components/ProductGrid1' 
import { client } from '@/sanity/lib/client'
import { getAllProductsQuery } from '@/sanity/lib/queries'

// 👇 Server Side Data Fetching Function
async function getProducts() {
  const data = await client.fetch(getAllProductsQuery, {}, { next: { revalidate: 60 } });
  return data;
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className='bg-shop-light-pink min-h-screen'> 
       <VideoSlider />
      {/* 👇 1. Top par aapka Sanity Image wala Banner */}
      <HomeBanner />
      
      {/* 👇 2. Banner ke theek niche auto-playing Video Slider */}
      
      


      {/* 👇 3. Niche Products ka Grid Container ke andar */}
      <Container>
         <div className='py-14 md:py-20'>
            {/* Thoda heading add kar diya taaki layout acha lage (Optional) */}
            <div className="text-center mb-10">
               <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-3">Our Silver Collection</h2>
               <p className="text-stone-500">Handcrafted pure silver jewellery from Kankariya Jewellers</p>
            </div>
            
            <ProductGrid products={products} />
         </div>
      </Container>
      
    </div>
  )
}