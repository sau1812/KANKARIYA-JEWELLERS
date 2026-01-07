"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Loader2, Package, ShoppingCart, LayoutDashboard, PlusCircle } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // 👇 Apni Owner ID yahan daalein (Clerk > Users se copy karke)
  const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID; 

  useEffect(() => {
    if (isLoaded) {
      if (!user || user.id !== ADMIN_ID) {
        router.push("/"); // Bahr nikal do agar admin nahi hai
      }
    }
  }, [isLoaded, user, router, ADMIN_ID]);

  if (!isLoaded) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>;
  
  if (!user || user.id !== ADMIN_ID) return null;

  const navItems = [
    { name: "Orders", href: "/admin", icon: ShoppingCart },
    { name: "Products (Edit Price)", href: "/admin/products", icon: Package },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-stone-100">
             <h1 className="font-serif text-xl font-bold text-stone-900">Admin Panel</h1>
             <p className="text-xs text-stone-400">VS Studio Manager</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-600 hover:bg-stone-100'}`}>
                        <item.icon size={18} /> {item.name}
                    </Link>
                )
            })}
            
            {/* Direct Link to Sanity Studio for Adding Products */}
            <a href="/studio/structure" target="_blank" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 mt-4 border border-rose-100">
                <PlusCircle size={18} /> Add New Product
            </a>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}