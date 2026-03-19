"use client"; // <-- Bas ye ek line sabse upar add karni thi!

import React, { useState } from 'react';

export default function VideoSlider() {
  // Yahan apne dono videos ke path daal dein
  const videos = [
    "/videos/video1.mp4", 
    "/videos/video2.mp4"  
  ];

  // State jo track karegi ki kaunsa video chal raha hai
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Ye function tab chalega jab ek video pura ho jayega
  const handleVideoEnd = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  return (
    <section className="relative w-full h-screen bg-black overflow-hidden flex justify-center items-center">
      
      {/* Background Video */}
      <video
        key={videos[currentVideoIndex]} 
        className="absolute top-0 left-0 w-full h-full object-cover md:object-contain"
        autoPlay
        muted
        playsInline 
        onEnded={handleVideoEnd} 
      >
        <source src={videos[currentVideoIndex]} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none"></div>


      
    </section>
  );
}