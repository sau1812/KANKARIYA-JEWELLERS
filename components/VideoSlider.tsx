"use client";

import React, { useState, useEffect, useRef } from 'react';
import { client } from '@/sanity/lib/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Icons ke liye

export default function PremiumVideoSlider() {
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const query = `*[_type == "videoSlider"][0]{ "videoUrls": videos[].asset->url }`;
      const data = await client.fetch(query);
      if (data?.videoUrls) setVideos(data.videoUrls);
    };
    fetchVideos();
  }, []);

  const nextVideo = () => setCurrentIndex((prev) => (prev + 1) % videos.length);
  const prevVideo = () => setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);

  if (videos.length === 0) return <div className="h-screen flex items-center justify-center bg-[#FDF7F2]">Loading...</div>;

  const getIndex = (offset: number) => (currentIndex + offset + videos.length) % videos.length;

  return (
    <section className="relative w-full h-screen bg-[#FDF7F2] flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background Text Overlay */}
      <div className="absolute top-10 left-10 opacity-10 text-6xl font-serif italic select-none">
        Kankariya Jewellers
      </div>

      <div className="relative flex items-center justify-center w-full max-w-7xl h-[80vh]">
        
        {/* --- LEFT ARROW --- */}
        <button 
          onClick={prevVideo}
          className="absolute left-4 md:left-12 z-50 p-4 rounded-full bg-white/30 backdrop-blur-lg border border-white/50 text-black hover:bg-white/60 transition-all shadow-xl group"
        >
          <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
        </button>

        <AnimatePresence mode="popLayout">
          {[-1, 0, 1].map((offset) => {
            const index = getIndex(offset);
            const isActive = offset === 0;

            return (
              <motion.div
                key={`${index}-${offset}`}
                initial={{ opacity: 0, x: offset * 100, scale: 0.8 }}
                animate={{ 
                  opacity: isActive ? 1 : 0.4, 
                  x: offset * 350, 
                  scale: isActive ? 1.1 : 0.85,
                  zIndex: isActive ? 40 : 10,
                  filter: isActive ? "blur(0px) grayscale(0%)" : "blur(6px) grayscale(100%)",
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                className="absolute w-[320px] md:w-[400px] h-[600px]"
              >
                <video
                  ref={isActive ? videoRef : null}
                  src={videos[index]}
                  autoPlay
                  muted
                  loop={!isActive}
                  onEnded={isActive ? nextVideo : undefined}
                  className={`w-full h-full object-cover rounded-[2.5rem] shadow-2xl border-[8px] ${isActive ? 'border-white' : 'border-white/40'}`}
                  playsInline
                />
                
                {isActive && (
                   <div className="absolute bottom-8 right-10 text-white font-mono text-sm bg-black/30 backdrop-blur-md px-3 py-1 rounded-lg">
                     00:{currentIndex + 12}
                   </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* --- RIGHT ARROW --- */}
        <button 
          onClick={nextVideo}
          className="absolute right-4 md:right-12 z-50 p-4 rounded-full bg-white/30 backdrop-blur-lg border border-white/50 text-black hover:bg-white/60 transition-all shadow-xl group"
        >
          <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
        </button>

      </div>

      {/* Video Indicator Dots */}
      <div className="flex gap-3 mt-8 z-50">
        {videos.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 transition-all duration-500 rounded-full ${i === currentIndex ? 'w-10 bg-black' : 'w-2 bg-black/20'}`}
          />
        ))}
      </div>

    </section>
  );
}