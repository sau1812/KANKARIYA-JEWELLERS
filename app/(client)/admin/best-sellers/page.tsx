"use client";

import React, { useEffect, useState } from 'react';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image'; 
// 👇 Yahan 'PackageCheck' ko fix kar diya gaya hai
import { Loader2, TrendingUp, Award, ShoppingBag, ArrowUpRight, IndianRupee, PackageCheck } from 'lucide-react';
import Image from 'next/image';

interface BestSellerItem {
  id: string;
  title: string;
  totalSold: number;
  revenue: number;
  image: any;
}

export default function BestSellersPage() {
  const [data, setData] = useState<BestSellerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({ revenue: 0, units: 0 });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const query = `*[_type == "order"]{
          products[]{
            quantity,
            priceAtPurchase,
            "title": product->title,
            "productId": product->._id,
            "image": product->image[0]
          }
        }`;
        
        const orders = await client.fetch(query);
        const salesMap: { [key: string]: BestSellerItem } = {};
        let tRev = 0;
        let tUnits = 0;

        orders.forEach((order: any) => {
          order.products?.forEach((item: any) => {
            const pId = item.productId || "unknown";
            const qty = item.quantity || 0;
            const price = item.priceAtPurchase || 0;

            tRev += (price * qty);
            tUnits += qty;

            if (salesMap[pId]) {
              salesMap[pId].totalSold += qty;
              salesMap[pId].revenue += (price * qty);
            } else {
              salesMap[pId] = {
                id: pId,
                title: item.title || "Deleted Product",
                totalSold: qty,
                revenue: (price * qty),
                image: item.image
              };
            }
          });
        });

        const sortedData = Object.values(salesMap)
          .filter(item => item.totalSold > 0)
          .sort((a, b) => b.totalSold - a.totalSold);

        setData(sortedData);
        setTotalStats({ revenue: tRev, units: tUnits });
      } catch (error) {
        console.error("Sales data error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Loader2 className="animate-spin text-rose-600" size={48} />
        <TrendingUp className="absolute inset-0 m-auto text-rose-300" size={20} />
      </div>
      <p className="text-stone-400 font-serif italic animate-pulse">Crafting your sales report...</p>
    </div>
  );

  const maxSold = data.length > 0 ? data[0].totalSold : 1;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-serif text-stone-900 tracking-tight">Sales Analytics</h2>
          <p className="text-stone-500 mt-1">Discover your most loved jewelry pieces.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="bg-white border border-stone-200 px-6 py-3 rounded-2xl shadow-sm text-center">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Lifetime Revenue</p>
                <p className="text-xl font-bold text-stone-900">₹{totalStats.revenue.toLocaleString()}</p>
            </div>
            <div className="bg-stone-900 px-6 py-3 rounded-2xl shadow-lg text-center text-white border border-stone-800">
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-tighter">Total Units</p>
                <p className="text-xl font-bold tracking-tight">{totalStats.units}</p>
            </div>
        </div>
      </div>

      {/* --- LIST SECTION --- */}
      <div className="grid gap-4">
        {data.length > 0 ? (
          data.map((item, index) => (
            <div key={item.id} className="group bg-white border border-stone-100 p-5 md:p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 shadow-sm hover:shadow-xl hover:border-rose-100 transition-all duration-500 relative overflow-hidden">
              
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className={`hidden md:flex w-10 h-10 rounded-full items-center justify-center font-bold text-sm 
                  ${index === 0 ? 'bg-amber-100 text-amber-600' : 'bg-stone-50 text-stone-400'}`}>
                  {index === 0 ? <Award size={20} /> : index + 1}
                </div>
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-stone-50 flex-shrink-0 border border-stone-100">
                    {item.image ? (
                        <Image 
                            src={urlFor(item.image).url()} 
                            alt={item.title} 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="text-stone-200" /></div>
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-stone-800 text-lg group-hover:text-rose-600 transition-colors line-clamp-1">{item.title}</h3>
                    <p className="text-stone-400 text-[11px] font-bold uppercase tracking-widest mt-1">Product ID: {item.id.slice(-6)}</p>
                    <div className="w-full bg-stone-50 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div 
                            className="bg-rose-500 h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${(item.totalSold / maxSold) * 100}%` }}
                        />
                    </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto md:ml-auto gap-8 border-t md:border-t-0 border-stone-50 pt-4 md:pt-0">
                <div className="text-center md:text-right">
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Revenue</p>
                  <p className="text-lg font-bold text-stone-900 flex items-center justify-center md:justify-end gap-1">
                    <IndianRupee size={14} className="text-stone-400" />
                    {item.revenue.toLocaleString()}
                  </p>
                </div>
                <div className="bg-stone-900 text-white px-6 py-3 rounded-2xl min-w-[100px] text-center group-hover:bg-rose-600 transition-colors shadow-lg shadow-stone-200">
                  <p className="text-[10px] font-bold text-rose-200 uppercase tracking-widest">Orders</p>
                  <p className="text-2xl font-serif leading-none mt-1">{item.totalSold}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-stone-100">
             <PackageCheck size={48} className="mx-auto text-stone-200 mb-4" />
             <h3 className="text-stone-800 font-serif text-2xl">Awaiting First Sales</h3>
             <p className="text-stone-400 text-sm max-w-xs mx-auto mt-2 italic">
               Once orders arrive, your star products will shine here.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}