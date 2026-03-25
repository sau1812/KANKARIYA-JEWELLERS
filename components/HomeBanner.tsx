import React from 'react'
// import Link from 'next/link'
// import Container from './Container'
// import { ArrowRight, Star } from 'lucide-react'
// import { client } from '@/sanity/lib/client'

/* --- COMMENTED OUT DEFAULT DATA ---
const fallbackData = { ... }
*/

/* --- COMMENTED OUT FETCH FUNCTION ---
async function getHeroData() { ... }
*/

const features = [
  "PURE SILVER (925)", "LIFETIME SHINE", "NICKEL FREE", "CERTIFIED QUALITY", "HANDCRAFTED"
];

// --- 3. SERVER COMPONENT ---
export default async function HomeBanner() {
  
  /* --- COMMENTED OUT DATA FETCHING ---
  const sanityData = await getHeroData();
  const content = { ... };
  */

  return (
    <section className="relative w-full overflow-hidden">
      
      {/* --- SCROLL ANIMATION (Zaroori hai marquee chalne ke liye) --- */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-scroll { 
          animation: scroll 15s linear infinite; 
        }
      `}</style>

      {/* =========================================
          HERO SECTION COMMENTED OUT START
      ========================================= */}
      {/* <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#C5A25D] opacity-[0.03] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#D61C22] opacity-[0.03] rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <Container className="relative z-10 pt-10 pb-16 md:py-20">
        <div className="flex flex-col-reverse md:flex-row items-center gap-10 md:gap-20">
           ... (Pura hero content yahan tha) ...
        </div>
      </Container>
      */}
      {/* =========================================
          HERO SECTION COMMENTED OUT END
      ========================================= */}


      {/* --- Marquee (Sirf Ye Dikhai Dega Ab) --- */}
      <div className="w-full bg-[#1A1A1A] py-3 overflow-hidden border-t-4 border-[#C5A25D]">
        <div className="flex w-full whitespace-nowrap">
           
           {/* First Loop */}
           <div className="flex animate-scroll min-w-full shrink-0 justify-around gap-16 px-8">
             {features.map((text, i) => (
               <span key={i} className="text-xs md:text-sm font-bold tracking-[0.2em] text-[#C5A25D] uppercase flex items-center gap-3">
                 <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                 {text}
               </span>
             ))}
           </div>

           {/* Second Loop (Infinite scroll illusion ke liye) */}
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