import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="bg-stone-50 min-h-screen">
      
      {/* --- Hero Section --- */}
      <section className="relative py-20 md:py-32 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-stone-900 mb-6 leading-tight">
            The Art of <br /> Timeless Adornment
          </h1>
          <p className="text-stone-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            We believe that jewelry is more than an accessory; it is a keeper of memories, a mark of love, and a reflection of your inner light.
          </p>
        </div>
      </section>

      {/* --- Visual Break / Image --- */}
      <section className="px-4 mb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="aspect-[16/9] md:aspect-[21/9] bg-stone-200 w-full relative overflow-hidden rounded-sm">
             {/* Replace with your actual image path */}
             {/* <Image 
                 src="/about-hero.jpg" 
                 alt="Jewelry making process" 
                 fill 
                 className="object-cover opacity-90"
             /> */}
             <div className="absolute inset-0 flex items-center justify-center text-stone-400 font-serif italic text-2xl">
                [ Place High-Quality Mood Image Here ]
             </div>
          </div>
        </div>
      </section>

      {/* --- Our Values (3 Columns) --- */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            
            {/* Value 1 */}
            <div className="space-y-4">
              <h3 className="text-xl font-serif text-stone-900">Conscious Craftsmanship</h3>
              <p className="text-stone-500 leading-relaxed text-sm">
                Every piece is meticulously handcrafted by skilled artisans. We honor traditional techniques while embracing modern precision, ensuring that your jewelry is built to last a lifetime.
              </p>
            </div>

            {/* Value 2 */}
            <div className="space-y-4">
              <h3 className="text-xl font-serif text-stone-900">Ethically Sourced</h3>
              <p className="text-stone-500 leading-relaxed text-sm">
                Beauty shouldn't come at a cost to the earth. We are committed to using ethically sourced stones and recycled metals whenever possible, maintaining transparency in our supply chain.
              </p>
            </div>

            {/* Value 3 */}
            <div className="space-y-4">
              <h3 className="text-xl font-serif text-stone-900">Minimalist Design</h3>
              <p className="text-stone-500 leading-relaxed text-sm">
                We strip away the unnecessary to reveal the essential. Our designs are understated yet impactful, meant to be worn daily and cherished forever, transcending fleeting trends.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- Founder's Note / Closing --- */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="mb-8">
            <span className="text-6xl font-serif text-stone-300">"</span>
          </div>
          <p className="text-xl md:text-2xl font-serif text-stone-800 leading-relaxed mb-8">
            We started this brand with a simple idea: luxury should be effortless. We hope our pieces make you feel grounded, beautiful, and uniquely yourself.
          </p>
          <div className="text-stone-500 font-medium uppercase tracking-widest text-sm mb-12">
            — The Founders
          </div>
          
          <Link 
            href="/catalog" 
            className="inline-block border-b border-stone-900 text-stone-900 pb-1 hover:text-stone-600 hover:border-stone-600 transition-colors"
          >
            Explore the Collection
          </Link>
        </div>
      </section>

    </div>
  )
}