"use client"
import React from 'react'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { Truck, RotateCcw, ShieldCheck, AlertCircle, Clock, PackageCheck } from 'lucide-react'

// Animation Variants (Fixed for TypeScript)
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

export default function ShippingReturnsPage() {
  return (
    <div className="bg-[#FAFAF9] min-h-screen">
      
      {/* --- Hero Section --- */}
      <section className="pt-24 pb-16 px-4 bg-white border-b border-stone-100">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif text-stone-900 mb-4"
          >
            Shipping & Returns
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-stone-500 max-w-xl mx-auto"
          >
            We are committed to ensuring your jewelry reaches you safely and that you are completely satisfied with your purchase.
          </motion.p>
        </div>
      </section>

      {/* --- Quick Highlights --- */}
      <section className="py-12 px-4">
        <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="container mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6"
        >
            <QuickInfoCard 
                icon={<ShieldCheck size={24} />} 
                title="Insured Delivery" 
                desc="Every package is fully insured during transit until it reaches your doorstep."
            />
            <QuickInfoCard 
                icon={<Truck size={24} />} 
                title="Free Shipping" 
                desc="Complimentary secure shipping on all orders above ₹1,000 within India."
            />
            <QuickInfoCard 
                icon={<RotateCcw size={24} />} 
                title="15-Day Returns" 
                desc="Easy returns or exchanges within 15 days of delivery for unworn items."
            />
        </motion.div>
      </section>

      {/* --- Detailed Policies --- */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-4xl space-y-12">
            
            {/* 1. SHIPPING POLICY */}
            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-stone-200"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-stone-100 rounded-full text-stone-900"><Truck size={20} /></div>
                    <h2 className="text-2xl font-serif text-stone-900">Shipping Policy</h2>
                </div>
                
                <div className="space-y-6 text-stone-600 leading-relaxed text-sm md:text-base">
                    <div>
                        <h3 className="font-bold text-stone-900 mb-2">Processing Time</h3>
                        <p>Ready-to-ship items are dispatched within <strong>24-48 hours</strong>. Custom or made-to-order pieces may take <strong>7-14 business days</strong> for craftsmanship and hallmarking.</p>
                    </div>
                    <div className="w-full h-px bg-stone-100"></div>
                    <div>
                        <h3 className="font-bold text-stone-900 mb-2">Secure Packaging</h3>
                        <p>All orders are shipped in <strong>tamper-proof packaging</strong>. If you notice the package is open or tampered with upon delivery, please <strong>do not accept</strong> it and contact us immediately.</p>
                    </div>
                    <div className="w-full h-px bg-stone-100"></div>
                    <div>
                        <h3 className="font-bold text-stone-900 mb-2">Tracking</h3>
                        <p>Once shipped, you will receive a tracking link via Email and SMS. You can track your package in real-time.</p>
                    </div>
                </div>
            </motion.div>

            {/* 2. RETURN & REFUND POLICY */}
            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-stone-200"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-stone-100 rounded-full text-stone-900"><RotateCcw size={20} /></div>
                    <h2 className="text-2xl font-serif text-stone-900">Returns & Refunds</h2>
                </div>

                <div className="space-y-6 text-stone-600 leading-relaxed text-sm md:text-base">
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-lg flex gap-3">
                        <AlertCircle className="text-rose-600 shrink-0" size={20} />
                        <p className="text-rose-800 text-sm">
                            <strong>Important:</strong> Please keep the <strong>security tag</strong> attached. Returns are NOT accepted if the security tag is broken or removed.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-stone-900 mb-2">Eligibility</h3>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                            <li>Item must be unused, unworn, and in original condition.</li>
                            <li>Original certificate, invoice, and packaging must be included.</li>
                            <li>Return request must be raised within 15 days of delivery.</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-stone-900 mb-2">Non-Returnable Items</h3>
                        <p>Customized jewelry (with engravings or personalized modifications) and Gold/Silver coins are not eligible for returns unless there is a manufacturing defect.</p>
                    </div>

                    <div className="w-full h-px bg-stone-100"></div>

                    <div>
                        <h3 className="font-bold text-stone-900 mb-2">Refund Process</h3>
                        <p>Once we receive the return shipment, our quality assurance team will inspect the item (2-3 working days). Upon approval, the refund will be initiated to your original payment method within <strong>5-7 business days</strong>.</p>
                    </div>
                </div>
            </motion.div>

            {/* 3. HOW TO INITIATE */}
            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-center pt-8"
            >
                <h3 className="text-xl font-serif text-stone-900 mb-6">How to initiate a return?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StepCard step="01" title="Request" text="Email us at kankariya29777@gmail.com with your Order ID." />
                    <StepCard step="02" title="Pack" text="Pack the item securely with the original certificate and box." />
                    <StepCard step="03" title="Pickup" text="Our secure logistics partner will pick up the package." />
                </div>
            </motion.div>

        </div>
      </section>

      {/* Footer / Contact CTA */}
   
    </div>
  )
}

// --- Sub-components for cleaner code ---

function QuickInfoCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <motion.div 
            variants={fadeInUp}
            className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm text-center flex flex-col items-center hover:shadow-md transition-shadow"
        >
            <div className="text-rose-600 mb-4 bg-rose-50 p-3 rounded-full">{icon}</div>
            <h3 className="font-bold text-stone-900 mb-2">{title}</h3>
            <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
        </motion.div>
    )
}

function StepCard({ step, title, text }: { step: string, title: string, text: string }) {
    return (
        <div className="flex flex-col items-center">
            <span className="text-4xl font-serif text-stone-200 mb-2">{step}</span>
            <h4 className="font-bold text-stone-900">{title}</h4>
            <p className="text-sm text-stone-500 max-w-[200px] mt-1">{text}</p>
        </div>
    )
}