"use client";

import { client } from "@/sanity/lib/client";
import { useEffect, useState } from "react";
import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";
import { Save, Loader2, Search, TrendingUp, Package, Boxes, IndianRupee, Trash2 } from "lucide-react";

const builder = imageUrlBuilder(client);
function urlFor(source: any) { return builder.image(source); }

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null); // New state for delete
  const [searchTerm, setSearchTerm] = useState("");
  const [silverRate, setSilverRate] = useState(0);
  const [rateLoading, setRateLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const rateData = await client.fetch(`*[_type == "silverRate"][0].ratePerGram`);
            setSilverRate(rateData || 0);
            const query = `*[_type == "product"] | order(_createdAt desc) {
                _id, title, stockQuantity, image, category, weight, makingCharges, pricingType, fixedPrice
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

  const handleChange = (id: string, field: string, value: any) => {
     setProducts(prev => prev.map(p => p._id === id ? { ...p, [field]: value } : p));
  };

  const handleSaveProduct = async (product: any) => {
     setSavingId(product._id);
     try {
         const response = await fetch("/api/update-product", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ 
                 productId: product._id, 
                 stock: Number(product.stockQuantity),
                 weight: Number(product.weight),
                 makingCharges: Number(product.makingCharges),
                 fixedPrice: Number(product.fixedPrice)
             }),
         });
         if (response.ok) alert("✅ Product synced with Cloud!");
     } catch (error) {
         alert("❌ Error");
     } finally {
         setSavingId(null);
     }
  };

  // --- DELETE PRODUCT FUNCTION ---
  const handleDeleteProduct = async (id: string, title: string) => {
    const confirmArchive = confirm(`Archive "${title}"? This will hide it from the website.`);
    if (!confirmArchive) return;

    setDeletingId(id);
    try {
        const response = await fetch("/api/update-product", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                productId: id, 
                isArchived: true, // 👈 Ye hum API ko bhej rahe hain
                stock: 0          // Archive karte waqt stock zero karna safe rehta hai
            }),
        });

        if (response.ok) {
            setProducts(prev => prev.filter(p => p._id !== id));
            alert("📦 Product Archived!");
        } else {
            alert("❌ Failed to archive");
        }
    } catch (error) {
        console.error(error);
    } finally {
        setDeletingId(null);
    }
};

  const handleUpdateRate = async () => {
    setRateLoading(true);
    try {
        const response = await fetch("/api/update-rate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rate: Number(silverRate) }),
        });
        if (response.ok) { alert("✨ Global Rate Updated!"); window.location.reload(); }
    } catch (e) { alert("❌ Error"); } finally { setRateLoading(false); }
  };

  const renderLivePrice = (product: any) => {
      if (product.pricingType === 'fixed') {
          return Math.round((product.fixedPrice || 0) * 1.03);
      } else {
          const silverCost = (product.weight || 0) * silverRate;
          const labor = silverCost * ((product.makingCharges || 0) / 100);
          return Math.round((silverCost + labor) * 1.03);
      }
  };

  const filteredProducts = products.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const outOfStockCount = products.filter(p => p.stockQuantity === 0).length;

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#FDFCFB]">
        <Loader2 className="animate-spin text-[#3366FF] mb-4" size={40}/>
        <p className="font-bold text-stone-400 animate-pulse tracking-widest uppercase text-xs">Authenticating Admin</p>
    </div>
  );

  return (
    <div className="bg-[#F9FAFB] min-h-screen p-4 md:p-10 font-sans text-stone-800">
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
            <h1 className="text-3xl font-black tracking-tight text-stone-900">Inventory Dashboard</h1>
            <p className="text-stone-500 font-medium">Manage your products and live pricing efficiently.</p>
        </div>
        
        <div className="bg-white p-2 pl-6 rounded-2xl shadow-xl shadow-blue-100/50 border border-blue-50 flex items-center gap-6">
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Live Silver Rate</span>
                <div className="flex items-center gap-1">
                    <span className="text-xl font-black text-stone-900">₹</span>
                    <input type="number" value={silverRate} onChange={(e) => setSilverRate(Number(e.target.value))} className="w-16 bg-transparent font-black text-xl text-[#3366FF] outline-none" />
                </div>
            </div>
            <button onClick={handleUpdateRate} disabled={rateLoading} className="bg-[#3366FF] text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-black transition-all shadow-lg shadow-blue-200">
                {rateLoading ? "..." : "Sync Rate"}
            </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 flex items-center gap-5 shadow-sm">
              <div className="bg-stone-100 p-4 rounded-2xl text-stone-600"><Boxes size={24}/></div>
              <div>
                  <p className="text-[11px] text-stone-400 font-black uppercase">Active Catalog</p>
                  <h3 className="text-2xl font-black">{products.length} Products</h3>
              </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-stone-200 flex items-center gap-5 shadow-sm">
              <div className="bg-rose-50 p-4 rounded-2xl text-rose-500"><Trash2 size={24}/></div>
              <div>
                  <p className="text-[11px] text-rose-400 font-black uppercase tracking-widest">Out of Stock</p>
                  <h3 className="text-2xl font-black text-rose-600">{outOfStockCount}</h3>
              </div>
          </div>
      </div>

      {/* TABLE SECTION */}
      <div className="max-w-7xl mx-auto bg-white rounded-[2rem] shadow-2xl shadow-stone-200/50 border border-stone-200 overflow-hidden">
          <div className="p-8 border-b border-stone-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-[#FCFBFB]">
             <h2 className="text-xl font-black text-stone-900 flex items-center gap-2"><Package className="text-blue-500"/> Product List</h2>
             <div className="relative w-full md:w-80 group">
                 <Search className="absolute left-4 top-3.5 text-stone-400 group-focus-within:text-[#3366FF] transition-colors" size={18}/>
                 <input type="text" placeholder="Search product by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-3.5 border border-stone-200 rounded-2xl text-sm outline-none focus:border-[#3366FF] focus:ring-4 focus:ring-blue-50 transition-all font-medium" />
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
               <thead className="bg-[#FDFCFB] text-stone-400 uppercase text-[10px] font-black tracking-widest">
                 <tr>
                     <th className="px-8 py-5 border-b border-stone-100">Product Detail</th>
                     <th className="px-6 py-5 border-b border-stone-100">Value Input</th>
                     <th className="px-6 py-5 border-b border-stone-100">Live Quote</th>
                     <th className="px-6 py-5 border-b border-stone-100 text-center">Stock</th>
                     <th className="px-8 py-5 border-b border-stone-100 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-stone-50 text-sm">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-blue-50/30 transition-all group">
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-stone-100 relative overflow-hidden border border-stone-200 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                    {product.image && <Image src={urlFor(product.image[0])?.width(200).url() || ""} alt="" fill className="object-cover"/>}
                                </div>
                                <div>
                                    <div className="font-bold text-stone-900 mb-0.5">{product.title}</div>
                                    <div className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{product.category}</div>
                                </div>
                            </div>
                        </td>
                        
                        <td className="px-6 py-6">
                            <div className="relative group/input">
                                <input 
                                    type="number" 
                                    value={product.pricingType === 'fixed' ? (product.fixedPrice || 0) : (product.weight || 0)} 
                                    onChange={(e) => handleChange(product._id, product.pricingType === 'fixed' ? 'fixedPrice' : 'weight', e.target.value)} 
                                    className="w-28 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 font-bold text-center focus:border-[#3366FF] focus:bg-white outline-none transition-all" 
                                />
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-[8px] font-black text-stone-400 uppercase tracking-tighter">
                                    {product.pricingType === 'fixed' ? 'Fixed ₹' : 'Weight g'}
                                </span>
                            </div>
                        </td>

                        <td className="px-6 py-6 font-black text-stone-900">
                            ₹{renderLivePrice(product).toLocaleString()}
                        </td>

                        <td className="px-6 py-6 text-center">
                            <input type="number" value={product.stockQuantity} onChange={(e) => handleChange(product._id, 'stockQuantity', e.target.value)} 
                                className={`w-16 border rounded-xl px-3 py-2 text-center font-black outline-none transition-all ${product.stockQuantity === 0 ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-stone-200 bg-stone-50'}`} />
                        </td>

                        <td className="px-8 py-6 text-right">
                            <div className="flex justify-end items-center gap-2">
                                {/* SAVE BUTTON */}
                                <button onClick={() => handleSaveProduct(product)} disabled={savingId === product._id} 
                                    className="bg-white border border-stone-200 text-stone-400 hover:text-[#3366FF] hover:border-[#3366FF] p-3 rounded-xl transition-all shadow-sm">
                                    {savingId === product._id ? <Loader2 size={18} className="animate-spin text-[#3366FF]"/> : <Save size={18}/>}
                                </button>
                                
                                {/* DELETE BUTTON */}
                                <button onClick={() => handleDeleteProduct(product._id, product.title)} disabled={deletingId === product._id}
                                    className="bg-rose-50 border border-rose-100 text-rose-400 hover:bg-rose-600 hover:text-white p-3 rounded-xl transition-all shadow-sm">
                                    {deletingId === product._id ? <Loader2 size={18} className="animate-spin"/> : <Trash2 size={18}/>}
                                </button>
                            </div>
                        </td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 flex justify-center items-center gap-2 text-stone-400 text-xs font-bold uppercase tracking-widest opacity-50">
          <IndianRupee size={12}/> Kankariya Jewellers Management v2.1
      </div>
    </div>
  );
}