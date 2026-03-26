"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image'; 

interface SliderProps {
  images: string[];
}

export default function PremiumImageSlider({ images }: SliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 1. Hydration fix: Yeh ensure karega ki component sirf client par load ho
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    // Agar mount nahi hua ya images nahi hain toh interval start mat karo
    if (!isMounted || !images || images.length === 0) return;
    
    const intervalId = setInterval(nextImage, 3000); 
    return () => clearInterval(intervalId); 
  }, [images.length, nextImage, isMounted, images]);

  // 2. Hydration aur empty data check
  if (!isMounted || !images || images.length === 0) return null;

  return (
    <section className="relative w-full h-[65vh] md:h-[90vh] bg-[#0a0a0a] overflow-hidden group">
      <AnimatePresence mode="sync">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.1 }}
            transition={{ duration: 10, ease: "linear" }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={images[currentIndex]}
              alt={`Kankariya Premium Collection ${currentIndex + 1}`}
              fill
              // Pehli image priority par load hogi, LCP (speed) ke liye best hai
              priority={currentIndex === 0} 
              quality={85} 
              className="object-cover object-center" 
              sizes="(max-width: 768px) 100vw, 100vw"
            />
          </motion.div>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)] z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 z-10 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* --- GLASSMORPHISM NAVIGATION ARROWS --- */}
      <button 
        onClick={prevImage}
        suppressHydrationWarning
        className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 z-50 p-2 md:p-4 rounded-full bg-black/10 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 opacity-70 md:opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft strokeWidth={1.5} className="w-5 h-5 md:w-8 md:h-8" />
      </button>

      <button 
        onClick={nextImage}
        suppressHydrationWarning
        className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 z-50 p-2 md:p-4 rounded-full bg-black/10 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 opacity-70 md:opacity-0 group-hover:opacity-100"
      >
        <ChevronRight strokeWidth={1.5} className="w-5 h-5 md:w-8 md:h-8" />
      </button>

      {/* --- PREMIUM LINE INDICATORS --- */}
      <div className="absolute bottom-6 md:bottom-12 left-0 right-0 z-50 flex justify-center gap-2 md:gap-3 px-4">
        {images.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrentIndex(i)} 
            suppressHydrationWarning
            className={`h-[2px] md:h-[3px] rounded-full transition-all duration-700 ease-in-out ${
              i === currentIndex ? 'w-10 md:w-16 bg-white' : 'w-4 md:w-6 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}