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
import MobileMenu from './MobileMene'; // Make sure file name matches (MobileMene.tsx or MobileMenu.tsx)
import { LayoutDashboard, ShoppingBag } from 'lucide-react'; 
import { ClerkLoaded, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';

const Header = () => {
  const { user } = useUser();
  const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID || "";

  return (
    <header className='sticky top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100'>
      
      <Container className='relative flex items-center justify-between py-3 md:py-4'>
        
        {/* --- 1. LEFT SECTION (Mobile Menu & Desktop Logo) --- */}
        <div className='flex items-center gap-4'>
            {/* Mobile Menu Icon */}
            <div className="md:hidden">
                <MobileMenu />
            </div>
            
            {/* Desktop Logo */}
            <div className="hidden md:block hover:opacity-90 transition-opacity">
                <Logo1 />
            </div>
        </div>

        {/* --- 2. CENTER LOGO (Mobile Only) --- */}
        <div className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
            {/* pointer-events-none isliye taaki agar logo bada ho to buttons block na kare */}
            <div className="pointer-events-auto">
              <Logo1 />
            </div>
        </div>

        {/* --- 3. CENTER MENU (Desktop Only) --- */}
        <div className="hidden md:block flex-1 px-8"> 
           {/* flex-1 taaki menu beech me space le sake */}
            <div className="flex justify-center">
              <HeaderMenu/>
            </div>
        </div>

        {/* --- 4. RIGHT SECTION (Search, Cart, User) --- */}
        <div className="flex items-center gap-x-4 md:gap-x-6 relative z-10">
            
            {/* Search Bar (Desktop) */}
            <div className="hidden lg:block w-35">
                <SearchBar />
            </div>

            {/* --- USER ACTIONS (Login/Profile) --- */}
            <div className="flex items-center gap-x-3 md:gap-x-5">
                
                {/* User Profile / Sign In */}
                <ClerkLoaded>
                    <SignedIn>
                        <UserButton afterSignOutUrl="/">
                            <UserButton.MenuItems>
                                <UserButton.Link
                                    label="My Orders"
                                    labelIcon={<ShoppingBag size={15} />}
                                    href="/my-orders"
                                />
                                {user?.id === ADMIN_ID && (
                                    <UserButton.Link
                                        label="Admin Dashboard"
                                        labelIcon={<LayoutDashboard size={15} />}
                                        href="/admin"
                                    />
                                )}
                                <UserButton.Action label="manageAccount" />
                            </UserButton.MenuItems>
                        </UserButton>
                    </SignedIn>

                    <SignedOut>
                        <SignIn />
                    </SignedOut>
                </ClerkLoaded>
                
                {/* Wishlist (Desktop Only) */}
                <div className="hidden md:block text-gray-600 hover:text-kankariya-red transition-colors duration-300">
                    <FavoriteButton />
                </div>
            </div>

            {/* Cart Icon (Always Visible) */}
            <div className="text-gray-700 hover:text-kankariya-red transition-colors duration-300">
                <CartIcon />
            </div>
        </div>
       
      </Container>
    </header>
  );
};

export default Header;