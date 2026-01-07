"use client";

import React from 'react';
import Link from 'next/link';
import Container from './Container'; 
import HeaderMenu from './HeaderMenu';
import SearchBar from './SearchBar';
import FavoriteButton from './FavoriteButton';  
import CartIcon from './CartIcon';
import SignIn from './SignIn';
import Logo1 from './Logo1';
import MobileMenu from './MobileMene'; // 👈 Fixed Typo (was MobileMene)
import { Search, LayoutDashboard, ShoppingBag } from 'lucide-react'; 
import { ClerkLoaded, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';

const Header = () => {
  const { user } = useUser();
  // Best Practice: Fallback string empty rakhein taaki undefined error na aaye
  const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

  return (
    <header className='sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-stone-100'>
      
      <Container className='relative flex items-center justify-between py-3 md:py-4'>
        
        {/* --- 1. LEFT SECTION (Mobile Menu & Logo) --- */}
        <div className='flex items-center gap-4'>
            <div className="md:hidden">
                <MobileMenu />
            </div>
            <div className="hidden md:block scale-100 hover:scale-105 transition-transform origin-left">
                <Logo1 />
            </div>
        </div>

        {/* --- 2. CENTER LOGO (Mobile Only) --- */}
        <div className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
            <Logo1 />
        </div>

        {/* --- 3. CENTER MENU (Desktop Only) --- */}
        <div className="hidden md:block">
            <HeaderMenu/>
        </div>

        {/* --- 4. RIGHT SECTION (Search, Cart, User) --- */}
        <div className="flex items-center gap-x-3 md:gap-x-6 relative z-10">
            
            {/* Search Bar (Desktop) */}
            <div className="hidden md:block">
                <SearchBar />
            </div>

          

            {/* --- USER ACTIONS (Login/Profile) --- */}
            {/* 👇 Mobile par bhi dikhana zaroori hai isliye 'hidden' hata diya */}
            <div className="flex items-center gap-x-3 md:gap-x-5">
                
                <ClerkLoaded>
                    <SignedIn>
                        <UserButton afterSignOutUrl="/">
                            <UserButton.MenuItems>
                                {/* 1. My Orders */}
                                <UserButton.Link
                                    label="My Orders"
                                    labelIcon={<ShoppingBag size={15} />}
                                    href="/my-orders"
                                />

                                {/* 2. Admin Dashboard (Protected) */}
                                {user?.id === ADMIN_ID && (
                                    <UserButton.Link
                                        label="Admin Dashboard"
                                        labelIcon={<LayoutDashboard size={15} />}
                                        href="/admin"
                                    />
                                )}

                                <UserButton.Action label="manageAccount" />
                                <UserButton.Action label="signOut" />
                            </UserButton.MenuItems>
                        </UserButton>
                    </SignedIn>

                    <SignedOut>
                        {/* Mobile par Text hata kar sirf Icon dikhana behtar hota hai, par SignIn component handle karega */}
                        <SignIn />
                    </SignedOut>
                </ClerkLoaded>
                
                {/* Wishlist (Hidden on Mobile to save space, usually inside Menu) */}
                <div className="hidden md:block text-stone-700 hover:text-rose-500 transition-colors duration-300">
                    <FavoriteButton />
                </div>
            </div>

            {/* Cart Icon (Always Visible) */}
            <div className="text-stone-700 hover:text-black transition-colors duration-300">
                <CartIcon />
            </div>
        </div>
       
      </Container>
    </header>
  );
};

export default Header;