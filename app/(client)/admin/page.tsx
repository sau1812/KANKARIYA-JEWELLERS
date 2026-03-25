"use client";

import { client } from "@/sanity/lib/client";
import { useEffect, useState, useMemo } from "react";
import { 
  Loader2, Copy, Check, Truck, Package, Save, X, Eye, 
  Info, Clock, CheckCircle2, Ban, Inbox, Archive, Trash2 
} from "lucide-react";
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
              product->{ title, image, pricingType, fixedPrice },
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
        alert("✅ Status Updated!");
    } catch (error) {
        alert("❌ Error");
    } finally {
        setStatusLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  return (
    <div className="bg-[#FDFCFB] min-h-screen p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-4xl font-black text-stone-900 tracking-tight italic">Operations Hub</h1>
                <p className="text-stone-500 font-medium">Kankariya Jewellers Order Management</p>
            </div>
        </div>

        {/* STATS TABS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatusTab label="All" count={orderStats.all} active={currentTab === 'all'} onClick={() => setCurrentTab('all')} icon={<Inbox size={18}/>} color="stone" />
            <StatusTab label="New" count={orderStats.pending} active={currentTab === 'pending'} onClick={() => setCurrentTab('pending')} icon={<Clock size={18}/>} color="amber" />
            <StatusTab label="In Prep" count={orderStats.processing} active={currentTab === 'processing'} onClick={() => setCurrentTab('processing')} icon={<Loader2 size={18}/>} color="blue" />
            <StatusTab label="On Way" count={orderStats.shipped} active={currentTab === 'shipped'} onClick={() => setCurrentTab('shipped')} icon={<Truck size={18}/>} color="purple" />
            <StatusTab label="Success" count={orderStats.delivered} active={currentTab === 'delivered'} onClick={() => setCurrentTab('delivered')} icon={<CheckCircle2 size={18}/>} color="emerald" />
            <StatusTab label="Void" count={orderStats.cancelled} active={currentTab === 'cancelled'} onClick={() => setCurrentTab('cancelled')} icon={<Ban size={18}/>} color="rose" />
        </div>

        {/* ORDER TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/50 border border-stone-100 overflow-hidden min-h-[400px]">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#FCFBFB] text-stone-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-stone-50">
                        <tr>
                            <th className="p-8">Order ID</th>
                            <th className="p-8">Customer</th>
                            <th className="p-8">Revenue</th>
                            <th className="p-8 text-center">Status</th>
                            <th className="p-8 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50 text-sm">
                        {filteredOrders.map((order) => (
                            <tr key={order._id} className="hover:bg-blue-50/40 transition-all cursor-pointer group" onClick={() => setSelectedOrder(order)}>
                                <td className="p-8 font-black text-stone-400">#{order.orderNumber.split('-')[1]}</td>
                                <td className="p-8">
                                    <p className="font-bold text-stone-900">{order.customerName}</p>
                                    <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">{new Date(order.orderDate).toLocaleDateString()}</p>
                                </td>
                                <td className="p-8 font-black text-stone-900 text-lg italic">₹{order.totalPrice.toLocaleString()}</td>
                                <td className="p-8 text-center"><StatusBadge status={order.status} /></td>
                                <td className="p-8 text-right">
                                    <div className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center ml-auto group-hover:bg-[#3366FF] group-hover:text-white transition-all shadow-sm group-hover:rotate-12">
                                        <Eye size={18} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* DRAWER PANEL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
            <div className="relative w-full max-w-lg bg-[#FDFCFB] h-full shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-500 flex flex-col">
                <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 p-3 bg-white rounded-2xl text-stone-300 hover:text-stone-900 shadow-sm transition-all hover:rotate-90"><X size={20} /></button>

                <div className="flex flex-col gap-8 mt-6 flex-1">
                    <div className="border-b border-stone-100 pb-6">
                        <h2 className="text-3xl font-black text-stone-900 tracking-tight italic">Order Dossier</h2>
                        <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest mt-2 inline-block">Ref: {selectedOrder.orderNumber}</span>
                    </div>

                    {/* Customer Info Card */}
                    <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm space-y-4">
                        <ProfileLine label="Client Name" value={selectedOrder.customerName} />
                        <ProfileLine label="Verified Phone" value={selectedOrder.phone || selectedOrder.shippingAddress?.phone} />
                        <ProfileLine label="Shipping Hub" value={`${selectedOrder.shippingAddress?.address}, ${selectedOrder.shippingAddress?.city}, ${selectedOrder.shippingAddress?.state} - ${selectedOrder.shippingAddress?.pinCode}`} />
                    </div>

                    {/* Items */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">Shipment Inventory</p>
                        {selectedOrder.products?.map((item: any, idx: number) => (
                            <div key={idx} className="bg-white p-4 rounded-3xl border border-stone-100 flex gap-5 items-center">
                                <div className="w-16 h-16 bg-stone-50 rounded-2xl overflow-hidden relative shrink-0">
                                    {item.product?.image && <Image src={urlFor(item.product.image[0])?.width(200).url() || ""} alt="" fill className="object-cover"/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-stone-800 text-sm">{item.product?.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm font-black text-stone-900">₹{(item.priceAtPurchase ?? 0).toLocaleString()}</span>
                                        {item.product?.pricingType === 'fixed' && <span className="text-[8px] font-black bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 uppercase">Fixed</span>}
                                    </div>
                                    <p className="text-[10px] font-bold text-rose-500 uppercase mt-1">Quantity: {item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* LOGISTICS UPDATE */}
                <div className="mt-10 bg-stone-900 p-8 rounded-[2.5rem] shadow-2xl">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-5">Command Status</p>
                    <div className="flex gap-2 flex-wrap mb-8">
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                            <button key={status} onClick={() => setNewStatus(status)} 
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all border tracking-widest
                                ${newStatus === status ? 'bg-white text-stone-900 border-white shadow-xl scale-105' : 'bg-white/10 text-white/40 border-white/5 hover:border-white/20'}`}>
                                {status}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleSaveStatus} disabled={statusLoading || newStatus === selectedOrder.status}
                        className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-sm text-white bg-[#3366FF] hover:bg-white hover:text-[#3366FF] transition-all flex justify-center items-center gap-3 active:scale-95 shadow-xl shadow-blue-500/20">
                        {statusLoading ? <Loader2 className="animate-spin" size={20} /> : "Execute Update"}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

// Sub-components
function StatusTab({ label, count, active, onClick, icon, color }: any) {
    const colors: any = {
        stone: "text-stone-400 bg-stone-50",
        amber: "text-amber-500 bg-amber-50",
        blue: "text-blue-500 bg-blue-50",
        purple: "text-purple-500 bg-purple-50",
        emerald: "text-emerald-500 bg-emerald-50",
        rose: "text-rose-500 bg-rose-50",
    };
    return (
        <button onClick={onClick} className={`flex flex-col items-start p-5 rounded-[2rem] border transition-all duration-500 ${active ? 'bg-white shadow-2xl border-stone-200 ring-2 ring-[#3366FF] -translate-y-2' : 'bg-white/50 border-transparent hover:bg-white hover:border-stone-100'}`}>
            <div className={`p-2.5 rounded-xl mb-4 ${colors[color]}`}>{icon}</div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-black text-stone-900 italic">{count}</p>
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
    return <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${styles[status]}`}>{status}</span>;
}

function ProfileLine({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-bold text-stone-800 leading-snug">{value || "---"}</span>
        </div>
    );
}