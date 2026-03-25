"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useUser } from "@clerk/nextjs"
import { client } from '@/sanity/lib/client'
import { ChevronRight, User, MapPin, CreditCard, Loader2, X, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react'
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

const FloatingInput = ({ label, type = "text", value, onChange, error, required = false }: any) => (
  <div className="relative w-full">
    <input
      type={type}
      className={`block px-4 pb-2.5 pt-5 w-full text-sm text-stone-900 bg-transparent rounded-xl border ${error ? 'border-rose-500' : 'border-stone-300'} appearance-none focus:outline-none focus:ring-0 focus:border-[#3366FF] peer transition-colors`}
      placeholder=" "
      value={value}
      onChange={onChange}
    />
    <label className={`absolute text-sm ${error ? 'text-rose-500' : 'text-stone-500'} duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-4 peer-focus:text-[#3366FF] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 pointer-events-none bg-white px-1 font-medium`}>
      {label} {!required && <span className="text-[10px] text-stone-400 italic">(Optional)</span>}
    </label>
    {error && <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1 font-bold animate-in slide-in-from-left-1"><AlertCircle size={10}/> {error}</p>}
  </div>
);

export default function CheckoutPopupPage() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  const [step, setStep] = useState(1);
  const [contactForm, setContactForm] = useState({ phone: '', email: '' });
  const [addressForm, setAddressForm] = useState({ pincode: '', city: '', state: '', name: '', street: '' });
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [errors, setErrors] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [hasPreviousAddress, setHasPreviousAddress] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (isSignedIn && user) {
      setContactForm(prev => ({ ...prev, email: user.primaryEmailAddress?.emailAddress || '' }));
      setAddressForm(prev => ({ ...prev, name: user.fullName || '' }));
    }
  }, [isSignedIn, user]);

  const total = getCartTotal() + (getCartTotal() > 1000 ? 0 : 100);

  // --- AUTO-FILL LOGIC (Background Fetch) ---
  const fetchAddressByPhone = async (phone: string) => {
    try {
      const query = `*[_type == "address" && phone == $phone] | order(_createdAt desc)[0]`;
      const savedAddress = await client.fetch(query, { phone });
      if (savedAddress) {
        setAddressForm({
          name: savedAddress.name || addressForm.name,
          pincode: savedAddress.pinCode || '',
          city: savedAddress.city || '',
          state: savedAddress.state || '',
          street: savedAddress.streetAddress || ''
        });
        if(savedAddress.email && !contactForm.email) setContactForm(prev => ({...prev, email: savedAddress.email}));
        setHasPreviousAddress(true);
      }
    } catch (error) { console.error(error); }
  };

  const validateStep1 = () => {
    const newErrors: any = {};
    if (!/^\d{10}$/.test(contactForm.phone)) newErrors.phone = "Enter a valid 10-digit phone number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: any = {};
    if (!addressForm.name.trim()) newErrors.name = "Name is required";
    if (!/^\d{6}$/.test(addressForm.pincode)) newErrors.pincode = "Enter 6-digit Pincode";
    if (!addressForm.city.trim()) newErrors.city = "City is required";
    if (!addressForm.street.trim()) newErrors.street = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleToPayment = async () => {
    if (!validateStep1()) return;
    setIsProcessing(true);
    await fetchAddressByPhone(contactForm.phone); // Auto-fill background mein ho jayega
    
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
            handler: function (response: any) {
                setPaymentDetails(response);
                setStep(3); // Payment ke baad Address par bhejo
                setIsProcessing(false);
            },
            prefill: { email: contactForm.email, contact: contactForm.phone },
            theme: { color: "#3366FF" },
            modal: { ondismiss: () => setIsProcessing(false) }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
    } catch (e) { setIsProcessing(false); }
  };

  const handleFinalOrder = async () => {
    if (!validateStep3()) return;
    setIsProcessing(true);
    try {
        const orderResponse = await fetch("/api/create-order", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cartItems: cartItems.map(item => ({ _id: item._id, quantity: item.quantity })), 
                shippingAddress: { ...addressForm, phone: contactForm.phone, email: contactForm.email },
                userId: user?.id || "guest_user", email: contactForm.email,
                paymentId: paymentDetails.razorpay_payment_id, razorpayOrderId: paymentDetails.razorpay_order_id, razorpaySignature: paymentDetails.razorpay_signature,
            }),
        });
        if (orderResponse.ok) {
            const data = await orderResponse.json();
            clearCart();
            router.push(`/success?order_id=${data.orderId}`); 
        }
    } catch (error) { console.error(error); } finally { setIsProcessing(false); }
  };

  if (!isClient || !isLoaded) return null;

  return (
    <div className="min-h-screen bg-stone-900/40 backdrop-blur-md flex items-center justify-center p-4 md:p-8 font-sans selection:bg-[#3366FF] selection:text-white">
      <div className="w-full max-w-[950px] bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative min-h-[600px] animate-in zoom-in-95 fade-in duration-500">
        
        <button onClick={() => router.back()} className="absolute top-5 right-5 z-30 text-stone-400 hover:text-stone-900 bg-white/50 rounded-full p-2 transition-all"><X size={20}/></button>

        {/* LEFT PANEL */}
        <div className="w-full md:w-[45%] bg-[#3366FF] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white text-[#3366FF] flex items-center justify-center rounded-xl font-bold text-xl uppercase italic">K</div>
              <h1 className="text-xl font-bold tracking-tight">Kankariya</h1>
            </div>
            <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar-light">
                {cartItems.map(item => (
                    <div key={item._id} className="flex gap-4 items-center bg-white/10 p-3 rounded-xl border border-white/5">
                        <div className="w-12 h-12 bg-white rounded-lg overflow-hidden relative flex-shrink-0 shadow-lg">
                            {item.imageUrl && <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />}
                        </div>
                        <div className="flex-1 line-clamp-1 font-medium text-sm opacity-90">{item.title}</div>
                        <div className="font-bold text-sm text-blue-100">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/20">
              <span className="opacity-80 font-bold uppercase text-[10px] tracking-[0.2em]">Grand Total</span>
              <span className="text-3xl font-black italic">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-blue-100 text-[10px] font-bold uppercase tracking-widest opacity-60"><ShieldCheck size={14}/> 100% Secure Checkout</div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-[55%] bg-white p-8 md:p-12 relative flex flex-col justify-center">
          {/* STEP INDICATOR */}
          <div className="flex items-center justify-center mb-10 gap-3">
            {['Contact', 'Payment', 'Address'].map((label, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-[#3366FF] text-white shadow-xl shadow-blue-200' : 'bg-stone-100 text-stone-400'}`}>
                        {step > i + 1 ? <CheckCircle2 size={16}/> : i + 1}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${step >= i + 1 ? 'text-stone-900' : 'text-stone-300'}`}>{label}</span>
                </div>
                {i < 2 && <div className={`w-12 h-0.5 mt-[-20px] transition-all duration-500 ${step > i + 1 ? 'bg-green-500' : 'bg-stone-100'}`}></div>}
              </React.Fragment>
            ))}
          </div>

          <div className="max-w-[400px] mx-auto w-full">
            <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-center">
                <div className="text-left space-y-1">
                    <h2 className="text-2xl font-black text-stone-900 tracking-tight">Checkout</h2>
                    <p className="text-sm text-stone-500">Enter details to proceed to payment.</p>
                </div>
                <div className="space-y-5">
                  <div className="group text-left">
                    <div className={`flex rounded-xl border ${errors.phone ? 'border-rose-500' : 'border-stone-300 focus-within:border-[#3366FF]'} overflow-hidden transition-all bg-stone-50/50`}>
                        <span className="bg-stone-100 px-4 flex items-center border-r border-stone-300 text-stone-600 text-sm font-bold">🇮🇳 +91</span>
                        <input type="tel" placeholder="Mobile number" className="flex-1 px-4 py-4 outline-none text-sm font-bold bg-transparent" value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value.replace(/\D/g, '')})} />
                    </div>
                    {errors.phone && <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1 font-bold"><AlertCircle size={10}/> {errors.phone}</p>}
                  </div>

                  <FloatingInput label="Email address" type="email" value={contactForm.email} onChange={(e:any) => setContactForm({...contactForm, email: e.target.value})} />
                  
                  <button 
                    onClick={handleToPayment} 
                    disabled={isProcessing || contactForm.phone.length < 10} 
                    className="w-full bg-[#0D1136] text-white py-4 rounded-xl font-black hover:bg-[#3366FF] transition-all shadow-xl shadow-stone-100 flex justify-center items-center gap-2 active:scale-95"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <>Continue to Payment <ChevronRight size={18}/></>}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-green-600"/>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-green-800 uppercase tracking-tight">Payment Received!</span>
                        <span className="text-[10px] text-green-600 font-medium">Please confirm your delivery address.</span>
                    </div>
                </div>

                <div className="space-y-4">
                  {hasPreviousAddress && <p className="text-[10px] bg-blue-50 text-[#3366FF] px-3 py-1.5 rounded-full font-black uppercase tracking-widest w-fit animate-bounce">✨ Auto-filled from last order</p>}
                  
                  <FloatingInput label="Full Name" required value={addressForm.name} error={errors.name} onChange={(e:any) => setAddressForm({...addressForm, name: e.target.value})} />
                  <div className="flex gap-4">
                    <FloatingInput label="Pincode" required value={addressForm.pincode} error={errors.pincode} onChange={(e:any) => setAddressForm({...addressForm, pincode: e.target.value})} />
                    <FloatingInput label="City" required value={addressForm.city} error={errors.city} onChange={(e:any) => setAddressForm({...addressForm, city: e.target.value})} />
                  </div>
                  <FloatingInput label="State" required value={addressForm.state} error={errors.state} onChange={(e:any) => setAddressForm({...addressForm, state: e.target.value})} />
                  <FloatingInput label="House No / Flat / Street Name" required value={addressForm.street} error={errors.street} onChange={(e:any) => setAddressForm({...addressForm, street: e.target.value})} />

                  <button 
                    onClick={handleFinalOrder} 
                    disabled={isProcessing} 
                    className="w-full bg-[#3366FF] text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-blue-200 flex justify-center items-center gap-3 hover:bg-black transition-all active:scale-95"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" /> : "Complete My Order"}
                  </button>
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