"use client";

import { client } from "@/sanity/lib/client";
import { useEffect, useState } from "react";
import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";
import { Save, Loader2, Search, AlertCircle } from "lucide-react";

const builder = imageUrlBuilder(client);
function urlFor(source: any) { return builder.image(source); }

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
        try {
            const query = `*[_type == "product"] | order(_createdAt desc) {
                _id, title, price, stockQuantity, image, category
            }`;
            const data = await client.fetch(query);
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };
    fetchProducts();
  }, []);

  // 2. Handle Input Change (Local State Update)
  // Ye user ko turant type karne deta hai bina API call kiye
  const handleChange = (id: string, field: string, value: any) => {
     setProducts(prev => prev.map(p => p._id === id ? { ...p, [field]: value } : p));
  };

  // 3. Save Changes to Sanity (API Call)
  const handleSave = async (product: any) => {
     setSavingId(product._id);
     try {
         const response = await fetch("/api/update-product", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ 
                 productId: product._id, 
                 price: Number(product.price), 
                 stock: Number(product.stockQuantity) 
             }),
         });
         
         if (response.ok) {
            alert("✅ Product Updated Successfully!");
         } else {
            alert("❌ Failed to update");
         }
     } catch (error) {
         console.error(error);
         alert("❌ Error updating product");
     } finally {
         setSavingId(null);
     }
  };

  // Search Filter Logic
  const filteredProducts = products.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin text-rose-600"/> Loading Inventory...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 min-h-[80vh]">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-stone-800">Manage Inventory</h2>
            <p className="text-sm text-stone-500">Update prices and stock levels instantly.</p>
          </div>
          
          <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 text-stone-400" size={18}/>
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
              />
          </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-lg border border-stone-100">
        <table className="w-full text-left border-collapse">
           <thead className="bg-stone-50 text-stone-500 text-xs uppercase font-bold">
              <tr>
                 <th className="p-4">Product Name</th>
                 <th className="p-4">Category</th>
                 <th className="p-4 w-32">Price (₹)</th>
                 <th className="p-4 w-28">Stock</th>
                 <th className="p-4 text-center w-20">Save</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-stone-100 text-sm text-stone-700">
              {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-stone-50 transition group">
                        
                        {/* Product Info */}
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-md bg-stone-100 relative overflow-hidden border border-stone-200 shrink-0">
                                    {product.image && <Image src={urlFor(product.image[0])?.width(100).url() || ""} alt="" fill className="object-cover"/>}
                                </div>
                                <span className="font-bold text-stone-800 line-clamp-1">{product.title}</span>
                            </div>
                        </td>

                        {/* Category */}
                        <td className="p-4 capitalize text-stone-500">{product.category}</td>
                        
                        {/* Editable Price Input */}
                        <td className="p-4">
                            <input 
                               type="number" 
                               value={product.price} 
                               onChange={(e) => handleChange(product._id, 'price', e.target.value)}
                               className="w-full border border-stone-200 bg-stone-50 focus:bg-white rounded px-2 py-1.5 text-sm font-bold text-stone-900 focus:border-rose-500 outline-none transition-all"
                            />
                        </td>

                        {/* Editable Stock Input */}
                        <td className="p-4">
                            <input 
                               type="number" 
                               value={product.stockQuantity} 
                               onChange={(e) => handleChange(product._id, 'stockQuantity', e.target.value)}
                               className={`w-full border rounded px-2 py-1.5 text-sm font-bold outline-none transition-all
                                ${product.stockQuantity < 5 
                                    ? 'border-red-200 text-red-600 bg-red-50 focus:border-red-500' 
                                    : 'border-stone-200 bg-stone-50 focus:bg-white focus:border-rose-500 text-stone-900'}`}
                            />
                        </td>

                        {/* Action Button */}
                        <td className="p-4 text-center">
                            <button 
                               onClick={() => handleSave(product)}
                               disabled={savingId === product._id}
                               className="bg-stone-900 text-white p-2 rounded-lg hover:bg-rose-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-sm"
                               title="Save Changes"
                            >
                               {savingId === product._id ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                            </button>
                        </td>
                     </tr>
                  ))
              ) : (
                  <tr>
                      <td colSpan={5} className="p-8 text-center text-stone-400">
                          <AlertCircle className="mx-auto mb-2 opacity-50" size={24} />
                          No products found matching "{searchTerm}"
                      </td>
                  </tr>
              )}
           </tbody>
        </table>
      </div>
    </div>
  );
}