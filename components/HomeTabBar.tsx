'use client'
import { productType } from '@/constants/data';
import Link from 'next/link';
import React from 'react';
import { ArrowRight } from 'lucide-react';

interface Props {
  selectedTab: string;
  onTabSelect: (tab: string) => void;
}

function HomeTabBar({ selectedTab, onTabSelect }: Props) {
  
  const tabs = ['All', ...productType?.map((item) => item.title)];

  return (
    <div className='flex items-center justify-between gap-5 my-6'>
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- Filter Buttons --- */}
      <div className='flex items-center gap-3 w-full md:w-auto overflow-x-auto scrollbar-hide py-2 px-1'>
        {tabs.map((tabName) => {
           const isActive = selectedTab === tabName;
           
           return (
            <button 
              key={tabName}
              onClick={() => onTabSelect(tabName)}
              // 👇 YE LINE ADD KAREIN (Extension errors ignore karne ke liye)
              suppressHydrationWarning={true} 
              className={`
                whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border flex-shrink-0
                ${isActive 
                  ? 'bg-rose-500 text-white border-rose-600 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-rose-50 hover:border-rose-200'
                }
              `}
            >
                {tabName}
            </button>
           )
        })}
      </div>

      {/* --- See All Link --- */}
      <Link 
        href={"/catalog"} 
        className='hidden md:flex items-center gap-2 text-rose-600 hover:text-rose-700 font-semibold hover:underline transition-all'
      >
        See All
        <ArrowRight size={16} />
      </Link>
    </div>
  )
}

export default HomeTabBar