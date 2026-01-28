"use client";

import { client } from "@/sanity/lib/client";
import { useEffect, useState, useMemo } from "react";
import { Loader2, Copy, Check, Truck, Package, Save, X, Eye, Info, Clock, CheckCircle2, Ban, Inbox } from "lucide-react";
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
  
  // 🎯 Status Filter State
  const [currentTab, setCurrentTab] = useState<string>("all");

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    if (selectedOrder) { setNewStatus(selectedOrder.status); }
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

  // 📊 Tab Logic & Counts
  const orderStats = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    }
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (currentTab === "all") return orders;
    return orders.filter(o => o.status === currentTab);
  }, [orders, currentTab]);

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

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-rose-600" size={40}/></div>;

  return (
    <div className="bg-stone-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-serif font-bold text-stone-900">Order Dashboard</h1>
            <div className="bg-white px-4 py-2 rounded-2xl border border-stone-200 shadow-sm">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Store Overview</p>
                <p className="text-sm font-bold text-rose-600">{orderStats.all} Lifetime Orders</p>
            </div>
        </div>

        {/* --- STATUS GRID TABS --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatusTab label="All" count={orderStats.all} active={currentTab === 'all'} onClick={() => setCurrentTab('all')} icon={<Inbox size={18}/>} color="stone" />
            <StatusTab label="Pending" count={orderStats.pending} active={currentTab === 'pending'} onClick={() => setCurrentTab('pending')} icon={<Clock size={18}/>} color="amber" />
            <StatusTab label="Processing" count={orderStats.processing} active={currentTab === 'processing'} onClick={() => setCurrentTab('processing')} icon={<Loader2 size={18}/>} color="blue" />
            <StatusTab label="Shipped" count={orderStats.shipped} active={currentTab === 'shipped'} onClick={() => setCurrentTab('shipped')} icon={<Truck size={18}/>} color="purple" />
            <StatusTab label="Delivered" count={orderStats.delivered} active={currentTab === 'delivered'} onClick={() => setCurrentTab('delivered')} icon={<CheckCircle2 size={18}/>} color="emerald" />
            <StatusTab label="Cancelled" count={orderStats.cancelled} active={currentTab === 'cancelled'} onClick={() => setCurrentTab('cancelled')} icon={<Ban size={18}/>} color="rose" />
        </div>

        {/* --- ORDERS LIST --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 overflow-hidden min-h-[400px]">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-stone-50/50 text-stone-400 text-[10px] uppercase font-bold tracking-widest border-b">
                        <tr>
                            <th className="p-6">Order ID</th>
                            <th className="p-6">Customer</th>
                            <th className="p-6">Total Amount</th>
                            <th className="p-6">Status</th>
                            <th className="p-6 text-center">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-sm">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-stone-50/80 transition cursor-pointer group" onClick={() => setSelectedOrder(order)}>
                                    <td className="p-6 font-mono text-stone-500 font-bold">#{order.orderNumber.split('-')[1]}</td>
                                    <td className="p-6">
                                        <p className="font-bold text-stone-800">{order.customerName}</p>
                                        <p className="text-[10px] text-stone-400">{new Date(order.orderDate).toLocaleDateString()}</p>
                                    </td>
                                    <td className="p-6 font-bold text-stone-900">₹{order.totalPrice.toLocaleString()}</td>
                                    <td className="p-6"><StatusBadge status={order.status} /></td>
                                    <td className="p-6 text-center">
                                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center mx-auto group-hover:bg-rose-600 group-hover:text-white transition-all">
                                            <Eye size={14} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-20 text-center">
                                    <Package size={40} className="mx-auto text-stone-200 mb-4" />
                                    <p className="text-stone-400 font-serif italic">No {currentTab} orders found.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* --- DRAWER PANEL (Aapka Original Detail Logic) --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setSelectedOrder(null)}></div>
            <div className="relative w-full max-w-md bg-stone-50 h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
                <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 p-2 bg-white rounded-full text-stone-400 hover:text-black hover:shadow-md transition-all"><X size={20} /></button>

                <div className="flex flex-col gap-6 mt-4 flex-1">
                    <div className="border-b border-stone-200 pb-4">
                        <h2 className="text-2xl font-serif text-stone-900 leading-tight">Order Details</h2>
                        <p className="text-sm text-stone-400 font-mono mt-1">Ref: #{selectedOrder.orderNumber}</p>
                    </div>

                    {/* Delivery Details */}
                    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-stone-700 flex items-center gap-2"><Truck size={16} className="text-rose-600"/> Delivery Details</h3>
                            <button onClick={(e) => { e.stopPropagation(); copyForShiprocket(selectedOrder); }} className="text-[10px] font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-all">
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
                                                        {ex.description && <p className="text-[11px] text-stone-500 italic mt-0.5 leading-snug font-medium">"{ex.description}"</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- UPDATE STATUS (Sticky Bottom) --- */}
                <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xl mt-4">
                    <h3 className="font-bold text-stone-700 mb-4 text-[10px] uppercase tracking-widest">Move Order To:</h3>
                    <div className="flex gap-2 flex-wrap mb-6">
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                            <button key={status} onClick={() => setNewStatus(status)} 
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border
                                ${newStatus === status ? 'bg-stone-900 text-white border-stone-900 shadow-md' : 'bg-white text-stone-400 border-stone-100 hover:border-stone-300'}`}>
                                {status}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleSaveStatus} disabled={statusLoading || newStatus === selectedOrder.status}
                        className="w-full h-14 rounded-2xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 disabled:opacity-50 flex justify-center items-center gap-3">
                        {statusLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />} Update Order Status
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

// 🏷️ Sub-Components
function StatusTab({ label, count, active, onClick, icon, color }: any) {
    const colors: any = {
        stone: "text-stone-600 bg-white border-stone-100",
        amber: "text-amber-600 bg-amber-50 border-amber-100",
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        purple: "text-purple-600 bg-purple-50 border-purple-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
        rose: "text-rose-600 bg-rose-50 border-rose-100",
    };

    return (
        <button onClick={onClick} className={`flex flex-col items-start p-4 rounded-3xl border transition-all duration-300 ${active ? 'bg-white shadow-lg ring-2 ring-rose-500 ring-offset-2 -translate-y-1' : 'bg-white/50 border-stone-100 hover:bg-white'}`}>
            <div className={`p-2 rounded-xl mb-3 ${colors[color]}`}>{icon}</div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{label}</p>
            <p className="text-xl font-bold text-stone-900">{count}</p>
        </button>
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
      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status] || "bg-gray-50 border-gray-100 text-gray-400"}`}>
         {status}
      </span>
    );
}