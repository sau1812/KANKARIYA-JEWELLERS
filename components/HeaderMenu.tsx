"use client"; 

import React from 'react'
import { headerData } from '@/constants/data'
import Link from 'next/link'
import { usePathname } from 'next/navigation' 
import { ChevronDown } from 'lucide-react'

const HeaderMenu = () => {
  const pathname = usePathname(); 

  return (
    <nav className="hidden md:flex items-center gap-x-8 lg:gap-x-12"> 
      {headerData.map((item, index) => {
        const isActive = pathname === item.href; 
        const isSubMenuActive = item.submenu?.some(sub => pathname === sub.href);
        const finalActive = isActive || isSubMenuActive;

        return (
          <div key={index} className="relative group h-full flex items-center">
            
            {/* --- Main Link --- */}
            <Link 
              href={item.href} 
              className={`relative flex items-center gap-1.5 text-[13px] uppercase tracking-[0.15em] py-6 transition-all duration-300
                ${finalActive 
                  ? "font-bold text-kankariya-red" 
                  : "font-semibold text-gray-600 hover:text-kankariya-red" 
                }
              `}
            >
              {item.title}
              
              {/* Arrow Icon */}
              {item.submenu && (
                <ChevronDown 
                  size={14} 
                  strokeWidth={2}
                  className={`transition-transform duration-300 group-hover:-rotate-180 
                    ${finalActive ? "text-kankariya-red" : "text-gray-400 group-hover:text-kankariya-red"}`
                  } 
                />
              )}

              {/* Animated Underline */}
              <span className={`absolute left-0 bottom-5 h-[2px] bg-kankariya-red transition-all duration-300 ease-out rounded-full
                ${finalActive ? "w-full" : "w-0 group-hover:w-full"} 
              `}></span>

            </Link>

            {/* --- Dropdown Menu --- */}
            {item.submenu && (
              // 1. Invisible "Bridge" (pt-6) prevents menu from closing when moving mouse down
              <div className="absolute top-full -left-5 pt-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                
                {/* 2. Actual Visual Box */}
                <div className="w-60 bg-white/95 backdrop-blur-sm shadow-2xl border-t-[3px] border-kankariya-red rounded-b-md overflow-hidden transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  
                  <div className="flex flex-col py-3 px-2">
                    {item.submenu.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        className="group/item flex items-center justify-between px-4 py-3 text-[12px] font-medium text-gray-500 hover:text-kankariya-red hover:bg-red-50 rounded-md transition-all duration-200"
                      >
                        {/* Text slides right on hover */}
                        <span className="uppercase tracking-widest transition-transform duration-300 group-hover/item:translate-x-2">
                          {subItem.title}
                        </span>

                        {/* Optional: Small dot appears on hover */}
                        <span className="w-1.5 h-1.5 rounded-full bg-kankariya-red opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></span>
                      </Link>
                    ))}
                  </div>
                  
                </div>
              </div>
            )}

          </div>
        );
      })}
    </nav>
  )
}

export default HeaderMenu;