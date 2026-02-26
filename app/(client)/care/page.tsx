"use client"
import React from 'react'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { Sparkles, Droplets, Sun, ShieldAlert, Gem, SprayCan, Waves } from 'lucide-react'

// --- Animation Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}

export default function JewelryCarePage() {
  return (
    <div className="bg-[#FAFAF9] min-h-screen">
      
      {/* --- Hero Section --- */}
      <section className="relative py-24 px-4 overflow-hidden bg-white border-b border-stone-100">
        <div className="container mx-auto max-w-4xl text-center z-10 relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <span className="text-rose-600 font-bold tracking-[0.2em] text-xs uppercase mb-4 block">
                Expert Advice
            </span>
            <h1 className="text-4xl md:text-6xl font-serif text-stone-900 mb-6">
              Caring for Your Sparkle
            </h1>
            <p className="text-stone-500 text-lg leading-relaxed max-w-2xl mx-auto">
              Fine jewelry is meant to be worn and cherished, but it requires a little love to keep it shining for generations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- The Golden Rule (Highlight) --- */}
      <section className="py-16 px-4">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="container mx-auto max-w-4xl"
        >
            <div className="bg-stone-900 text-stone-200 p-8 md:p-12 rounded-2xl text-center shadow-2xl relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-rose-600/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full blur-3xl"></div>
                
                <h2 className="text-2xl md:text-3xl font-serif text-white mb-4">The Golden Rule</h2>
                <p className="text-xl md:text-2xl font-light italic text-rose-200">
                    "Jewelry should be the last thing you put on, <br className="hidden md:block"/> and the first thing you take off."
                </p>
                <div className="mt-6 flex justify-center gap-8 text-sm font-bold tracking-widest uppercase text-stone-500">
                    <span>No Perfume</span>
                    <span>•</span>
                    <span>No Lotion</span>
                    <span>•</span>
                    <span>No Hairspray</span>
                </div>
            </div>
        </motion.div>
      </section>

      {/* --- General Care (Grid) --- */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
            <motion.div 
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <CareCard 
                    icon={<SprayCan size={24} />} 
                    title="Avoid Chemicals" 
                    text="Keep away from perfumes, lotions, and cleaning agents. Chemicals can erode gold and dull gemstones."
                />
                <CareCard 
                    icon={<Waves size={24} />} 
                    title="No Swimming" 
                    text="Chlorine in pools and salt in oceans can damage metals. Always remove jewelry before swimming."
                />
                <CareCard 
                    icon={<Sun size={24} />} 
                    title="Store Safely" 
                    text="Store pieces individually in soft pouches or lined boxes to prevent scratches and tangling."
                />
                <CareCard 
                    icon={<ShieldAlert size={24} />} 
                    title="Professional Check" 
                    text="Visit us once a year to check for loose prongs or deep cleaning needs."
                />
            </motion.div>
        </div>
      </section>

      {/* --- Material Specific Guide --- */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-serif text-stone-900 mb-2">Material Specifics</h2>
                <div className="w-12 h-1 bg-stone-200 mx-auto rounded-full"></div>
            </div>

            <div className="space-y-16">
                
                {/* 1. Gold */}
                <MaterialSection 
                    title="Gold (22K & 18K)"
                    desc="Gold is a soft metal and can scratch. To clean, soak in warm water with a few drops of mild dish soap. Gently scrub with a soft-bristled baby toothbrush, rinse, and pat dry."
                    icon={<Sparkles className="text-yellow-600" size={32} />}
                    color="border-yellow-100 bg-yellow-50/30"
                />

                {/* 2. Silver */}
                <MaterialSection 
                    title="Sterling Silver"
                    desc="Silver tarnishes when exposed to air. The best way to prevent this is to wear it often! The oils in your skin help prevent tarnish. Store in airtight bags when not in use."
                    icon={<Droplets className="text-slate-500" size={32} />}
                    color="border-slate-100 bg-slate-50/30"
                />

                {/* 3. Diamonds & Stones */}
                <MaterialSection 
                    title="Diamonds & Gemstones"
                    desc="Diamonds attract grease, which dulls their sparkle. Clean them regularly with mild soap and water. Be careful with softer stones like Pearls or Opals—never soak them."
                    icon={<Gem className="text-blue-500" size={32} />}
                    color="border-blue-100 bg-blue-50/30"
                />

            </div>
        </div>
      </section>

      {/* --- Footer CTA (Updated with Google Maps Link) --- */}
      <section className="py-24 px-4 text-center">
         <div className="container mx-auto max-w-2xl">
            <h3 className="text-2xl font-serif text-stone-900 mb-4">Need a Professional Shine?</h3>
            <p className="text-stone-500 mb-8">
                Visit our Nashik showroom for a complimentary cleaning and inspection service for all Kankariya Jewellers products.
            </p>
            {/* 👇 UPDATED LINK: Opens Kankariya Jewellers on Google Maps */}
            <Link 
                href="https://www.google.com/maps/search/?api=1&query=Kankariya+Jewellers+Nashik"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-stone-900 text-white px-8 py-3 rounded-full hover:bg-rose-600 transition-colors duration-300 font-medium"
            >
                Visit Our Store
            </Link>
         </div>
      </section>

    </div>
  )
}

// --- Components ---

function CareCard({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) {
    return (
        <motion.div 
            variants={fadeInUp}
            className="bg-white p-8 rounded-xl shadow-sm border border-stone-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
            <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center text-rose-600 mb-6">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-3">{title}</h3>
            <p className="text-sm text-stone-500 leading-relaxed">{text}</p>
        </motion.div>
    )
}

function MaterialSection({ title, desc, icon, color }: { title: string, desc: string, icon: React.ReactNode, color: string }) {
    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center p-8 rounded-2xl border ${color}`}
        >
            <div className="shrink-0 bg-white p-4 rounded-full shadow-sm">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-serif text-stone-900 mb-2">{title}</h3>
                <p className="text-stone-600 leading-relaxed">{desc}</p>
            </div>
        </motion.div>
    )
}