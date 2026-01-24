import React from 'react'
import Link from 'next/link'
import Container from './Container'
import { ArrowRight, Star } from 'lucide-react'
import { client } from '@/sanity/lib/client'

// --- 1. DEFAULT DATA ---
const fallbackData = {
  headingTop: "Timeless",
  headingHighlight: "Elegance",
  headingBottom: "Redefined",
  description: "Crafted with precision, worn with pride. Discover the purity of silver like never before.",
  offerText: "Get Flat 10% OFF on First Order",
  image1Url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop", 
}

// --- 2. FETCH FUNCTION ---
async function getHeroData() {
  try {
    const query = `*[_type == "hero"][0]{
        headingTop,
        headingHighlight,
        headingBottom,
        description,
        offerText,
        "image1": image1.asset->url,
        "image2": image2.asset->url
    }`;
    const data = await client.fetch(query, {}, { next: { revalidate: 60 } });
    return data;
  } catch (error) {
    console.log("Sanity Fetch Error:", error);
    return null;
  }
}

const features = [
  "PURE SILVER (925)", "LIFETIME SHINE", "NICKEL FREE", "CERTIFIED QUALITY", "HANDCRAFTED"
];

// --- 3. SERVER COMPONENT (Async hai, isliye 'use client' nahi lagana) ---
async function HomeBanner() {
  const sanityData = await getHeroData();
  
  const content = {
    top: sanityData?.headingTop || fallbackData.headingTop,
    highlight: sanityData?.headingHighlight || fallbackData.headingHighlight,
    bottom: sanityData?.headingBottom || fallbackData.headingBottom,
    desc: sanityData?.description || fallbackData.description,
    offer: sanityData?.offerText || fallbackData.offerText,
    img1: sanityData?.image1 || fallbackData.image1Url,
  };

  return (
    <section className="relative w-full bg-[#FAFAFA] overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#C5A25D] opacity-[0.03] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#D61C22] opacity-[0.03] rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <Container className="relative z-10 pt-10 pb-16 md:py-20">
        <div className="flex flex-col-reverse md:flex-row items-center gap-10 md:gap-20">
          
          {/* --- LEFT SIDE: Content --- */}
          <div className="w-full md:w-1/2 text-center md:text-left flex flex-col items-center md:items-start space-y-6 md:space-y-8">
             
             {/* New Collection Badge */}
             <div className="flex items-center gap-2 px-3 py-1 bg-white border border-[#E5E5E5] rounded-full shadow-sm">
                <Star size={12} className="text-[#C5A25D] fill-[#C5A25D]" />
                <span className="text-[10px] md:text-xs font-bold tracking-widest text-stone-500 uppercase">
                  New 2026 Collection
                </span>
             </div>

             {/* Heading */}
             <h1 className="text-4xl md:text-7xl font-serif text-[#1A1A1A] leading-[1.1]">
                {content.top} <br />
                <span className="italic text-[#D61C22] font-medium relative">
                  {content.highlight}
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#C5A25D] opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </span> <br />
                {content.bottom}
             </h1>

             <p className="text-stone-600 text-sm md:text-lg max-w-lg leading-relaxed">
                {content.desc}
             </p>

             <div className="bg-[#FFF5F5] border-l-4 border-[#D61C22] px-4 py-3 w-full md:w-auto text-left rounded-r-md">
                <p className="text-sm text-[#D61C22] font-semibold tracking-wide uppercase">Limited Offer</p>
                <p className="text-stone-900 font-bold">{content.offer}</p>
             </div>

             <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto pt-2">
                <Link href="/silver" className="bg-[#D61C22] text-white px-8 py-4 md:rounded-tl-2xl md:rounded-br-2xl font-medium tracking-wide hover:bg-[#B0171C] transition-all duration-300 shadow-xl shadow-red-200 flex items-center justify-center gap-2 group">
                  Explore Collection
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/about" className="px-8 py-4 border border-[#1A1A1A] text-[#1A1A1A] md:rounded-tl-2xl md:rounded-br-2xl font-medium tracking-wide hover:bg-[#1A1A1A] hover:text-white transition-all duration-300 flex items-center justify-center">
                  Our Story
                </Link>
             </div>
          </div>

          {/* --- RIGHT SIDE: Image --- */}
          <div className="w-full md:w-1/2 relative flex justify-center md:justify-end">
             
             <div className="relative w-[320px] h-[400px] md:w-[450px] md:h-[600px]">
                
                {/* Border Frame */}
                <div className="absolute top-4 -right-4 w-full h-full border-2 border-[#C5A25D] rounded-t-[150px] z-0 hidden md:block"></div>

                {/* Main Image Box */}
                <div className="relative w-full h-full rounded-t-[150px] overflow-hidden shadow-2xl z-10 bg-stone-200">
                   
                   {/* Standard img tag */}
                   <img 
                      src={content.img1} 
                      alt="Luxury Silver Jewelry" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000 ease-out" 
                   />
                   
                   <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/60 to-transparent"></div>
                   
                   <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-lg">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]">Kankariya Exclusive</p>
                   </div>
                </div>

                <div className="absolute -bottom-6 -left-6 md:top-20 md:-left-12 w-24 h-24 bg-[#1A1A1A] text-white rounded-full flex flex-col items-center justify-center shadow-xl z-20 border-4 border-white">
                    <span className="text-xs font-light text-stone-300">Starting</span>
                    <span className="text-lg font-bold">₹999</span>
                </div>

             </div>
          </div>

        </div>
      </Container>

      {/* --- Marquee --- */}
      <div className="w-full bg-[#1A1A1A] py-3 overflow-hidden border-t-4 border-[#C5A25D]">
        <div className="flex w-full whitespace-nowrap">
           <div className="flex animate-scroll min-w-full shrink-0 justify-around gap-16 px-8">
             {features.map((text, i) => (
               <span key={i} className="text-xs md:text-sm font-bold tracking-[0.2em] text-[#C5A25D] uppercase flex items-center gap-3">
                 <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                 {text}
               </span>
             ))}
           </div>
           <div className="flex animate-scroll min-w-full shrink-0 justify-around gap-16 px-8" aria-hidden="true">
             {features.map((text, i) => (
               <span key={i} className="text-xs md:text-sm font-bold tracking-[0.2em] text-[#C5A25D] uppercase flex items-center gap-3">
                 <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                 {text}
               </span>
             ))}
           </div>
        </div>
      </div>
      
    </section>
  )
}

export default HomeBanner