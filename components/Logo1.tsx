import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const Logo1 = ({ className }: { className?: string }) => {
  return (
    <Link href={"/"} className="flex-shrink-0">
            <Image
              src="/images/logo2-removebg-preview.png"
              alt="V's Studio"
              width={140} // Next.js ko bataya ki image choti load kare
              height={70}
              // Change 2: CSS width kam ki (Mobile: 100px, Desktop: 120px)
              // Pehle ye 140px/180px tha
              className="w-[100px] md:w-[120px] h-auto object-contain hover:opacity-80 transition-opacity"
              priority
            />
        </Link>
  );
};

export default Logo1;