"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
// 👇 TrendingUp icon add kiya gaya hai analytics ke liye
import { Loader2, Package, ShoppingCart, PlusCircle, ExternalLink, TrendingUp } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // 🆔 Clerk Dashboard se mili ADMIN ID yahan check hogi
  const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID; 

  useEffect(() => {
    if (isLoaded) {
      if (!user || user.id !== ADMIN_ID) {
        router.push("/"); // 🚫 Agar Admin nahi hai toh Home page par bhej do
      }
    }
  }, [isLoaded, user, router, ADMIN_ID]);

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-rose-600" size={32} />
      </div>
    );
  }
  
  if (!user || user.id !== ADMIN_ID) return null;

  // 👇 Updated navItems: Dashboard, Best Sellers, aur Manage Products
  const navItems = [
    { name: "Orders Dashboard", href: "/admin", icon: ShoppingCart },
    { name: "Best Sellers", href: "/admin/best-sellers", icon: TrendingUp }, 
    { name: "Manage Products", href: "/admin/products", icon: Package },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-white border-r border-stone-200 hidden md:flex flex-col shadow-sm">
        <div className="p-8 border-b border-stone-100">
             <h1 className="font-serif text-2xl font-bold text-stone-900">Admin Panel</h1>
             <p className="text-[10px] tracking-widest text-stone-400 uppercase mt-1">Kankariya Jewellers</p>
        </div>
        
        <nav className="flex-1 p-6 space-y-3">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive 
                        ? 'bg-stone-900 text-white shadow-md' 
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                      }`}
                    >
                        <item.icon size={18} /> {item.name}
                    </Link>
                )
            })}
            
            <div className="pt-4 mt-4 border-t border-stone-100">
                <p className="text-[10px] font-bold text-stone-400 px-4 mb-2">CMS ACTIONS</p>
                {/* 🚀 Yeh link ab seedha naye Live Sanity Studio par jayega */}
                <a 
                  href="https://silver-jewelry-admin.sanity.studio/structure" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 px-4 py-4 rounded-xl text-sm font-bold text-rose-600 bg-rose-50/50 hover:bg-rose-50 transition-colors border border-rose-100"
                >
                    <div className="flex items-center gap-3">
                        <PlusCircle size={20} /> 
                        <span>Add New Product</span>
                    </div>
                    <ExternalLink size={14} className="opacity-50" />
                </a>
            </div>
        </nav>

        <div className="p-6 border-t border-stone-100">
            <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden border border-stone-100">
                    {user.imageUrl && <img src={user.imageUrl} alt="profile" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-stone-900 truncate">{user.fullName}</p>
                    <p className="text-[10px] text-stone-400 truncate">Store Owner</p>
                </div>
            </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
}