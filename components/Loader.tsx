// components/Loader.tsx
import React from 'react';
import Image from 'next/image';

const Loader = () => {
  return (
    // 1. Full screen fixed background (jo aapki site ka bg color hai)
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#fffcf8]">
      
      {/* 2. Logo Container with Animation */}
      {/* 'animate-breathing-slow' class yahan lagayi hai jo humne config me banayi thi */}
      <div className="relative w-36 h-36 md:w-44 md:h-44 animate-breathing-slow">
        <Image
          // 👇 Apne logo ka sahi path yahan dalein
          src="/images/loding_logo.png" 
          alt="Loading Kankariya Jewellers..."
          fill
          className="object-contain"
          priority // Loading image ko priority de
        />
      </div>
      
      {/* Optional: Niche text bhi dikha sakte hain */}
      {/* <p className="absolute mt-48 text-stone-500 font-serif tracking-widest text-sm animate-pulse">LOADING...</p> */}
    </div>
  );
};

export default Loader;