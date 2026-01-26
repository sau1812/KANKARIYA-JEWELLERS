"use client";

import { client } from "@/sanity/lib/client";
import { useEffect, useState } from "react";
import { Loader2, Copy, Check, Truck, Package, Save, X, Eye, Info, Mail } from "lucide-react";
import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";

const builder = imageUrlBuilder(client);
function urlFor(source: any) { 
    if (!source) return null;
    return builder.image(source); 
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<string>(""); 
  const [statusLoading, setStatusLoading] = useState(false); 
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
        setNewStatus(selectedOrder.status);
    }
  }, [selectedOrder]);

  const fetchOrders = async () => {
      try {
        const query = `*[_type == "order"] | order(orderDate desc) {
            _id, orderNumber, customerName, phone, email, shippingAddress, totalPrice, status, orderDate,
            products[]{ 
              quantity, 
              priceAtPurchase,
              product->{title, image},
              selectedExtras[]{ optionName, price, description } 
            }
        }`;
        const data = await client.fetch(query);
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    setStatusLoading(true);
    try {
        await fetch("/api/update-order-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: selectedOrder._id, status: newStatus }),
        });
        setOrders(prev => prev.map(o => o._id === selectedOrder._id ? { ...o, status: newStatus } : o));
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
        alert("✅ Status Updated Successfully!");
    } catch (error) {
        alert("❌ Failed to update status");
    } finally {
        setStatusLoading(false);
    }
  };

  const copyForShiprocket = (order: any) => {
    const address = order.shippingAddress;
    const items = order.products.map((p: any) => `${p.quantity}x ${p.product?.title}`).join(", ");
    const textToCopy = `Name: ${order.customerName}\nPhone: ${order.phone || address.phone}\nEmail: ${order.email}\nAddress: ${address.address}, ${address.city}, ${address.state} - ${address.pinCode}\nItems: ${items}\nTotal: ₹${order.totalPrice}`.trim();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin text-rose-600" size={40}/></div>;

  return (
    <div className="bg-stone-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-stone-50/50">
            <h1 className="text-2xl font-serif font-bold text-stone-900">Order Management</h1>
            <span className="bg-white px-3 py-1 rounded-full border text-xs font-bold text-stone-500">
                Total Orders: {orders.length}
            </span>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-stone-50 text-stone-400 text-[10px] uppercase font-bold tracking-widest border-b">
                    <tr>
                        <th className="p-6">Order ID</th>
                        <th className="p-6">Customer</th>
                        <th className="p-6">Status</th>
                        <th className="p-6 text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                    {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-stone-50/80 transition cursor-pointer" onClick={() => setSelectedOrder(order)}>
                            <td className="p-6 font-mono text-stone-500">#{order.orderNumber.split('-')[1]}</td>
                            <td className="p-6 font-medium text-stone-800">{order.customerName}</td>
                            <td className="p-6"><StatusBadge status={order.status} /></td>
                            <td className="p-6 text-center text-stone-400 font-bold"><Eye size={16} className="mx-auto" /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* --- DRAWER PANEL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setSelectedOrder(null)}></div>
            <div className="relative w-full max-w-md bg-stone-50 h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 p-2 bg-white rounded-full text-stone-400 hover:text-black hover:shadow-md transition-all"><X size={20} /></button>

                <div className="flex flex-col gap-6 mt-4">
                    <div className="border-b border-stone-200 pb-4">
                        <h2 className="text-2xl font-serif text-stone-900 leading-tight">Order Details</h2>
                        <p className="text-sm text-stone-400 font-mono mt-1">Ref: #{selectedOrder.orderNumber}</p>
                    </div>

                    {/* Delivery Details Box with Email Added */}
                    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-stone-700 flex items-center gap-2"><Truck size={16} className="text-rose-600"/> Delivery Details</h3>
                            <button onClick={() => copyForShiprocket(selectedOrder)} className="text-[10px] font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-all">
                                {copied ? <Check size={12}/> : <Copy size={12}/>} {copied ? "Copied!" : "Copy Info"}
                            </button>
                        </div>
                        <div className="text-sm space-y-2 text-stone-600">
                            <p><span className="font-bold text-stone-400 uppercase text-[10px] block mb-0.5 tracking-wider">Full Name</span> {selectedOrder.customerName}</p>
                            <p><span className="font-bold text-stone-400 uppercase text-[10px] block mb-0.5 tracking-wider">Phone</span> {selectedOrder.phone || selectedOrder.shippingAddress?.phone}</p>
                            <p><span className="font-bold text-stone-400 uppercase text-[10px] block mb-0.5 tracking-wider">Email</span> {selectedOrder.email}</p>
                            <p><span className="font-bold text-stone-400 uppercase text-[10px] block mb-0.5 tracking-wider">Address</span> {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pinCode}</p>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div>
                        <h3 className="font-bold text-stone-700 mb-4 flex items-center gap-2 px-1"><Package size={16} className="text-rose-600"/> Items Ordered</h3>
                        <div className="space-y-4">
                            {selectedOrder.products?.map((item: any, idx: number) => (
                                <div key={idx} className="bg-white p-4 rounded-2xl border border-stone-200 space-y-4 shadow-sm">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 bg-stone-50 rounded-xl overflow-hidden relative border border-stone-100 shrink-0">
                                            {item.product?.image && <Image src={urlFor(item.product.image[0])?.width(100).url() || ""} alt="" fill className="object-cover"/>}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-stone-800 leading-tight">{item.product?.title}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="text-xs text-stone-500 font-medium tracking-tight italic font-bold text-stone-900">₹{(item.priceAtPurchase ?? 0).toLocaleString()}</p>
                                                <p className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customizations instruction Display */}
                                    {item.selectedExtras && item.selectedExtras.length > 0 && (
                                        <div className="pt-3 border-t border-dashed border-stone-100 bg-rose-50/30 p-3 rounded-xl">
                                            <p className="text-[10px] font-bold text-rose-600 uppercase mb-2 flex items-center gap-1 tracking-widest">
                                                <Info size={10}/> Customization instruction
                                            </p>
                                            <div className="space-y-2">
                                                {item.selectedExtras.map((ex: any, i: number) => (
                                                    <div key={i} className="text-xs border-l-2 border-rose-200 pl-3">
                                                        <div className="flex justify-between">
                                                            <span className="font-bold text-stone-700">{ex.optionName}</span>
                                                            <span className="text-rose-600 font-bold">+₹{ex.price}</span>
                                                        </div>
                                                        {ex.description && (
                                                            <p className="text-[11px] text-stone-500 italic mt-0.5 leading-snug font-medium">"{ex.description}"</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status Stick Bottom */}
                    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-lg mt-auto sticky bottom-0 z-10">
                        <h3 className="font-bold text-stone-700 mb-4 text-sm uppercase tracking-widest">Update Order Status</h3>
                        <div className="flex gap-2 flex-wrap mb-6">
                            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setNewStatus(status)}
                                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase transition-all border
                                        ${newStatus === status 
                                            ? 'bg-stone-900 text-white border-stone-900 shadow-md scale-105' 
                                            : 'bg-white text-stone-400 border-stone-100 hover:border-stone-300'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={handleSaveStatus}
                            disabled={statusLoading || newStatus === selectedOrder.status}
                            className="w-full h-14 rounded-2xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 disabled:opacity-50 flex justify-center items-center gap-3 active:scale-95"
                        >
                            {statusLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />}
                            Update Order Status
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
       pending: "bg-amber-50 text-amber-600 border-amber-100",
       processing: "bg-blue-50 text-blue-600 border-blue-100",
       shipped: "bg-purple-50 text-purple-600 border-purple-100",
       delivered: "bg-emerald-50 text-emerald-600 border-emerald-100",
       cancelled: "bg-rose-50 text-rose-700 border-rose-100",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${styles[status] || "bg-gray-50 border-gray-100 text-gray-400"}`}>
         {status}
      </span>
    )
}