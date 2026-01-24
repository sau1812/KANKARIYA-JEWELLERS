import Image from "next/image";

export default function Loading() {
  return (
    // 1. Glass Effect Background (Halka White + Blur)
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fffcf8]/80 backdrop-blur-sm">
      
      <div className="relative flex flex-col items-center">
        
        {/* 2. Golden Ring Spinner (Jewelry feel ke liye) */}
        <div className="absolute w-36 h-36 md:w-52 md:h-52 rounded-full border-[3px] border-transparent border-t-rose-500 border-r-rose-300 animate-spin-slow"></div>
        
        {/* 3. Logo Animation (Pulse) */}
        <div className="relative w-24 h-24 md:w-36 md:h-36 animate-breathing mt-6">
          <Image
            src="/images/loding_logo.png"
            alt="Loading..."
            fill
            className="object-contain"
            priority={true}
          />
        </div>

        {/* 4. Elegant Text */}
        <p className="mt-8 text-rose-800 font-serif tracking-[0.2em] text-xs md:text-sm animate-pulse">
          CRAFTING ELEGANCE...
        </p>

      </div>
    </div>
  );
}