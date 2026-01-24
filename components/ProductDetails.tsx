"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  Minus, Plus, ShoppingBag, Truck, ShieldCheck, Zap, 
  Star, Info, ChevronDown, MapPin 
} from 'lucide-react'
import { client } from '@/sanity/lib/client'
import { useCart } from '@/context/CartContext'
import ProductCard from './ProductCard'
import imageUrlBuilder from '@sanity/image-url'
import { Product } from '@/src/types' 
import { calculateSilverPrice } from '@/utils/calculatePrice' 

const builder = imageUrlBuilder(client)
function urlFor(source: any) { return builder.image(source) }

interface ProductDetailsProps {
  product: {
    _id: string;
    title: string;
    description: string;
    stockQuantity: number;
    image: any[]; 
    category: string;
    slug: string;
    weight: number;
    makingCharges: number;
    originalPrice?: number;
  }
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  // --- STATE ---
  const [quantity, setQuantity] = useState(1);
  
  // FIX 1: Initial load should also be high quality
  const [selectedImage, setSelectedImage] = useState<string | null>(
    product.image && product.image[0] ? urlFor(product.image[0]).width(1200).url() : null
  );

  const [realTimeStock, setRealTimeStock] = useState(product.stockQuantity);
  const [silverRate, setSilverRate] = useState(0);
  const [isCheckingStock, setIsCheckingStock] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [showPriceBreakup, setShowPriceBreakup] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('desc');

  const { addToCart } = useCart();
  const router = useRouter();

  // --- ⚡ PRICE CALCULATION LOGIC ---
  const { finalPrice, breakup } = calculateSilverPrice(product.weight, silverRate, product.makingCharges);
  
  // TOTAL PRICE CALCULATION
  const totalPrice = finalPrice * quantity;
  
  const isOutOfStock = realTimeStock === 0;

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const rateQuery = `*[_type == "silverRate"][0].ratePerGram`;
        const fetchedRate = await client.fetch(rateQuery);
        setSilverRate(fetchedRate || 0);

        const stockQuery = `*[_type == "product" && _id == $id][0].stockQuantity`;
        const freshStock = await client.fetch(stockQuery, { id: product._id });
        setRealTimeStock(freshStock);

        const relatedQuery = `*[_type == "product" && category == $category && _id != $id][0...4] {
          _id, title, originalPrice, category, stockQuantity, isHotDeal,
          "slug": slug.current,
          "imageUrl": image[0].asset->url,
          weight, makingCharges
        }`;
        
