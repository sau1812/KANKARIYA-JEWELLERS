"use client";

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { Menu, Search, Heart, ChevronDown, ChevronUp, LogIn, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { headerData } from '@/constants/data'
import Logo1 from './Logo1'
import { ClerkLoaded, SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs'

function MobileMenu() {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); 
  
  // 1. Naya State: Menu khula hai ya band, ye hum track karenge
  const [isSheetOpen, setIsSheetOpen] = useState(false); 

  const router = useRouter();

  const handleToggle = (title: string) => {
    setOpenItem(openItem === title ? null : title);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); 
    
    if (searchQuery.trim()) {
      // 2. Search hone par Sheet (Menu) ko forcefully band kar do
      setIsSheetOpen(false); 

      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      
      // Optional: Input clear karna ho to
      // setSearchQuery(""); 
    }
  };

  return (
    // 3. 'open' aur 'onOpenChange' add kiya taaki hum control kar sakein
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      
      <SheetTrigger asChild>
        <button 
            className='p-2 -ml-2 text-stone-600 hover:text-black transition-colors md:hidden'
            suppressHydrationWarning={true}
        >
          <Menu strokeWidth={1.5} className="w-6 h-6" />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[300px] bg-[#fffcf8] border-r border-stone-100 p-0 flex flex-col z-[60]">
        <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
        
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex justify-center">
            <SheetClose asChild>
                <div className="cursor-pointer"> 
                    <Logo1 />
                </div>
            </SheetClose>
        </div>

        {/* Search Bar */}
        <div className="p-4">
            <form 
                onSubmit={handleSearch}
                className='flex items-center bg-white border border-stone-200 rounded-md px-3 py-2'
            >
                <Search className="w-4 h-4 text-stone-400 mr-2" />
                <input 
                    type="text" 
                    placeholder="Search jewelry..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    // 4. 'autoFocus' nahi lagaya hai, isliye keyboard tabhi ayega jab user click karega.
                    className="bg-transparent outline-none text-sm text-stone-700 w-full placeholder:text-stone-400"
                />
            </form>
        </div>

        {/* Menu Links */}
        <div className="flex-1 overflow-y-auto py-2">
            <nav className="flex flex-col">
                {headerData.map((item, index) => (
                    <div key={index} className="border-b border-stone-50 last:border-0">
                        {item.submenu ? (
                            <div>
                                <button 
                                    onClick={() => handleToggle(item.title)}
                                    className="flex items-center justify-between w-full px-6 py-4 text-sm font-medium uppercase tracking-widest text-stone-600 hover:bg-stone-50 hover:text-black transition-colors"
                                >
                                    {item.title}
                                    {openItem === item.title ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                <div className={`bg-stone-50 overflow-hidden transition-all duration-300 ${openItem === item.title ? 'max-h-96 py-2' : 'max-h-0'}`}>
                                    {item.submenu.map((subItem, subIndex) => (
                                        <SheetClose key={subIndex} asChild>
                                            <Link 
                                                href={subItem.href}
                                                className="block px-8 py-3 text-xs font-medium uppercase tracking-wide text-stone-500 hover:text-rose-500 transition-colors"
                                            >
                                                {subItem.title}
                                            </Link>
                                        </SheetClose>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <SheetClose asChild>
                                <Link 
                                    href={item.href}
                                    className="block px-6 py-4 text-sm font-medium uppercase tracking-widest text-stone-600 hover:bg-stone-50 hover:text-black transition-colors"
                                >
                                    {item.title}
                                </Link>
                            </SheetClose>
                        )}
                    </div>
                ))}
            </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-stone-100 bg-white/50">
            <div className="flex flex-col gap-4">
                
                <ClerkLoaded>
                    {/* User Logged In */}
                    <SignedIn>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4 py-2">
                                <UserButton afterSignOutUrl="/" userProfileMode="modal" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-stone-800">My Account</span>
                                    <span className="text-xs text-stone-500">Manage your profile</span>
                                </div>
                            </div>
                            
                            <SheetClose asChild>
                                <Link href="/my-orders" className="flex items-center gap-4 text-stone-600 hover:text-rose-500 transition-colors group">
                                    <div className="p-2 bg-stone-100 rounded-full group-hover:bg-rose-500 group-hover:text-white transition-colors">
                                        <ShoppingBag size={20} strokeWidth={1.5} />
                                    </div>
                                    <span className="text-sm font-medium uppercase tracking-wide">My Orders</span>
                                </Link>
                            </SheetClose>
                        </div>
                    </SignedIn>

                    {/* User Logged Out */}
                    <SignedOut>
                        <SheetClose asChild>
                            <SignInButton mode="modal">
                                <button className="flex items-center gap-4 text-stone-600 hover:text-black transition-colors group w-full text-left">
                                    <div className="p-2 bg-stone-100 rounded-full group-hover:bg-black group-hover:text-white transition-colors">
                                        <LogIn size={20} strokeWidth={1.5} />
                                    </div>
                                    <span className="text-sm font-medium uppercase tracking-wide">Sign In</span>
                                </button>
                            </SignInButton>
                        </SheetClose>
                    </SignedOut>
                </ClerkLoaded>

                {/* Wishlist Link */}
                <SheetClose asChild>
                    <Link href="/wishlist" className="flex items-center gap-4 text-stone-600 hover:text-rose-500 transition-colors group">
                        <div className="p-2 bg-stone-100 rounded-full group-hover:bg-rose-500 group-hover:text-white transition-colors">
                            <Heart size={20} strokeWidth={1.5} />
                        </div>
                        <span className="text-sm font-medium uppercase tracking-wide">Wishlist</span>
                    </Link>
                </SheetClose>

            </div>
        </div>

      </SheetContent>
    </Sheet>
  )
}

export default MobileMenu