"use client";

import React from 'react'
import Container from './Container'
import Link from 'next/link'
import Logo1 from './Logo1'
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react'

function Footer() {
  return (
    // Reduced padding: pt-12 pb-6 (Pehle pt-20 thi)
    <footer className="bg-[#fffcf8] border-t border-stone-100 pt-12 pb-6">
        
        <Container>
            
            {/* Main Grid: Desktop = 4 Cols, Mobile = Stacked with internal grid */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 justify-between mb-10">
                
                {/* --- 1. BRAND & SOCIALS (Left Side) --- */}
                <div className="md:w-1/3 flex flex-col gap-4">
                    <div className="scale-90 origin-left">
                        <Logo1 />
                    </div>
                    <p className="text-stone-500 text-xs md:text-sm leading-relaxed max-w-xs">
                        Crafting timeless elegance for the modern soul. 
                    </p>
                    
                    {/* Compact Social Icons */}
                    <div className="flex items-center gap-3 mt-1">
                        {[Facebook, Instagram, Twitter].map((Icon, i) => (
                            <Link key={i} href="#" className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all">
                                <Icon size={16} strokeWidth={1.5} />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* --- 2. LINKS SECTION (Right Side - 3 Cols on Desktop, 2 on Mobile) --- */}
                {/* Mobile Friendly Trick: 'grid-cols-2' on mobile keeps links side-by-side instead of long list */}
                <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-8">
                    
                    {/* Col A: Customer Care */}
                    <div>
                        <h3 className="font-serif text-base font-medium text-stone-900 mb-4">Help</h3>
                        <ul className="flex flex-col gap-2.5">
                           
                            <li><Link href="/shipping" className="text-xs text-stone-500 hover:text-rose-500 transition-colors">Shipping & Returns</Link></li>
                            <li><Link href="/faq" className="text-xs text-stone-500 hover:text-rose-500 transition-colors">FAQs</Link></li>
                            <li><Link href="/care" className="text-xs text-stone-500 hover:text-rose-500 transition-colors">Jewelry Care</Link></li>
                        </ul>
                    </div>

                    {/* Col B: Contact (Updated Info) */}
                    <div>
                        <h3 className="font-serif text-base font-medium text-stone-900 mb-4">Contact</h3>
                        <ul className="flex flex-col gap-3">
                            {/* Address */}
                            <li className="flex gap-2 items-start">
                                <MapPin size={14} className="text-rose-500 mt-0.5 shrink-0" />
                                <span className="text-xs text-stone-500 leading-relaxed">
                                    Shop 4-8, Vraj Bhumi Apt, Opp Central Park, Untwadi Road, Nashik - 422008
                                </span>
                            </li>

                            {/* Phones */}
                            <li className="flex gap-2 items-start">
                                <Phone size={14} className="text-rose-500 mt-0.5 shrink-0" />
                                <div className="flex flex-col gap-1">
                                    <a href="tel:02532379212" className="text-xs text-stone-500 hover:text-rose-500">
                                        0253-2379212
                                    </a>
                                    <span className="text-xs text-stone-500">
                                        +91 9673610006 | +91 9209833606
                                    </span>
                                </div>
                            </li>

                            {/* Email */}
                            <li className="flex gap-2 items-center">
                                <Mail size={14} className="text-rose-500 shrink-0" />
                                <a href="mailto:kankariya29777@gmail.com" className="text-xs text-stone-500 hover:text-rose-500 break-all">
                                    kankariya29777@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>

                     {/* Col C: Legal (Desktop only separate col, Mobile hidden/merged) */}
                     <div className="hidden md:block">
                        <h3 className="font-serif text-base font-medium text-stone-900 mb-4">Legal</h3>
                        <ul className="flex flex-col gap-2.5">
                            <li><Link href="#" className="text-xs text-stone-500 hover:text-rose-500 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="text-xs text-stone-500 hover:text-rose-500 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                </div>
            </div>

            {/* --- BOTTOM BAR (Compact) --- */}
            <div className="border-t border-stone-200/60 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
                <p className="text-[10px] md:text-xs text-stone-400">
                    © {new Date().getFullYear()} Kankariya Jewellers. All rights reserved.
                </p>
                {/* Mobile Legal Links (Visible only on mobile bottom bar) */}
                <div className="flex md:hidden gap-4">
                     <Link href="#" className="text-[10px] text-stone-400 hover:text-rose-500">Privacy</Link>
                     <Link href="#" className="text-[10px] text-stone-400 hover:text-rose-500">Terms</Link>
                </div>
            </div>

        </Container>


    </footer>
  )
}

export default Footer