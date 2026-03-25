"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { client } from '@/sanity/lib/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image'; 

export default function PremiumImageSlider() {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const query = `*[_type == "imageSlider" && !(_id in path("drafts.**"))][0]{ "imageUrls": images[].asset->url }`;
        const data = await client.fetch(query);
        
        if (data?.imageUrls && data.imageUrls.length > 0) {
          setImages(data.imageUrls);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setIsLoading(false); 
      }
    };
    
    fetchImages();
  }, []);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Autoplay - 6 seconds rakha hai taaki slow zoom effect ka maza aaye
  useEffect(() => {
    if (images.length === 0) return;
    const intervalId = setInterval(nextImage, 6000); 
    return () => clearInterval(intervalId); 
  }, [images.length, nextImage]);

  if (isLoading) {
    return (
      <div className="h-[65vh] md:h-[90vh] w-full flex flex-col items-center justify-center bg-[#0a0a0a] text-white">
        <div className="w-12 h-12 border-t-2 border-white/50 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-light tracking-[0.3em] uppercase text-white/70">Curating Collection...</p>
      </div>
    );
  }

  if (!isLoading && images.length === 0) return null;

  return (
    // Height optimized: Mobile pe 65vh (thoda lamba), Desktop pe 90vh (almost full screen)
    <section className="relative w-full h-[65vh] md:h-[90vh] bg-[#0a0a0a] overflow-hidden group">
      
      <AnimatePresence mode="sync">
        {/* Layer 1: Fade In/Out for slide transition */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Layer 2: Slow "Ken Burns" Zoom effect while the image is active */}
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
              priority // Very important for LCP speed
              quality={100} // High fidelity for jewelry details
              className="object-cover object-center" 
              sizes="100vw"
            />
          </motion.div>

          {/* Luxury Vignette & Gradient Overlays */}
          {/* Center transparent, edges dark (Vignette) */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)] z-10 pointer-events-none" />
          {/* Bottom gradient for indicators/text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 z-10 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* --- GLASSMORPHISM NAVIGATION ARROWS --- */}
      {/* Mobile me chhote aur subtle, Desktop pe bade aur group-hover pe dikhenge */}
      <button 
        onClick={prevImage}
        className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 z-50 p-2 md:p-4 rounded-full bg-black/10 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 opacity-70 md:opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft strokeWidth={1.5} className="w-5 h-5 md:w-8 md:h-8" />
      </button>

      <button 
        onClick={nextImage}
        className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 z-50 p-2 md:p-4 rounded-full bg-black/10 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 opacity-70 md:opacity-0 group-hover:opacity-100"
      >
        <ChevronRight strokeWidth={1.5} className="w-5 h-5 md:w-8 md:h-8" />
      </button>

      {/* --- PREMIUM LINE INDICATORS --- */}
      {/* Dots ki jagah ab classy lines hain (jaise high-end brands me hoti hain) */}
      <div className="absolute bottom-6 md:bottom-12 left-0 right-0 z-50 flex justify-center gap-2 md:gap-3 px-4">
        {images.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrentIndex(i)} 
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