"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const videos = [
  { 
    id: 1, 
    src: '/videos/video1.mp4', 
    subtitle: 'KANKARIYA EXCLUSIVE',
    title: 'The Royal Heritage' 
  },
  { 
    id: 2, 
    src: '/videos/video2.mp4', 
    subtitle: 'EVERYDAY ELEGANCE',
    title: 'Modern Minimalism' 
  }
];

export default function VideoSlider() {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nextIndex = (index + 1) % videos.length;

  useEffect(() => {
    if (mounted && videoRefs.current[index]) {
      videoRefs.current[index]?.play().catch(() => {});
    }
  }, [index, mounted]);

  if (!mounted) return <div className="w-full h-[60vh] md:h-[80vh] bg-[#0a0a0a]" />;

  return (
    <section className="relative w-full h-[60vh] md:h-[85vh] bg-[#0a0a0a] overflow-hidden flex items-center justify-center py-10 perspective-[1200px]">
      
      {/* Background Subtle Gold Glow for Luxury Feel */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[60vw] h-[60vw] bg-[#C5A25D] rounded-full blur-[150px] opacity-10"></div>
      </div>

      <div className="relative w-full h-full max-w-6xl px-4 flex items-center justify-center z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`video-${index}`}
            initial={{ opacity: 0, rotateY: 45, scale: 0.85 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: -45, scale: 0.85 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} // Custom Apple-like smooth easing
            className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-[0_20px_80px_rgba(197,162,93,0.15)] border border-white/10 bg-black group"
          >
            <video
              ref={(el) => { videoRefs.current[index] = el; }}
              src={videos[index].src}
              autoPlay
              muted 
              playsInline
              onEnded={() => setIndex(nextIndex)}
              className="w-full h-full object-contain transition-transform duration-[10s] ease-linear group-hover:scale-105"
            />

            {/* Premium Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col items-center justify-end pb-16 text-center px-6">
              
              {/* Cinematic Reveal for Subtitle */}
              <div className="overflow-hidden mb-3">
                <motion.p 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                  className="text-[#C5A25D] text-xs md:text-sm font-bold tracking-[0.4em] uppercase"
                >
                  {videos[index].subtitle}
                </motion.p>
              </div>
              
              {/* Cinematic Reveal for Title */}
              <div className="overflow-hidden mb-10">
                <motion.h2 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                  className="text-white text-4xl md:text-6xl font-serif drop-shadow-lg"
                >
                  {videos[index].title}
                </motion.h2>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                <Link 
                  href="/shop" 
                  className="bg-transparent border border-white/50 text-white px-10 py-3.5 rounded-full font-semibold text-sm tracking-widest hover:bg-white hover:text-black hover:border-white transition-all duration-500 backdrop-blur-sm"
                >
                  DISCOVER COLLECTION
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Interactive Clickable Indicators */}
      <div className="absolute bottom-8 flex gap-4 z-30">
        {videos.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setIndex(i)}
            suppressHydrationWarning
            aria-label={`Go to video ${i + 1}`}
            className="group py-2 focus:outline-none" // Extra padding for easier clicking
          >
            <div 
              className={`h-1 rounded-full transition-all duration-700 ${
                index === i 
                  ? 'w-16 bg-[#C5A25D] shadow-[0_0_10px_#C5A25D]' 
                  : 'w-6 bg-white/30 group-hover:bg-white/60'
              }`} 
            />
          </button>
        ))}
      </div>
    </section>
  )
}