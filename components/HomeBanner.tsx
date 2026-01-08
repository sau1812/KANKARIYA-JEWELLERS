import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Container from './Container'
import { ArrowRight } from 'lucide-react'
import { client } from '@/sanity/lib/client'

// --- 1. DEFAULT DATA ---
const fallbackData = {
  headingTop: "Discover",
  headingHighlight: "Essence",
  headingBottom: "of Pure Luxury",
  description: "Experience craftsmanship like never before.",
  offerText: "FLAT 10% OFF on your first order",
  image1Url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop",
  image2Url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop"
}

// --- 2. FETCH FUNCTION ---
async function getHeroData() {
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
}

const features = [
  "ANTI-TARNISH", "WATER PROOF", "SKIN-FRIENDLY", "HYPOALLERGENIC", "PREMIUM FINISH",
];

// --- 3. ASYNC COMPONENT ---
async function HomeBanner() {
  const sanityData = await getHeroData();
  
  const content = {
    top: sanityData?.headingTop || fallbackData.headingTop,
    highlight: sanityData?.headingHighlight || fallbackData.headingHighlight,
    bottom: sanityData?.headingBottom || fallbackData.headingBottom,
    desc: sanityData?.description || fallbackData.description,
    offer: sanityData?.offerText || fallbackData.offerText,
    img1: sanityData?.image1 || fallbackData.image1Url,
    img2: sanityData?.image2 || fallbackData.image2Url,
  };

  return (
    // FIX 1: Removed 'overflow-hidden' from mobile (added md:overflow-hidden) 
    // to allow content to grow if text is too long on small screens.
    <div className="relative w-full bg-[#fff0f0] md:overflow-hidden flex flex-col justify-between">
      
      <style>{`
        @keyframes floatUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-float {
          opacity: 0;
          animation: floatUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
      `}</style>

      {/* FIX 2: Changed min-h to ensure it fits content on mobile */}
      <Container className="relative z-10 min-h-[500px] md:min-h-[600px] flex items-center flex-grow py-12 md:py-0 gap-8 md:gap-16">
        
        {/* --- LEFT SIDE: Text Content --- */}
        <div className="w-full md:w-1/2 flex flex-col justify-center z-20 text-center md:text-left items-center md:items-start">
            
            <span className="inline-block px-3 py-1 mb-4 text-[10px] md:text-xs font-bold tracking-widest text-white uppercase bg-rose-500 rounded-full w-fit animate-float" style={{ animationDelay: '0.1s' }}>
              New Collection
            </span>

            {/* FIX 3: Reduced text size on mobile (text-3xl instead of text-4xl) */}
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-serif text-stone-900 leading-[1.1] mb-6 animate-float" style={{ animationDelay: '0.2s' }}>
              {content.top} <br className="hidden md:block" />
              <span className="italic font-light text-rose-500">{content.highlight}</span><br/>
              {content.bottom}
            </h1>

            <p className="text-sm md:text-lg text-stone-600 mb-8 max-w-md leading-relaxed animate-float" style={{ animationDelay: '0.3s' }}>
              {content.desc} <br/>
              <span className="font-bold text-black border-b-2 border-rose-400">
                {content.offer}
              </span>
            </p>

            <div className="flex gap-4 animate-float" style={{ animationDelay: '0.4s' }}>
              <Link 
                href="/deal" 
                className="group flex items-center gap-2 bg-rose-500 text-white px-6 py-2.5 md:px-8 md:py-3 rounded-full font-medium hover:bg-rose-600 transition-all duration-300 shadow-lg"
              >
                Shop Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/deal" 
                className="flex items-center gap-2 bg-white border border-rose-200 text-rose-900 px-6 py-2.5 md:px-8 md:py-3 rounded-full font-medium hover:bg-rose-50 transition-all duration-300 shadow-sm"
              >
                Lookbook
              </Link>
            </div>
        </div>

        {/* --- RIGHT SIDE: Dynamic Images --- */}
        <div className="hidden md:flex w-1/2 relative h-[500px] items-center justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-rose-300/20 rounded-full blur-3xl"></div>
            <div className="relative w-[350px] h-[400px]">
                {/* Image 1 (Back) */}
                <div className="absolute top-0 right-10 w-52 aspect-[3/4] bg-white p-2 shadow-lg -rotate-6 z-10 animate-float" style={{ animationDelay: '0.5s' }}>
                    <div className="relative w-full h-full overflow-hidden">
                        <Image 
                           src={content.img1} 
                           alt="Jewelry Back" 
                           fill 
                           className="object-cover hover:scale-105 transition-transform duration-700" 
                        />
                    </div>
                </div>
                {/* Image 2 (Front) */}
                <div className="absolute top-12 left-0 w-56 aspect-[3/4] bg-white p-2 shadow-2xl rotate-3 z-20 animate-float" style={{ animationDelay: '0.7s' }}>
                    <div className="relative w-full h-full overflow-hidden">
                        <Image 
                           src={content.img2} 
                           alt="Jewelry Front" 
                           fill 
                           className="object-cover hover:scale-105 transition-transform duration-700" 
                        />
                    </div>
                </div>
            </div>
        </div>

      </Container>

      {/* --- MARQUEE --- */}
      {/* FIX 4: Increased padding (py-4) so text isn't cut off */}
      <div className="w-full bg-[#fae8e8] border-t border-rose-200 py-4 relative z-20">
         <div className="flex w-full whitespace-nowrap overflow-hidden">
            <div className="flex animate-scroll min-w-full shrink-0 justify-around gap-10 md:gap-16 px-4 md:px-8">
              {features.map((text, i) => (
                <span key={i} className="text-xs md:text-sm font-semibold tracking-[0.15em] text-stone-800 uppercase flex items-center gap-2">
                  {text}
                </span>
              ))}
            </div>
            <div className="flex animate-scroll min-w-full shrink-0 justify-around gap-10 md:gap-16 px-4 md:px-8" aria-hidden="true">
              {features.map((text, i) => (
                <span key={i} className="text-xs md:text-sm font-semibold tracking-[0.15em] text-stone-800 uppercase flex items-center gap-2">
                  {text}
                </span>
              ))}
            </div>
         </div>
      </div>
    </div>
  )
}

export default HomeBanner