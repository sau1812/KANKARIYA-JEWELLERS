"use client";

import { client } from "@/sanity/lib/client";
import { useEffect, useState } from "react";
import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";
import { Save, Loader2, Search, AlertCircle, TrendingUp, Settings, X } from "lucide-react";

const builder = imageUrlBuilder(client);
function urlFor(source: any) { return builder.image(source); }

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [silverRate, setSilverRate] = useState(0);
  const [rateLoading, setRateLoading] = useState(false);

  // 1. Fetch Products & Silver Rate
  useEffect(() => {
    const fetchData = async () => {
        try {
            const rateData = await client.fetch(`*[_type == "silverRate"][0].ratePerGram`);
            setSilverRate(rateData || 0);

            const query = `*[_type == "product"] | order(_createdAt desc) {
                _id, title, price, stockQuantity, image, category, weight, makingCharges
            }`;
            const data = await client.fetch(query);
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  // 2. Handle Input Change (Local State)
  const handleChange = (id: string, field: string, value: any) => {
     setProducts(prev => prev.map(p => p._id === id ? { ...p, [field]: Number(value) } : p));
  };

  // 3. Save Product Changes
  const handleSaveProduct = async (product: any) => {
     setSavingId(product._id);
     try {
         const response = await fetch("/api/update-product", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ 
                 productId: product._id, 
                 stock: product.stockQuantity,
                 weight: product.weight,
                 makingCharges: product.makingCharges
             }),
         });
         
         if (response.ok) alert("✅ Product Updated!");
         else alert("❌ Failed to update");
     } catch (error) {
         alert("❌ Error updating product");
     } finally {
         setSavingId(null);
     }
  };

  // 4. Update Silver Rate (Global)
  const handleUpdateRate = async () => {
    setRateLoading(true);
    try {
        const response = await fetch("/api/update-rate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rate: Number(silverRate) }),
        });

        if (response.ok) {
            alert("✅ Silver Rate Updated Successfully!");
            window.location.reload();
        } else {
            alert(`❌ Failed to update rate`);
        }
    } catch (e) {
        alert("❌ Network Error");
    } finally {
        setRateLoading(false);
    }
  };

  const getLivePrice = (weight: number, making: number) => {
      if(!weight) return 0;
      const silverCost = weight * silverRate;
      const labor = silverCost * (making / 100);
      return Math.round((silverCost + labor) * 1.03); // +3% GST
  };

  const filteredProducts = products.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- CALCULATE SUMMARY STATS ---
  const outOfStockCount = products.filter(p => p.stockQuantity === 0).length;
  const lowStockCount = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5).length;

  if (loading) return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin text-rose-600"/> Loading Admin Panel...</div>;

  return (
    <div className="bg-[#F8F9FA] min-h-screen p-8">
      
      {/* --- GLOBAL SETTINGS (Silver Rate) --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
              <div className="bg-rose-100 p-3 rounded-full text-rose-600"><TrendingUp size={24}/></div>
              <div>
                  <h2 className="text-lg font-bold text-stone-900">Daily Silver Rate</h2>
                  <p className="text-xs text-stone-500">Updates prices for all {products.length} products instantly.</p>
              </div>
          </div>
          <div className="flex items-center gap-3 bg-stone-50 p-2 rounded-lg border border-stone-200">
              <span className="text-sm font-bold text-stone-600 pl-2">₹ / gm:</span>
              <input 
                  type="number" 
                  value={silverRate} 
                  onChange={(e) => setSilverRate(Number(e.target.value))}
                  className="w-24 bg-transparent font-bold text-lg text-stone-900 outline-none"
              />
              <button 
                  onClick={handleUpdateRate}
                  disabled={rateLoading}
                  className="bg-stone-900 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-stone-800 disabled:opacity-50"
              >
                  {rateLoading ? "Updating..." : "Update Rate"}
              </button>
          </div>
      </div>

      {/* --- NEW: INVENTORY SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border-l-4 border-rose-500 p-5 rounded-xl shadow-sm flex justify-between items-center border border-stone-200">
              <div>
                  <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Out of Stock</p>
                  <h3 className="text-2xl font-serif font-black text-stone-900">{outOfStockCount} Items</h3>
              </div>
              <div className="bg-rose-50 p-3 rounded-full text-rose-600"><X size={20}/></div>
          </div>
          
          <div className="bg-white border-l-4 border-amber-400 p-5 rounded-xl shadow-sm flex justify-between items-center border border-stone-200">
              <div>
                  <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Low Stock Alert</p>
                  <h3 className="text-2xl font-serif font-black text-stone-900">{lowStockCount} Items</h3>
              </div>
              <div className="bg-amber-50 p-3 rounded-full text-amber-600"><AlertCircle size={20}/></div>
          </div>
      </div>

      {/* --- INVENTORY MANAGEMENT --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-stone-800">Product Inventory</h2>
             <div className="relative w-64">
                 <Search className="absolute left-3 top-2.5 text-stone-400" size={16}/>
                 <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rose-500"
                 />
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead className="bg-stone-50 text-stone-500 text-xs uppercase font-bold">
                 <tr>
                     <th className="p-4">Product</th>
                     <th className="p-4 w-24">Weight (g)</th>
                     <th className="p-4 w-24">Making (%)</th>
                     <th className="p-4 w-28">Live Price</th>
                     <th className="p-4 w-24">Stock</th>
                     <th className="p-4 text-center w-16">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-stone-100 text-sm text-stone-700">
                  {filteredProducts.map((product) => {
                      const livePrice = getLivePrice(product.weight, product.makingCharges);
                      
                      return (
                        <tr key={product._id} className="hover:bg-stone-50 transition group">
                           <td className="p-4">
                               <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded bg-stone-100 relative overflow-hidden border border-stone-200 shrink-0">
                                       {product.image && <Image src={urlFor(product.image[0])?.width(100).url() || ""} alt="" fill className="object-cover"/>}
                                   </div>
                                   <div>
                                       <div className="font-bold text-stone-800 line-clamp-1">{product.title}</div>
                                       <div className="text-xs text-stone-400 capitalize">{product.category}</div>
                                   </div>
                               </div>
                           </td>
                           
                           <td className="p-4">
                               <input 
                                  type="number" value={product.weight || 0} 
                                  onChange={(e) => handleChange(product._id, 'weight', e.target.value)}
                                  className="w-full border border-stone-200 rounded px-2 py-1 font-medium focus:border-rose-500 outline-none"
                               />
                           </td>

                           <td className="p-4">
                               <input 
                                  type="number" value={product.makingCharges || 0} 
                                  onChange={(e) => handleChange(product._id, 'makingCharges', e.target.value)}
                                  className="w-full border border-stone-200 rounded px-2 py-1 font-medium focus:border-rose-500 outline-none"
                               />
                           </td>

                           <td className="p-4">
                               <div className="font-bold text-stone-900 bg-stone-100 px-2 py-1 rounded w-fit">
                                 ₹{livePrice.toLocaleString()}
                               </div>
                           </td>

                           <td className="p-4">
                               <div className="flex flex-col gap-1">
                                   <input 
                                      type="number" value={product.stockQuantity} 
                                      onChange={(e) => handleChange(product._id, 'stockQuantity', e.target.value)}
                                      className={`w-full border rounded px-2 py-1 font-bold outline-none transition-all ${
                                          product.stockQuantity === 0 
                                          ? 'border-rose-500 bg-rose-50 text-rose-600' 
                                          : product.stockQuantity <= 5 
                                          ? 'border-amber-400 bg-amber-50 text-amber-700' 
                                          : 'border-stone-200'
                                      }`}
                                   />
                                   {/* VISUAL BADGES */}
                                   {product.stockQuantity === 0 && (
                                       <span className="text-[9px] font-black text-rose-600 uppercase tracking-tighter flex items-center gap-0.5 animate-pulse">
                                           <AlertCircle size={8}/> Out of Stock
                                       </span>
                                   )}
                                   {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                                       <span className="text-[9px] font-bold text-amber-600 uppercase tracking-tighter">
                                           ⚠️ Low Stock
                                       </span>
                                   )}
                               </div>
                           </td>

                           <td className="p-4 text-center">
                               <button 
                                  onClick={() => handleSaveProduct(product)}
                                  disabled={savingId === product._id}
                                  className="text-stone-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-full transition-all"
                               >
                                  {savingId === product._id ? <Loader2 size={18} className="animate-spin text-stone-800"/> : <Save size={18}/>}
                               </button>
                           </td>
                        </tr>
                      )
                  })}
               </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}