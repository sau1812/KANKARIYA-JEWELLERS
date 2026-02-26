"use client"

import React, { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, ShoppingBag, ArrowRight, Copy } from 'lucide-react'

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const copyToClipboard = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      alert("Order ID copied!");
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 bg-[#fffcf8] animate-in fade-in zoom-in duration-500">
      
      {/* Success Icon */}
      <div className="mb-6 relative">
         <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
         <div className="relative bg-white p-4 rounded-full shadow-xl">
            <CheckCircle className="w-16 h-16 text-green-500" strokeWidth={3} />
         </div>
      </div>

      {/* Main Heading */}
      <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-4 text-center">
        Thank You for Your Order!
      </h1>
      
      <p className="text-stone-500 text-center max-w-md mb-8">
        Your order has been placed successfully. We have sent a confirmation email to you.
      </p>

      {/* Order Details Card */}
      {orderId && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm w-full max-w-sm mb-10">
           <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-2 text-center">Order ID</p>
           <div className="flex items-center justify-center gap-3 bg-stone-50 py-3 rounded-lg border border-stone-100 border-dashed">
              <span className="font-mono text-stone-800 font-bold text-lg">{orderId}</span>
              <button onClick={copyToClipboard} className="text-stone-400 hover:text-stone-800 transition-colors" title="Copy ID">
                 <Copy size={16} />
              </button>
           </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
         
         <Link href="/my-orders" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 bg-white text-stone-800 border border-stone-300 py-3.5 rounded-xl font-bold hover:bg-stone-50 transition-all active:scale-95 shadow-sm">
               View Order Status
            </button>
         </Link>

         <Link href="/" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 bg-rose-600 text-white py-3.5 rounded-xl font-bold hover:bg-rose-700 transition-all active:scale-95 shadow-lg hover:shadow-rose-200">
               <ShoppingBag size={18} /> Continue Shopping <ArrowRight size={18} />
            </button>
         </Link>

      </div>

    </div>
  )
}

// ⚠️ IMPORTANT: Suspense Boundary zaroori hai Next.js Client Components ke liye
export default function SuccessPage() {
  return (
    <Suspense fallback={
        <div className="h-screen flex items-center justify-center text-stone-500">
            Loading success page...
        </div>
    }>
        <SuccessContent />
    </Suspense>
  )
}