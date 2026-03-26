import React, { Suspense } from 'react'
import Container from '@/components/Container'
import HomeBanner from '@/components/HomeBanner'
import VideoSlider from '@/components/VideoSlider' 
import ProductGrid from '@/components/ProductGrid1' 
import { client } from '@/sanity/lib/client'

// 1. Products fetch karne ka function
// app/(client)/page.tsx ke andar
// app/(client)/page.tsx
async function getProducts() {
  const data = await client.fetch(
    `*[_type == "product" && isArchived != true]{
        _id, 
        title, // 👈 'name' ki jagah 'title' fetch kiya
        "image": image[0].asset->url, 
        "hoverImage": image[1].asset->url,
        "slug": slug.current,
        category,
        isHotDeal,
        stockQuantity,
        originalPrice,
        
        // 👇 PRICE CALCULATION KE LIYE ZARURI FIELDS 👇
        weight,
        makingCharges,
        pricingType,
        fixedPrice
    }`, 
    {}, 
    { next: { revalidate: 60 } }
  );
  return data || [];
}
// 2. Slider ki images fetch karne ke liye
async function getSliderImages() {
  const query = `*[_type == "imageSlider" && !(_id in path("drafts.**"))][0]{ "imageUrls": images[].asset->url }`;
  const data = await client.fetch(query, {}, { next: { revalidate: 60 } });
  return data?.imageUrls || [];
}

// 3. NAYA FUNCTION: Silver Rate fetch karne ke liye
async function getSilverRate() {
  const data = await client.fetch(
    `*[_type == "silverRate"][0]{ratePerGram}`, 
    {}, 
    { next: { revalidate: 60 } } // Ye bhi 60 sec me update hoga
  );
  return data?.ratePerGram || 0;
}

// 4. Product list component (Non-blocking & Parallel Fetching)
async function ProductList() {
  // 👇 MAGIC: Dono API calls ek sath lagengi (Time half ho jayega)
  const [products, silverRate] = await Promise.all([
    getProducts(),
    getSilverRate()
  ]);

  // Dono data ProductGrid ko pass kar diye
  return <ProductGrid products={products} silverRate={silverRate} />;
}

export default async function Home() {
  // Server par Slider ki images fetch karein
  const sliderImages = await getSliderImages();

  return (
    <div className='bg-shop-light-pink min-h-screen'> 
      {/* Fetch ki hui images ab Slider ko pass karein */}
      <VideoSlider images={sliderImages} />
      
      <HomeBanner />
      
      <Container>
         <div className='py-14 md:py-20'>
            <div className="text-center mb-10">
               <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-3">Our Signature Collection</h2>
               <p className="text-stone-500">Handcrafted pure silver jewellery from Kankariya Jewellers</p>
            </div>
            
            <Suspense fallback={<div className="text-center py-20 text-xl">Loading Latest Collection...</div>}>
              <ProductList />
            </Suspense>
         </div>
      </Container>
    </div>
  )
}