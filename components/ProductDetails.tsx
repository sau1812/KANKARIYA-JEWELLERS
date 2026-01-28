"use client"

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Minus, Plus, Star, Info, ChevronDown, CheckCircle2, X, ArrowRight, Share2 // 👈 Share2 add kiya
} from 'lucide-react'
import { client } from '@/sanity/lib/client'
import { useCart } from '@/context/CartContext'
import imageUrlBuilder from '@sanity/image-url'
import { ExtraOption } from '@/src/types' 
import { calculateSilverPrice } from '@/utils/calculatePrice' 
import Link from 'next/link'
import ProductCard from './ProductCard' 
import ReviewSection from '@/components/ReviewSection' 
import ReviewList from '@/components/ReviewList' 

const builder = imageUrlBuilder(client)
function urlFor(source: any) { return builder.image(source) }

interface ProductDetailsProps {
  product: any;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    product.image?.[0] ? urlFor(product.image[0]).width(1200).url() : null
  );
  const [realTimeStock, setRealTimeStock] = useState(product.stockQuantity);
  const [silverRate, setSilverRate] = useState(0);
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]); 
  const [isCheckingStock, setIsCheckingStock] = useState(true);
  const [showPriceBreakup, setShowPriceBreakup] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<ExtraOption[]>([]);
  const [openAccordion, setOpenAccordion] = useState<string | null>('desc');
  const [avgRating, setAvgRating] = useState<{score: string, count: number} | null>(null);

  const { addToCart } = useCart();
  const router = useRouter();

  const { finalPrice, breakup } = useMemo(() => 
    calculateSilverPrice(product.weight, silverRate, product.makingCharges),
    [product.weight, silverRate, product.makingCharges]
  );
  
  const extrasTotal = selectedExtras.reduce((sum, item) => sum + item.price, 0);
  const unitPriceTotal = finalPrice + extrasTotal;
  const totalPrice = unitPriceTotal * quantity;
  const isOutOfStock = realTimeStock === 0;

  // 👇 NEW: SHARE FUNCTION
  const handleShare = async () => {
    const shareData = {
      title: product.title,
      text: `Check out this beautiful ${product.title} from Kankariya Jewellers!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rate, stock, suggested, reviewsData] = await Promise.all([
          client.fetch(`*[_type == "silverRate"][0].ratePerGram`),
          client.fetch(`*[_type == "product" && _id == $id][0].stockQuantity`, { id: product._id }),
          client.fetch(`*[_type == "product" && category == $cat && _id != $id][0...4]`, { 
            cat: product.category, 
            id: product._id 
          }),
          client.fetch(`*[_type == "review" && product._ref == $id && approved == true]{rating}`, { id: product._id })
        ]);
        setSilverRate(rate || 0);
        setRealTimeStock(stock);
        setSuggestedProducts(suggested);

        if (reviewsData && reviewsData.length > 0) {
          const total = reviewsData.reduce((acc: number, item: any) => acc + item.rating, 0);
          const avg = (total / reviewsData.length).toFixed(1);
          setAvgRating({ score: avg, count: reviewsData.length });
        }
      } catch (e) { console.error(e); } finally { setIsCheckingStock(false); }
    };
    fetchData();
  }, [product._id, product.category]);

  const toggleExtra = (option: ExtraOption) => {
    setSelectedExtras(prev => 
      prev.find(e => e.optionName === option.optionName)
        ? prev.filter(e => e.optionName !== option.optionName)
        : [...prev, option]
    );
  };

  const handleAddToCart = () => {
    if (quantity > realTimeStock) return;
    // @ts-ignore
    addToCart({ ...product, price: unitPriceTotal, selectedExtras, imageUrl: selectedImage || "" }, quantity);
  };

  if (isCheckingStock && !silverRate) return <div className="h-[60vh] flex items-center justify-center font-serif italic text-stone-400 animate-pulse">Loading Kankariya Jewellers...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        
        {/* LEFT: IMAGE GALLERY */}
        <div className="lg:col-span-7 space-y-4 md:space-y-6">
          <div className="relative aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-stone-50 border border-stone-100 shadow-sm">
            {selectedImage && (
              <Image src={selectedImage} alt={product.title} fill className="object-cover" priority />
            )}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isHotDeal && <span className="bg-rose-600 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">Hot Deal 🔥</span>}
              {isOutOfStock && <span className="bg-stone-900 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">Sold Out</span>}
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {product.image?.map((img: any, i: number) => {
              const highRes = urlFor(img).width(1200).url();
              return (
                <button 
                  key={i} 
                  onClick={() => setSelectedImage(highRes)} 
                  className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 transition-all flex-shrink-0 overflow-hidden ${selectedImage === highRes ? 'border-rose-600 shadow-sm' : 'border-stone-100'}`}
                >
                  <Image src={urlFor(img).width(200).url()} alt="thumb" fill className="object-cover" />
                </button>
              )
            })}
          </div>
        </div>

        {/* RIGHT: CONTENT */}
        <div className="lg:col-span-5 flex flex-col gap-6 md:gap-8">
          <header className="space-y-1 md:space-y-2 relative">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-[10px] uppercase tracking-widest">
              <Star size={12} fill="currentColor" /> Premium Silver Collection
            </div>
            
            {/* 👇 UPDATED: TITLE & SHARE BUTTON */}
            <div className="flex justify-between items-start gap-4">
               <h1 className="text-3xl md:text-5xl font-serif text-stone-900 leading-tight capitalize">{product.title}</h1>
               <button 
                onClick={handleShare}
                className="p-3 rounded-full bg-stone-50 text-stone-600 hover:text-rose-600 hover:bg-rose-50 transition-all border border-stone-100"
                title="Share Product"
               >
                 <Share2 size={20} />
               </button>
            </div>
            
            {avgRating && (
              <div className="flex items-center gap-2 mt-2 mb-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < Math.round(Number(avgRating.score)) ? "#EAB308" : "none"} 
                      className={i < Math.round(Number(avgRating.score)) ? "text-yellow-500" : "text-stone-300"}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-stone-900">{avgRating.score}</span>
                <span className="text-xs text-stone-400">({avgRating.count} Reviews)</span>
              </div>
            )}

            <div className="flex items-center gap-4 mt-3">
               <div className="text-2xl md:text-4xl font-serif text-stone-900">₹{unitPriceTotal.toLocaleString()}</div>
               <button onClick={() => setShowPriceBreakup(true)} className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-rose-600 transition-colors">
                 <Info size={16}/>
               </button>
            </div>
          </header>

          {/* CUSTOMIZATIONS */}
          {product.extraOptions && product.extraOptions.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <h3 className="font-serif text-lg text-stone-800">Customize Your Piece</h3>
              <div className="grid gap-2 md:gap-3">
                {product.extraOptions.map((opt: ExtraOption, i: number) => {
                  const active = selectedExtras.some(e => e.optionName === opt.optionName);
                  return (
                    <button 
                      key={i} 
                      onClick={() => toggleExtra(opt)} 
                      className={`flex items-center justify-between p-3 md:p-4 rounded-xl border-2 text-left transition-all ${active ? 'border-rose-600 bg-rose-50/50' : 'border-stone-100 bg-white'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? 'bg-rose-600 border-rose-600' : 'border-stone-200'}`}>
                          {active && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-stone-800">{opt.optionName}</span>
                          {opt.description && <span className="text-[10px] text-stone-500 leading-tight">{opt.description}</span>}
                        </div>
                      </div>
                      <span className="text-sm font-serif text-rose-600 font-bold">+₹{opt.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-4 md:space-y-6 pt-4 border-t border-stone-100">
             <div className="flex items-center justify-between bg-stone-50 p-4 md:p-6 rounded-2xl md:rounded-3xl">
                <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl p-1">
                  <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-8 h-8 flex items-center justify-center"><Minus size={14}/></button>
                  <span className="w-6 text-center font-bold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(realTimeStock, q+1))} className="w-8 h-8 flex items-center justify-center"><Plus size={14}/></button>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">Payable</p>
                  <p className="text-xl md:text-2xl font-serif text-stone-900">₹{totalPrice.toLocaleString()}</p>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={handleAddToCart} disabled={isOutOfStock} className="h-14 rounded-xl border-2 border-stone-900 font-bold hover:bg-stone-900 hover:text-white transition-all disabled:opacity-30">
                  Add to Cart
                </button>
                <button onClick={() => { handleAddToCart(); router.push('/cart'); }} disabled={isOutOfStock} className="h-14 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 disabled:opacity-30">
                  Buy Now
                </button>
             </div>
          </div>

          <div className="space-y-1">
             {['desc', 'ship'].map((tab) => (
               <div key={tab} className="border-b border-stone-100">
                  <button onClick={() => setOpenAccordion(openAccordion === tab ? null : tab)} className="w-full py-4 flex justify-between items-center text-left font-serif text-stone-800">
                    {tab === 'desc' ? 'Product Description' : 'Shipping & Returns'}
                    <ChevronDown size={16} className={`transition-transform ${openAccordion === tab ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openAccordion === tab && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <p className="pb-4 text-xs md:text-sm text-stone-500 leading-relaxed">{tab === 'desc' ? product.description : "Kankariya Jewellers offers free insured shipping. Items are shipped within 48 hours."}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* --- REVIEWS SECTION --- */}
      <div className="mt-16 bg-white">
        <ReviewSection productId={product._id} />
      </div>

      {/* --- SUGGESTED PRODUCTS --- */}
      {suggestedProducts.length > 0 && (
        <div className="mt-20 pt-10 border-t border-stone-100">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-rose-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-2">Recommendation</p>
              <h2 className="text-3xl font-serif text-stone-900">You May Also Like</h2>
            </div>
            <Link href="/shop" className="text-stone-400 hover:text-rose-600 transition-colors flex items-center gap-2 text-sm font-medium">
              View All <ArrowRight size={16}/>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {suggestedProducts.map((item) => {
              const cardItem = {
                ...item,
                slug: item.slug.current,
                imageUrl: item.image?.[0] ? urlFor(item.image[0]).width(600).url() : null
              };

              return (
                <ProductCard 
                  key={item._id} 
                  item={cardItem} 
                  silverRate={silverRate} 
                />
              );
            })}
          </div>
        </div>
      )}

      {/* --- REVIEWS LIST DISPLAY --- */}
      <div className="mt-10">
        <ReviewList productId={product._id} />
      </div>

      {/* PRICE BREAKUP MODAL */}
      <AnimatePresence>
        {showPriceBreakup && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl">
              <button onClick={() => setShowPriceBreakup(false)} className="absolute top-4 right-4 p-1 hover:bg-stone-50 rounded-full"><X size={20}/></button>
              <h2 className="text-xl font-serif mb-6 text-stone-900">Price Breakdown</h2>
              <div className="space-y-4 text-sm text-stone-600">
                <div className="flex justify-between"><span>Silver ({product.weight}g)</span><span>₹{breakup?.silverValue?.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Making Charges</span><span>₹{breakup?.makingCost?.toLocaleString()}</span></div>
                {selectedExtras.map((e, i) => (
                  <div key={i} className="flex justify-between text-rose-600 font-medium"><span>+ {e.optionName}</span><span>₹{e.price.toLocaleString()}</span></div>
                ))}
                <div className="flex justify-between border-t border-stone-100 pt-4 font-bold text-stone-900"><span>Grand Total</span><span>₹{unitPriceTotal.toLocaleString()}</span></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}