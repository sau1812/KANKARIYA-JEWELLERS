"use client";

import { client } from "@/sanity/lib/client";
import { useEffect, useState } from "react";
import { Loader2, Copy, Check, Truck, Package, Save, X, Eye } from "lucide-react";
import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";

const builder = imageUrlBuilder(client);
function urlFor(source: any) { return builder.image(source); }

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Drawer States
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<string>(""); 
  const [statusLoading, setStatusLoading] = useState(false); 
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Jab order select ho, uska status local state mein set karo
  useEffect(() => {
    if (selectedOrder) {
        setNewStatus(selectedOrder.status);
    }
  }, [selectedOrder]);

  const fetchOrders = async () => {
      try {
        const query = `*[_type == "order"] | order(orderDate desc) {
            _id, orderNumber, customerName, phone, email, shippingAddress, totalPrice, status, orderDate,
            products[]{ quantity, product->{title, image} }
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
        
        // UI Update
        setOrders(prev => prev.map(o => o._id === selectedOrder._id ? { ...o, status: newStatus } : o));
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
        
        alert("Status Updated Successfully!");
    } catch (error) {
        alert("Failed to update status");
    } finally {
        setStatusLoading(false);
    }
  };

  const copyForShiprocket = (order: any) => {
    const address = order.shippingAddress;
    const items = order.products.map((p: any) => `${p.quantity}x ${p.product?.title}`).join(", ");
    
    const textToCopy = `
Name: ${order.customerName}
Phone: ${order.phone || address.phone}
Email: ${order.email}
Address: ${address.address}, ${address.city}, ${address.state} - ${address.pinCode}
Items: ${items}
Total: ₹${order.totalPrice}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin text-rose-600"/> Loading Orders...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-[calc(100vh-100px)] flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-stone-800">Orders</h1>
          <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold">Total: {orders.length}</span>
      </div>

      <div className="overflow-y-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-stone-50 text-stone-500 text-xs uppercase font-bold sticky top-0 z-10">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Status</th>
              <th className="p-4">Amount</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {orders.map((order) => (
              <tr 
                key={order._id} 
                className="hover:bg-stone-50 transition cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <td className="p-4 font-mono text-stone-500">{order.orderNumber.split('-')[1]}</td>
                <td className="p-4 font-medium text-stone-800">{order.customerName}</td>
                <td className="p-4"><StatusBadge status={order.status} /></td>
                <td className="p-4 font-bold">₹{order.totalPrice.toLocaleString()}</td>
                <td className="p-4 text-center">
                    <button className="flex items-center justify-center w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 mx-auto">
                        <Eye size={16} />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 👇 CUSTOM DRAWER (Bina kisi extra component ke) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Overlay (Click to close) */}
            <div 
                className="absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity" 
                onClick={() => setSelectedOrder(null)}
            ></div>

            {/* Drawer Panel */}
            <div className="relative w-full max-w-md bg-stone-50 h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                
                {/* Close Button */}
                <button 
                    onClick={() => setSelectedOrder(null)}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full text-stone-400 hover:text-black hover:bg-stone-200 transition"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col gap-6 mt-2">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-stone-200 pb-4">
                        <div>
                            <h2 className="text-2xl font-serif text-stone-900">Order Details</h2>
                            <p className="text-sm text-stone-500 font-mono">#{selectedOrder.orderNumber}</p>
                        </div>
                        <StatusBadge status={selectedOrder.status} />
                    </div>

                    {/* Shiprocket Copy Section */}
                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-stone-700 flex items-center gap-2">
                                <Truck size={16}/> Delivery Info
                            </h3>
                            <button 
                                onClick={() => copyForShiprocket(selectedOrder)}
                                className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded hover:bg-rose-100 transition"
                            >
                                {copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? "Copied!" : "Copy Info"}
                            </button>
                        </div>
                        <div className="text-sm text-stone-600 space-y-1">
                            <p><span className="font-bold">Name:</span> {selectedOrder.customerName}</p>
                            <p><span className="font-bold">Phone:</span> {selectedOrder.phone || selectedOrder.shippingAddress?.phone}</p>
                            <p><span className="font-bold">Email:</span> {selectedOrder.email}</p>
                            <p><span className="font-bold">Address:</span> {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}</p>
                            <p><span className="font-bold">Pin:</span> {selectedOrder.shippingAddress?.pinCode}, {selectedOrder.shippingAddress?.state}</p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h3 className="font-bold text-stone-700 mb-3 flex items-center gap-2"><Package size={16}/> Items Ordered</h3>
                        <div className="space-y-3">
                            {selectedOrder.products?.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-4 bg-white p-3 rounded-lg border border-stone-100">
                                    <div className="w-14 h-14 bg-stone-100 rounded overflow-hidden relative border border-stone-200">
                                        {item.product?.image && <Image src={urlFor(item.product.image[0])?.width(100).url() || ""} alt="" fill className="object-cover"/>}
                                    </div>
                                    <div>
                                        <p className="font-bold text-stone-800 text-sm">{item.product?.title}</p>
                                        <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status Update Action */}
                    <div className="bg-white p-4 rounded-xl border border-stone-200">
                        <h3 className="font-bold text-stone-700 mb-3">Change Order Status</h3>
                        
                        <div className="flex gap-2 flex-wrap mb-4">
                            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setNewStatus(status)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase transition border
                                        ${newStatus === status 
                                            ? 'bg-stone-800 text-white border-stone-800' 
                                            : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={handleSaveStatus}
                            disabled={statusLoading || newStatus === selectedOrder.status}
                            className="w-full py-3 rounded-lg font-bold text-white bg-rose-600 hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {statusLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Update Status
                        </button>
                    </div>

                </div>
            </div>
        </div>
      )}
    </div>
  );
}

// Badge Component
function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
       pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
       processing: "bg-blue-100 text-blue-700 border-blue-200",
       shipped: "bg-purple-100 text-purple-700 border-purple-200",
       delivered: "bg-green-100 text-green-700 border-green-200",
       cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    return (
      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${styles[status] || "bg-gray-100 border-gray-200"}`}>
         {status}
      </span>
    )
}