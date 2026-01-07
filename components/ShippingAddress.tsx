"use client"

import React, { useState, useEffect } from 'react'
import { MapPin, Plus, Check, Loader2 } from 'lucide-react'
import { useUser } from "@clerk/nextjs"; 

// 👇 1. Interface Export taaki Cart page use kar sake
export interface Address {
  _id?: string;
  name: string;
  email?: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  pinCode: string;
}

interface ShippingAddressProps {
  // 👇 Prop ab Pura Object lega
  onAddressSelect: (address: Address) => void; 
}

export default function ShippingAddress({ onAddressSelect }: ShippingAddressProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const { user, isLoaded, isSignedIn } = useUser();
  
  const initialFormState = {
    name: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    pinCode: "",
  };

  const [formData, setFormData] = useState<Address>(initialFormState);

  // Fetch Addresses on Load
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const fetchAddresses = async () => {
        try {
          const res = await fetch(`/api/get-address?userId=${user.id}`);
          const data = await res.json();
          if (data.addresses) setAddresses(data.addresses);
        } catch (error) {
          console.error("Error loading addresses", error);
        }
      };
      fetchAddresses();
    }
  }, [isLoaded, isSignedIn, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/save-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId: user?.id }), 
      });
      const result = await response.json();
      if (response.ok) {
        setAddresses(prev => [...prev, result.data]);
        resetForm();
      }
    } catch (error) {
      alert("Error saving address.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (addr: Address) => {
    setSelectedId(addr._id || null);
    onAddressSelect(addr); // 👈 Passing Full Object
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setShowForm(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
           <MapPin size={18} className="text-rose-600" /> Shipping Address
        </h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="text-xs bg-stone-900 text-white px-3 py-1.5 rounded-lg hover:bg-rose-600 flex items-center gap-1">
            <Plus size={14} /> Add New
          </button>
        )}
      </div>

      {!showForm && (
        <div className="flex flex-col gap-3">
          {addresses.map((addr, idx) => (
            <div 
                key={idx} 
                className={`border p-3 rounded-xl relative transition-all cursor-pointer ${selectedId === addr._id ? "border-rose-500 bg-rose-50" : "border-stone-100 hover:border-rose-200"}`}
                onClick={() => handleSelect(addr)}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-sm text-stone-900">{addr.name}</h3>
                        <p className="text-xs text-stone-500 mt-1">{addr.streetAddress}, {addr.city}</p>
                        <p className="text-xs text-stone-500">{addr.state} - {addr.pinCode}</p>
                        <p className="text-xs font-bold text-stone-600 mt-1">Ph: {addr.phone}</p>
                    </div>
                    {selectedId === addr._id && <Check size={18} className="text-rose-600" />}
                </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSave} className="space-y-3 animate-in fade-in slide-in-from-top-2">
           <div className="grid grid-cols-2 gap-3">
              <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="border p-2 rounded text-xs w-full" required />
              <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="border p-2 rounded text-xs w-full" required />
           </div>
           <input name="email" value={formData.email} onChange={handleChange} placeholder="Email (Optional)" className="border p-2 rounded text-xs w-full" />
           <input name="streetAddress" value={formData.streetAddress} onChange={handleChange} placeholder="Address (House No, Street)" className="border p-2 rounded text-xs w-full" required />
           <div className="grid grid-cols-3 gap-3">
              <input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="border p-2 rounded text-xs w-full" required />
              <input name="state" value={formData.state} onChange={handleChange} placeholder="State" className="border p-2 rounded text-xs w-full" required />
              <input name="pinCode" value={formData.pinCode} onChange={handleChange} placeholder="Pin Code" className="border p-2 rounded text-xs w-full" required />
           </div>
           <div className="flex gap-2 pt-2">
              <button type="button" onClick={resetForm} className="flex-1 bg-stone-100 text-stone-600 py-2 rounded text-xs font-bold">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 bg-stone-900 text-white py-2 rounded text-xs font-bold flex items-center justify-center gap-2">
                 {loading ? <Loader2 size={14} className="animate-spin" /> : "Save & Select"}
              </button>
           </div>
        </form>
      )}
    </div>
  )
}