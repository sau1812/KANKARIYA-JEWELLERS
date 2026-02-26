"use client"
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
// 👇 1. Import 'Variants' type
import { motion, Variants } from 'framer-motion' 
import { Gem, Leaf, Sparkles, ArrowRight } from 'lucide-react'

// 👇 2. Add ': Variants' type here
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
}

// 👇 3. Add ': Variants' type here
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
}

export default function AboutPage() {
  return (
    <div className="bg-[#FAFAF9] min-h-screen"> 
      {/* Background color warm (stone-50) */}

      {/* --- Hero Section --- */}
      <section className="relative py-24 md:py-36 px-4 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="container mx-auto max-w-4xl text-center relative z-10"
        >
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-stone-900 mb-8 leading-tight">
            The Art of <br /> <span className="italic text-stone-600">Timeless Adornment</span>
          </h1>
          <p className="text-stone-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light">
            We believe that jewelry is more than an accessory; it is a keeper of memories, a mark of love, and a reflection of your inner light.
          </p>
        </motion.div>
      </section>

      {/* --- Visual Break / Image (Improved Frame) --- */}
      <section className="px-4 mb-24">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto max-w-5xl"
        >
          {/* Frame Effect with Shadow */}
          <div className="bg-white p-4 md:p-8 rounded-t-[10rem] rounded-b-none shadow-2xl shadow-stone-200/50">
             <div className="aspect-[16/9] md:aspect-[21/9] bg-stone-100 w-full relative overflow-hidden rounded-t-[9rem] rounded-b-none border border-stone-100">
                <Image 
                    src="/images/k.png" 
                    alt="Jewelry making process" 
                    fill 
                    className="object-contain opacity-100 p-8 hover:scale-105 transition-transform duration-700"
                /> 
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- Our Values (Icons & Cards) --- */}
      <section className="py-20 px-4 bg-white relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif text-stone-900 mb-3">Our Core Values</h2>
            <div className="w-16 h-1 bg-rose-500 mx-auto rounded-full"></div>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center"
          >
            
            {/* Value 1 */}
            <motion.div variants={fadeInUp} className="group p-6 rounded-2xl hover:bg-stone-50 transition-colors duration-300">
              <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-rose-100 transition-colors">
                 <Gem className="text-stone-600 group-hover:text-rose-600" size={28} />
              </div>
              <h3 className="text-xl font-serif text-stone-900 mb-3">Conscious Craftsmanship</h3>
              <p className="text-stone-500 leading-relaxed text-sm">
                Every piece is meticulously handcrafted by skilled artisans. We honor traditional techniques while embracing modern precision.
              </p>
            </motion.div>

            {/* Value 2 */}
            <motion.div variants={fadeInUp} className="group p-6 rounded-2xl hover:bg-stone-50 transition-colors duration-300">
              <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-100 transition-colors">
                 <Leaf className="text-stone-600 group-hover:text-green-600" size={28} />
              </div>
              <h3 className="text-xl font-serif text-stone-900 mb-3">Ethically Sourced</h3>
              <p className="text-stone-500 leading-relaxed text-sm">
                Beauty shouldn't come at a cost. We are committed to using ethically sourced stones and recycled metals whenever possible.
              </p>
            </motion.div>

            {/* Value 3 */}
            <motion.div variants={fadeInUp} className="group p-6 rounded-2xl hover:bg-stone-50 transition-colors duration-300">
              <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-100 transition-colors">
                 <Sparkles className="text-stone-600 group-hover:text-amber-600" size={28} />
              </div>
              <h3 className="text-xl font-serif text-stone-900 mb-3">Minimalist Design</h3>
              <p className="text-stone-500 leading-relaxed text-sm">
                We strip away the unnecessary to reveal the essential. Our designs are understated yet impactful, meant to be worn daily.
              </p>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* --- Founder's Note / Closing --- */}
      <section className="py-24 px-4 bg-[#FAFAF9]">
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="container mx-auto max-w-3xl text-center"
        >
          <div className="mb-6">
            <span className="text-8xl font-serif text-stone-200 leading-none">"</span>
          </div>
          <p className="text-2xl md:text-3xl font-serif text-stone-800 leading-snug mb-8 -mt-10">
            We started this brand with a simple idea: <span className="text-rose-600">luxury should be effortless.</span> We hope our pieces make you feel grounded, beautiful, and uniquely yourself.
          </p>
          <div className="text-stone-400 font-bold uppercase tracking-[0.25em] text-xs mb-12">
            — sandeep kankariya
          </div>
          
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 border-b-2 border-stone-900 text-stone-900 pb-1 font-medium hover:text-rose-600 hover:border-rose-600 transition-all hover:gap-4"
          >
            Explore the Collection <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

    </div>
  )
}