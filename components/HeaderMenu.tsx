"use client"; // 1. Ye zaroori hai active page check karne ke liye

import React from 'react'
import { headerData } from '@/constants/data'
import Link from 'next/link'
import { usePathname } from 'next/navigation' // 2. Hook import kiya
import { ChevronDown } from 'lucide-react'

const HeaderMenu = () => {
  const pathname = usePathname(); // Current page ka path

  return (
    <nav className="hidden md:flex items-center gap-x-8">
      {headerData.map((item, index) => {
        const isActive = pathname === item.href; // Check kiya ki kya hum is page par hain?

        return (
          <div key={index} className="relative group">
            
            {/* Main Link */}
            <Link 
              href={item.href} 
              className={`relative flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] py-4 transition-all duration-300
                ${isActive 
                  ? "font-bold text-black" // Active hai to Bold aur Black
                  : "font-semibold text-stone-600 hover:text-black group-hover:font-bold" // Nahi to Grey, hover par Black/Bold
                }
              `}
            >
              {item.title}
              
              {/* Arrow Icon */}
              {item.submenu && (
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-300 group-hover:rotate-180 
                    ${isActive ? "text-black" : "text-stone-400 group-hover:text-black"}`
                  } 
                />
              )}

              {/* --- 3. ANIMATED SLIDING LINE --- */}
              <span className={`absolute left-0 bottom-2 h-[2px] bg-rose-500 transition-all duration-300 ease-out
                ${isActive ? "w-full" : "w-0 group-hover:w-full"} 
              `}></span>
              {/* Note: 'bottom-2' se line text se thoda door (offset) rahegi */}

            </Link>

            {/* Dropdown Menu */}
            {item.submenu && (
              <div className="absolute top-full left-0 w-60 bg-white shadow-lg border border-stone-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
                
                {/* Premium Background Look */}
                <div className="bg-[#fae8e8] p-5 flex flex-col gap-3">
                  {item.submenu.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      href={subItem.href}
                      className="text-xs text-stone-500 hover:text-rose-500 font-medium tracking-wider uppercase transition-colors block hover:translate-x-1 duration-200"
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
                
              </div>
            )}

          </div>
        );
      })}
    </nav>
  )
}

export default HeaderMenu