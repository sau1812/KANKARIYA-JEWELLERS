"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useUser } from "@clerk/nextjs"
import { client } from '@/sanity/lib/client'
import { ChevronRight, User, MapPin, CreditCard, Loader2, X, ShieldCheck, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const loadScript = (src: string) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const FloatingInput = ({ label, type = "text", value, onChange, error }: any) => (
  <div className="relative w-full">
    <input
      type={type}
      className={`block px-4 pb-2.5 pt-5 w-full text-sm text-stone-900 bg-transparent rounded-xl border ${error ? 'border-rose-500' : 'border-stone-300'} appearance-none focus:outline-none focus:ring-0 focus:border-[#3366FF] peer transition-colors`}
      placeholder=" "
      value={value}
      onChange={onChange}
    />
    <label className={`absolute text-sm ${error ? 'text-rose-500' : 'text-stone-500'} duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-4 peer-focus:text-[#3366FF] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 pointer-events-none bg-white px-1`}>
      {label}
    </label>
    {error && (
        <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1 font-bold animate-in slide-in-from-left-1">
            <AlertCircle size={10}/> {error}
        </p>
    )}
  </div>
);

export default function CheckoutPopupPage() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  const [step, setStep] = useState(1);
  const [contactForm, setContactForm] = useState({ phone: '', email: '' });
  const [addressForm, setAddressForm] = useState({ pincode: '', city: '', state: '', name: '', street: '' });
  const [errors, setErrors] = useState<any>({});
  
  const [saveAddress, setSaveAddress] = useState(true); 
  const [existingAddressId, setExistingAddressId] = useState<string | null>(null); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (isSignedIn && user) {
      setContactForm(prev => ({ ...prev, email: user.primaryEmailAddress?.emailAddress || '' }));
      setAddressForm(prev => ({ ...prev, name: user.fullName || '' }));
    }
  }, [isSignedIn, user]);

  const total = getCartTotal() + (getCartTotal() > 1000 ? 0 : 100);

  // Validation Logic
  const validateStep1 = () => {
    const newErrors: any = {};
    if (!/^\d{10}$/.test(contactForm.phone)) newErrors.phone = "Enter a valid 10-digit phone number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) newErrors.email = "Enter a valid email address";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: any = {};
    if (!addressForm.name.trim()) newErrors.name = "Name is required";
    if (!/^\d{6}$/.test(addressForm.pincode)) newErrors.pincode = "Enter 6-digit Pincode";
    if (!addressForm.city.trim()) newErrors.city = "City is required";
    if (!addressForm.state.trim()) newErrors.state = "State is required";
    if (!addressForm.street.trim()) newErrors.street = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchAddressByPhone = async (phone: string) => {
    try {
      const query = `*[_type == "address" && phone == $phone] | order(_createdAt desc)[0]`;
      const savedAddress = await client.fetch(query, { phone });
      if (savedAddress) {
        setExistingAddressId(savedAddress._id);
        setAddressForm({
          name: savedAddress.name || addressForm.name,
          pincode: savedAddress.pinCode || '',
          city: savedAddress.city || '',
          state: savedAddress.state || '',
          street: savedAddress.streetAddress || ''
        });
        if(savedAddress.email) setContactForm(prev => ({...prev, email: savedAddress.email}));
      }
    } catch (error) { console.error(error); }
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (!validateStep1()) return;
      setIsProcessing(true);
      await fetchAddressByPhone(contactForm.phone);
      setIsProcessing(false);
      setStep(2);
    } else if (step === 2) {
      if (!validateStep2()) return;
      if (saveAddress) {
        setIsProcessing(true);
        try {
          await fetch("/api/save-address", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user?.id || "guest",
              ...addressForm,
              phone: contactForm.phone,
              email: contactForm.email,
              streetAddress: addressForm.street,
              pinCode: addressForm.pincode,
              isDefault: true
            }),
          });
        } catch (err) { console.error(err); } 
        finally { setIsProcessing(false); }
      }
      setStep(3);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) throw new Error("SDK fail");

        const rzpOrderResponse = await fetch("/api/razorpay", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: total }), 
        });
        const rzpOrderData = await rzpOrderResponse.json();

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
            amount: rzpOrderData.amount, currency: rzpOrderData.currency,
            name: "Kankariya Jewellers", order_id: rzpOrderData.id,
            handler: async function (response: any) {
                const orderResponse = await fetch("/api/create-order", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        cartItems: cartItems.map(item => ({ _id: item._id, quantity: item.quantity })), 
                        shippingAddress: { ...addressForm, phone: contactForm.phone, email: contactForm.email },
                        userId: user?.id || "guest_user", email: contactForm.email,
                        paymentId: response.razorpay_payment_id, razorpayOrderId: response.razorpay_order_id, razorpaySignature: response.razorpay_signature,
                    }),
                });
                if (orderResponse.ok) {
                    const data = await orderResponse.json();
                    clearCart();
                    router.push(`/success?order_id=${data.orderId}`); 
                }
            },
            prefill: { name: addressForm.name, email: contactForm.email, contact: contactForm.phone },
            theme: { color: "#3366FF" },
            modal: { ondismiss: () => setIsProcessing(false) }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
    } catch (e) { setIsProcessing(false); }
  };

  if (!isClient || !isLoaded) return null;

  return (
    <div className="min-h-screen bg-stone-900/40 backdrop-blur-md flex items-center justify-center p-4 md:p-8 font-sans selection:bg-[#3366FF] selection:text-white">
      <div className="w-full max-w-[950px] bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative min-h-[600px] animate-in zoom-in-95 fade-in duration-500">
        
        <button onClick={() => router.push('/cart')} className="absolute top-5 right-5 z-30 text-stone-400 hover:text-stone-900 bg-white/50 rounded-full p-2 transition-all"><X size={20}/></button>

        {/* LEFT PANEL */}
        <div className="w-full md:w-[45%] bg-[#3366FF] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white text-[#3366FF] flex items-center justify-center rounded-xl font-bold text-xl">K</div>
              <h1 className="text-xl font-bold">Kankariya Jewellers</h1>
            </div>
            <div className="bg-[#1A4BDB]/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-inner overflow-hidden">
                <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar-light text-sm">
                    {cartItems.map(item => (
                        <div key={item._id} className="flex gap-4 items-center">
                            <div className="w-12 h-12 bg-white rounded-lg overflow-hidden relative flex-shrink-0">
                                {item.imageUrl && <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />}
                            </div>
                            <div className="flex-1 line-clamp-2 font-medium">{item.title}</div>
                            <div className="font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/20">
              <span className="opacity-90 font-medium tracking-wide uppercase text-[10px]">Grand Total</span>
              <span className="text-3xl font-bold">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="relative z-10 mt-8 flex items-center gap-2 text-blue-100 text-xs font-medium"><ShieldCheck size={16}/> 100% Secured Payment</div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-[55%] bg-white p-8 md:p-12 relative flex flex-col justify-center">
          {/* STEP INDICATOR */}
          <div className="flex items-center justify-center mb-10 gap-2">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 ${step >= s ? 'bg-[#3366FF] text-white shadow-lg shadow-blue-200' : 'bg-stone-100 text-stone-400'}`}>{s}</div>
                {s < 3 && <div className={`w-10 h-0.5 transition-all duration-500 ${step > s ? 'bg-[#3366FF]' : 'bg-stone-100'}`}></div>}
              </React.Fragment>
            ))}
          </div>

          <div className="max-w-[400px] mx-auto w-full">
            <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-2xl font-bold text-stone-900 mb-1 tracking-tight">Checkout</h2>
                <p className="text-sm text-stone-500 mb-8 leading-relaxed">Let's get your details to manage your order.</p>
                
                <div className="space-y-5">
                  <div className="group">
                    <div className={`flex rounded-xl border ${errors.phone ? 'border-rose-500' : 'border-stone-300 group-focus-within:border-[#3366FF]'} overflow-hidden transition-all bg-white`}>
                        <span className="bg-stone-50 px-4 flex items-center border-r border-stone-300 text-stone-600 text-sm font-bold">🇮🇳 +91</span>
                        <input type="tel" placeholder="Mobile number" className="flex-1 px-4 py-4 outline-none text-sm font-medium" value={contactForm.phone} onChange={e => {setContactForm({...contactForm, phone: e.target.value.replace(/\D/g, '')}); if(errors.phone) validateStep1();}} />
                    </div>
                    {errors.phone && <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1 font-bold"><AlertCircle size={10}/> {errors.phone}</p>}
                  </div>

                  <FloatingInput label="Email address" type="email" value={contactForm.email} error={errors.email} onChange={(e:any) => {setContactForm({...contactForm, email: e.target.value}); if(errors.email) validateStep1();}} />
                  
                  <button 
                    onClick={handleNextStep} 
                    disabled={isProcessing || !contactForm.phone || !contactForm.email} 
                    className="w-full bg-[#0D1136] text-white py-4 rounded-xl font-bold mt-2 hover:bg-[#3366FF] transition-all active:scale-[0.98] disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed flex justify-center items-center"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" /> : "Continue"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-2"><User size={14} className="text-stone-400"/><span className="text-xs font-bold text-stone-700">{contactForm.phone}</span></div>
                  <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase text-[#3366FF] hover:underline">Edit</button>
                </div>
                
                <div className="space-y-4">
                  <FloatingInput label="Full Name" value={addressForm.name} error={errors.name} onChange={(e:any) => setAddressForm({...addressForm, name: e.target.value})} />
                  <div className="flex gap-4">
                    <FloatingInput label="Pincode" value={addressForm.pincode} error={errors.pincode} onChange={(e:any) => setAddressForm({...addressForm, pincode: e.target.value})} />
                    <FloatingInput label="City" value={addressForm.city} error={errors.city} onChange={(e:any) => setAddressForm({...addressForm, city: e.target.value})} />
                  </div>
                  <FloatingInput label="State" value={addressForm.state} error={errors.state} onChange={(e:any) => setAddressForm({...addressForm, state: e.target.value})} />
                  <FloatingInput label="Flat / House / Area / Street" value={addressForm.street} error={errors.street} onChange={(e:any) => setAddressForm({...addressForm, street: e.target.value})} />
                  
                  <div className="flex items-center gap-2 px-1 py-1">
                      <input type="checkbox" id="saveAddress" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="w-4 h-4 rounded border-stone-300 text-[#3366FF] focus:ring-[#3366FF]" />
                      <label htmlFor="saveAddress" className="text-[11px] font-bold text-stone-500 cursor-pointer uppercase tracking-tight">{existingAddressId ? "Update existing address" : "Save for future checkout"}</label>
                  </div>

                  <button 
                    onClick={handleNextStep} 
                    disabled={isProcessing || !addressForm.name || !addressForm.pincode || !addressForm.city} 
                    className="w-full bg-[#0D1136] text-white py-4 rounded-xl font-bold mt-2 hover:bg-[#3366FF] transition-all active:scale-[0.98] disabled:bg-stone-200 disabled:text-stone-400 flex justify-center items-center"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" /> : "Verify Address"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
                <div className="space-y-3 text-left">
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 flex justify-between items-center">
                    <div className="flex-1"><p className="text-[10px] text-stone-400 uppercase font-black tracking-widest mb-1">Shipping to</p><p className="text-sm font-bold text-stone-800 line-clamp-1">{addressForm.street}, {addressForm.city}</p></div>
                    <button onClick={() => setStep(2)} className="text-[#3366FF] font-black text-[10px] uppercase ml-2">Edit</button>
                  </div>
                </div>
                <div className="py-4">
                    <h2 className="text-2xl font-black text-stone-900 mb-2 tracking-tight">One Last Step!</h2>
                    <p className="text-sm text-stone-500 mb-8 leading-relaxed">Securely pay <b>₹{total.toLocaleString('en-IN')}</b> using Razorpay to complete your order.</p>
                    <button onClick={handlePayment} disabled={isProcessing} className="w-full bg-[#3366FF] text-white py-5 rounded-2xl font-black text-lg flex justify-center items-center gap-3 hover:bg-[#254ED1] transition-all active:scale-[0.98] shadow-2xl shadow-blue-300 disabled:opacity-50">
                    {isProcessing ? <Loader2 className="animate-spin" size={24}/> : <><CreditCard size={22} /> Pay Now</>}
                    </button>
                </div>
                <div className="pt-6 border-t border-stone-100 flex items-center justify-center gap-2 text-stone-400 text-[10px] uppercase font-bold tracking-widest">
                    <ShieldCheck size={14}/> Secure 256-bit SSL encrypted
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}