        const relatedData = await client.fetch(relatedQuery, { 
            category: product.category, id: product._id 
        });
        setRelatedProducts(relatedData);

      } catch (error) {
        console.error("Data fetch failed", error);
      } finally {
        setIsCheckingStock(false);
      }
    };
    fetchData();
  }, [product._id, product.category]);

  // --- HANDLERS ---
  const handleAddToCart = () => {
    if (quantity > realTimeStock) return;
    const cartItem = { 
        ...product, 
        price: finalPrice, 
        imageUrl: selectedImage || "", 
        slug: { current: product.slug },
        weight: product.weight,
        makingCharges: product.makingCharges
    };
    // @ts-ignore
    addToCart(cartItem, quantity);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart'); 
  };

  // --- QUANTITY HANDLERS ---
  const increaseQty = () => {
    if (quantity < realTimeStock) setQuantity(prev => prev + 1);
  };
  
  const decreaseQty = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  if (!silverRate && isCheckingStock) return <div className="min-h-[400px] flex items-center justify-center text-stone-500">Updating Live Prices...</div>;

  return (
    <div className="flex flex-col gap-16 animate-in fade-in duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        
        {/* LEFT: IMAGE GALLERY */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-[1/1] bg-stone-50 rounded-lg overflow-hidden border border-stone-100">
             {selectedImage ? (
               <Image 
                 src={selectedImage} 
                 alt={product.title} 
                 fill 
                 className={`object-cover transition-all duration-700 hover:scale-110 cursor-crosshair ${isOutOfStock ? "grayscale opacity-50" : ""}`}
                 priority
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
               />
             ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-300">
                    <ShoppingBag size={48} />
                </div>
             )}
             <div className="absolute top-4 left-4 flex flex-col gap-2">
                 {product.makingCharges === 0 && <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wide">No Making Charges</span>}
                 {isOutOfStock && <span className="bg-stone-900 text-white text-xs font-bold px-3 py-1 uppercase tracking-wide">Sold Out</span>}
             </div>
          </div>
          
          {/* 👇 FIX 2: Thumbnails logic updated for High Res */}
          {product.image && product.image.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {product.image.map((img: any, idx: number) => {
                  // 1. URL for thumbnail (Small size for speed)
                  const thumbnailSrc = urlFor(img).width(200).url();
                  // 2. URL for Main View (Big size for quality)
                  const highResSrc = urlFor(img).width(1200).url();

                  return (
                  <button 
                    key={idx} 
                    // Set High Res URL on click
                    onClick={() => setSelectedImage(highResSrc)}
                    className={`relative w-20 h-20 rounded-md overflow-hidden border transition-all flex-shrink-0 ${selectedImage === highResSrc ? 'border-rose-600 ring-1 ring-rose-600' : 'border-stone-200 hover:border-stone-400'}`}
                  >
                    <Image src={thumbnailSrc} alt="thumb" fill className="object-cover" />
                  </button>
                  )
              })}
            </div>
          )}
        </div>

        {/* RIGHT: PRODUCT INFO */}
        <div className="lg:col-span-5 flex flex-col gap-6">
           
           {/* Header */}
           <div>
              <div className="flex items-center gap-2 mb-2">
                  <span className="text-rose-600 text-xs font-bold uppercase tracking-wider">{product.category}</span>
                  <div className="flex items-center gap-1 text-yellow-500 text-xs font-medium">
                      <Star fill="currentColor" size={12} /> 4.8 (120)
                  </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif text-stone-900 leading-tight">{product.title}</h1>
           </div>

           {/* 💰 UNIT PRICE SECTION */}
           <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 relative">
              <div className="flex items-end gap-3 mb-1">
                 <span className="text-4xl font-serif text-stone-900">₹{finalPrice.toLocaleString()}</span>
                 <button 
                   onClick={() => setShowPriceBreakup(!showPriceBreakup)}
                   className="text-stone-400 hover:text-rose-600 transition-colors mb-2"
                 >
                    <Info size={20} />
                 </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="bg-white px-2 py-1 border border-stone-200 rounded text-stone-700 font-medium">Weight: {product.weight}g</span>
                <span>•</span>
                <span>Silver Rate: ₹{silverRate}/g</span>
              </div>

              {/* Price Breakup Popup */}
              {showPriceBreakup && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white shadow-xl rounded-lg border border-stone-100 p-4 z-20 animate-in fade-in slide-in-from-top-2">
                      <h4 className="font-serif text-stone-800 mb-3 text-sm">Price Breakdown</h4>
                      <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-stone-600">
                              <span>Silver Value ({product.weight}g × {silverRate})</span>
                              <span>₹{breakup?.silverValue?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-stone-600">
                              <span>Making Charges ({product.makingCharges}%)</span>
                              <span>+ ₹{breakup?.makingCost?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-stone-600 pb-2 border-b border-dashed border-stone-200">
                              <span>GST (3%)</span>
                              <span>+ ₹{breakup?.gst?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-bold text-stone-900 pt-1">
                              <span>Final Price</span>
                              <span>₹{finalPrice.toLocaleString()}</span>
                          </div>
                      </div>
                  </div>
              )}
           </div>

           {/* Stock Warning */}
           {!isCheckingStock && !isOutOfStock && realTimeStock < 5 && (
              <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg flex items-center gap-3">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  <p className="text-xs text-orange-800 font-medium">Hurry! Only {realTimeStock} left.</p>
              </div>
           )}

           {/* DYNAMIC TOTAL PRICE AREA */}
           <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col md:flex-row gap-4">
                  
                  {/* Quantity Selector */}
                  <div className="flex items-center border border-stone-300 rounded-lg h-12 w-fit">
                     <button onClick={decreaseQty} className="px-4 hover:text-rose-600 disabled:opacity-30" disabled={quantity<=1}><Minus size={16}/></button>
                     <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                     <button onClick={increaseQty} className="px-4 hover:text-rose-600 disabled:opacity-30" disabled={quantity>=realTimeStock}><Plus size={16}/></button>
                  </div>

                  {/* Total Amount Display */}
                  <div className="flex-1 flex flex-col items-end justify-center bg-stone-100 px-4 rounded-lg h-12">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-400 font-medium hidden sm:block">
                            ({quantity} × ₹{finalPrice.toLocaleString()}) =
                        </span>
                        <span className="text-xl font-bold text-stone-900">
                            Total: ₹{totalPrice.toLocaleString()}
                        </span>
                      </div>
                  </div>
              </div>
              
              {/* Buttons */}
              <div className="grid grid-cols-2 gap-4">
                  <button 
                     onClick={handleAddToCart}
                     disabled={isOutOfStock}
                     className="h-12 border border-stone-300 rounded-lg font-medium hover:bg-stone-50 transition-all flex items-center justify-center gap-2 text-stone-700"
                  >
                     <ShoppingBag size={18} /> Add to Cart
                  </button>
                  <button 
                     onClick={handleBuyNow} 
                     disabled={isOutOfStock}
                     className="h-12 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-100"
                  >
                     <Zap size={18} fill="currentColor"/> Buy Now
                  </button>
              </div>
           </div>

           {/* Accordion */}
           <div className="mt-4 border-t border-stone-200">
               <div className="border-b border-stone-200">
                   <button onClick={() => setOpenAccordion(openAccordion === 'desc' ? null : 'desc')} className="w-full py-4 flex justify-between items-center text-left">
                       <span className="font-serif text-stone-800">Product Description</span>
                       <ChevronDown size={16} className={`transition-transform ${openAccordion === 'desc' ? 'rotate-180' : ''}`} />
                   </button>
                   {openAccordion === 'desc' && (
                       <div className="pb-4 text-stone-600 text-sm leading-relaxed">{product.description}</div>
                   )}
               </div>
               <div className="border-b border-stone-200">
                   <button onClick={() => setOpenAccordion(openAccordion === 'ship' ? null : 'ship')} className="w-full py-4 flex justify-between items-center text-left">
                       <span className="font-serif text-stone-800">Shipping & Returns</span>
                       <ChevronDown size={16} className={`transition-transform ${openAccordion === 'ship' ? 'rotate-180' : ''}`} />
                   </button>
                   {openAccordion === 'ship' && (
                       <div className="pb-4 text-stone-600 text-sm leading-relaxed">
                           <div className="flex items-center gap-2 mb-2"><Truck size={16}/> Free shipping above ₹2000</div>
                           <div className="flex items-center gap-2"><ShieldCheck size={16}/> 7-day easy return policy.</div>
                       </div>
                   )}
               </div>
           </div>
           
           <div className="flex items-center gap-2 mt-2">
               <MapPin size={18} className="text-stone-400" />
               <input type="text" placeholder="Enter Pincode" className="text-sm border-b border-stone-300 focus:border-rose-600 outline-none py-1 w-48 bg-transparent" />
               <button className="text-xs font-bold text-rose-600 uppercase">Check</button>
           </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      <div className="border-t border-stone-200 pt-16">
          <h2 className="text-3xl font-serif text-stone-900 mb-8">Complete the Look</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.length > 0 ? (
                  relatedProducts.map((item) => (
                      <ProductCard key={item._id} item={item} silverRate={silverRate} />
                  ))
              ) : (
                  <p className="col-span-4 text-center text-stone-400 py-10">Loading...</p>
              )}
          </div>
      </div>
    </div>
  )
}