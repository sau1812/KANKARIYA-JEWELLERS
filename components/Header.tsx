"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Container from './Container'; 
import HeaderMenu from './HeaderMenu';
import SearchBar from './SearchBar';
import FavoriteButton from './FavoriteButton';   
import CartIcon from './CartIcon';
import SignIn from './SignIn';
import Logo1 from './Logo1';
import MobileMenu from './MobileMene'; 
import { LayoutDashboard, ShoppingBag, Search, X } from 'lucide-react'; 
import { ClerkLoaded, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { client } from '@/sanity/lib/client'; 

const Header = () => {
  const { user } = useUser();
  const [coupon, setCoupon] = useState<{code: string, discountPercentage: number} | null>(null);
  
  const [silverRate, setSilverRate] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const adminIds = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(',') || [];
  const isAdmin = user?.id ? adminIds.includes(user.id) : false;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const [couponData, rateData] = await Promise.all([
          client.fetch(`*[_type == "coupon" && isActive == true][0]{code, discountPercentage}`),
          client.fetch(`*[_type == "silverRate"][0]{ratePerGram}`)
        ]);
        
        setCoupon(couponData);
        if (rateData?.ratePerGram) setSilverRate(rateData.ratePerGram);

      } catch (error) {
        console.error("Header data fetch error:", error);
      }
    };
    fetchHeaderData();
  }, []);

  return (
    <header className='sticky top-0 w-full z-50 flex flex-col transition-all duration-500'>
      
      {/* 👇 YAHAN FIX KIYA HAI: relative aur z-20 add kiya taaki menu hamesha upar rahe */}
      <div className='relative z-20 w-full bg-[#FCFBF8]/95 backdrop-blur-2xl border-b border-gray-200'>
        {/* --- TOP DYNAMIC ANNOUNCEMENT BAR --- */}
        <div 
          className={`w-full bg-[#F5F3EC] text-stone-600 font-sans tracking-[0.1em] md:tracking-[0.2em] text-center font-medium border-b border-gray-200 transition-all duration-500 overflow-hidden flex items-center justify-center
            ${isScrolled ? 'max-h-0 py-0 opacity-0 border-transparent' : 'max-h-16 py-2 md:py-2.5 opacity-100'}
          `}
        >
          <Container>
            {coupon ? (
              <div className="flex items-center justify-center text-[10px] md:text-xs">
                <span className="hidden md:flex items-center gap-2">
                  ✨ <span className="font-bold text-stone-800 uppercase tracking-widest">Special Offer:</span> 
                  Use code <span className="font-bold text-kankariya-charcoal border border-stone-300 px-1.5 py-0.5 rounded-sm uppercase bg-white/50">{coupon.code}</span> 
                  for {coupon.discountPercentage}% off ✨
                </span>
                <span className="md:hidden flex items-center gap-1.5">
                  <span className="font-bold text-stone-800">{coupon.discountPercentage}% Off</span>
                  <span className="text-stone-300">|</span>
                  <span>Code: <span className="font-bold text-kankariya-charcoal uppercase tracking-wider">{coupon.code}</span></span>
                  <span className="ml-1">✨</span>
                </span>
              </div>
            ) : (
              <span className="text-[10px] md:text-xs tracking-[0.15em]">Complimentary shipping on all orders</span>
            )}
          </Container>
        </div>

        {/* --- MAIN NAVBAR --- */}
        <Container className={`relative flex items-center justify-between transition-all duration-500 ${isScrolled ? 'py-3 md:py-3' : 'py-4 md:py-6'}`}>
          <div className='flex items-center gap-6'>
              <div className="md:hidden text-stone-800 hover:text-kankariya-gold transition-colors duration-500 cursor-pointer">
                  <MobileMenu />
              </div>
              <div className={`hidden md:block hover:opacity-80 transition-all duration-500 ${isScrolled ? 'scale-95' : 'scale-100'}`}>
                  <Logo1 />
              </div>
          </div>

          <div className={`md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-auto transition-transform duration-500 ${isScrolled ? 'scale-90' : 'scale-100'}`}>
              <Logo1 />
          </div>

          <div className="hidden md:flex flex-1 justify-center px-8 font-sans text-sm tracking-wide text-stone-800 font-medium capitalize"> 
              <HeaderMenu/>
          </div>

          <div className="flex items-center gap-x-5 md:gap-x-7 relative z-10 text-stone-800">
              <div className="hidden lg:flex items-center">
                 <div className={`transition-all duration-500 ease-in-out overflow-hidden flex justify-end ${isSearchOpen ? 'w-64 opacity-100 mr-3' : 'w-0 opacity-0 mr-0'}`}>
                    <div className="w-full">
                      <SearchBar />
                    </div>
                 </div>
                 
                 <div 
                   onClick={() => setIsSearchOpen(!isSearchOpen)} 
                   className="cursor-pointer hover:text-kankariya-gold transition-colors duration-500"
                 >
                   {isSearchOpen ? (
                     <X size={22} strokeWidth={1.25} />
                   ) : (
                     <Search size={22} strokeWidth={1.25} />
                   )}
                 </div>
              </div>

              <div className="hidden md:flex cursor-pointer hover:text-kankariya-gold transition-colors duration-500">
                  <FavoriteButton />
              </div>

              <div className="flex items-center">
                  <ClerkLoaded>
                      <SignedIn>
                          <UserButton 
                            afterSignOutUrl="/"
                            appearance={{
                              elements: {
                                avatarBox: "w-8 h-8 rounded-full border border-stone-300 hover:border-kankariya-gold transition-all duration-500"
                              }
                            }}
                          >
                              <UserButton.MenuItems>
                                  <UserButton.Link label="My Orders" labelIcon={<ShoppingBag size={14} />} href="/my-orders" />
                                  {isAdmin && <UserButton.Link label="Admin Dashboard" labelIcon={<LayoutDashboard size={14} />} href="/admin" />}
                                  <UserButton.Action label="manageAccount" />
                              </UserButton.MenuItems>
                          </UserButton>
                      </SignedIn>

                      <SignedOut>
                          <div className="text-sm font-sans tracking-wide hover:text-kankariya-gold transition-colors duration-500 cursor-pointer">
                            <SignIn />
                          </div>
                      </SignedOut>
                  </ClerkLoaded>
              </div>

              <div className="flex items-center cursor-pointer hover:text-kankariya-gold transition-colors duration-500 group">
                  <CartIcon />
              </div>
          </div>
        </Container>
      </div>

      {/* --- 3. THE "WOW" LIVE SILVER RATE BAR --- */}
      {silverRate !== null && (
        <div 
          // 👇 YAHAN BHI FIX KIYA HAI: relative z-10 taaki ye hamesha Navbar (z-20) ke peeche rahe
          className={`relative z-10 w-full transition-all duration-700 ease-in-out flex items-center justify-center overflow-hidden shadow-[0_4px_15px_rgba(180,142,75,0.2)]
            ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100'}
          `}
        >
          {/* Base Rich Gold Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#B48E4B] via-[#E8D07C] to-[#B48E4B]"></div>
          
          {/* Luxury Glass Shimmer Layer */}
          <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-white/40 to-transparent"></div>
          
          {/* Content */}
          <div className="relative z-10 flex items-center gap-2.5 py-1.5 md:py-2 px-4">
            
            {/* Pro Live Indicator */}
            <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-full w-full bg-red-600 shadow-[0_0_5px_#dc2626]"></span>
            </span>
            
            {/* Crisp Typography */}
            <span className="text-[10px] md:text-[11px] text-stone-900 font-sans tracking-[0.2em] md:tracking-[0.25em] uppercase font-bold flex items-center">
              Live Silver Rate 
              <span className="mx-2 md:mx-3 text-stone-900/40 text-[8px] md:text-[10px]">✦</span> 
              <span className="font-serif text-[13px] md:text-[15px] mr-0.5 tracking-normal font-bold">₹{silverRate.toLocaleString('en-IN')}</span> 
              <span className="text-[8px] md:text-[9px] mt-0.5 opacity-80">/ GM</span>
            </span>
            
          </div>
        </div>
      )}

    </header>
  );
};

export default Header;