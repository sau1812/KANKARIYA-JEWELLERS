"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Minus, MessageCircle, Phone, Mail } from 'lucide-react'

// --- FAQ DATA ---
const faqData = [
  {
    id: 1,
    category: "Product & Quality",
    question: "Is your jewelry BIS Hallmarked?",
    answer: "Yes, absolutely. Every piece of gold jewelry at Kankariya Jewellers is BIS Hallmarked, guaranteeing the purity of the metal (22K or 18K). We provide the original certificate with every purchase."
  },
  {
    id: 2,
    category: "Product & Quality",
    question: "Do you offer customization?",
    answer: "Yes! We specialize in bespoke jewelry. If you have a specific design in mind or want to modify an existing piece (e.g., changing the stone color or gold purity), please contact our support team."
  },
  {
    id: 3,
    category: "Shipping & Orders",
    question: "Is shipping insured?",
    answer: "Yes. We understand the value of your purchase. Every package is fully insured during transit. The insurance is valid until you (or an authorized person) sign for the delivery."
  },
  {
    id: 4,
    category: "Shipping & Orders",
    question: "How can I track my order?",
    answer: "Once your order is dispatched, you will receive a tracking link via SMS and Email. You can also track your order status by logging into your account on our website."
  },
  {
    id: 5,
    category: "Payments",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards (Visa, Mastercard, Amex), UPI, Net Banking, and secure wallets via Razorpay. We do not offer Cash on Delivery (COD) for jewelry items above ₹10,000 due to security reasons."
  },
  {
    id: 6,
    category: "Returns",
    question: "What is your return policy?",
    answer: "We offer a 15-day return policy for unworn items with the security tag intact. Customized items and gold coins are not eligible for returns unless there is a manufacturing defect."
  }
]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Filter FAQs based on search
  const filteredFaqs = faqData.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <div className="bg-[#FAFAF9] min-h-screen">
      
      {/* --- Hero Section --- */}
      <section className="bg-stone-900 text-white py-20 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-serif mb-6">Frequently Asked Questions</h1>
          <p className="text-stone-400 text-lg mb-8">
            Have a question? We're here to help.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-lg mx-auto">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
             <input 
                type="text"
                placeholder="Search for answers (e.g. 'Shipping', 'Hallmark')"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-rose-500 transition-colors"
             />
          </div>
        </div>
      </section>

      {/* --- FAQ List --- */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          
          {filteredFaqs.length === 0 ? (
             <div className="text-center text-stone-500 py-10">
                <p>No results found for "{searchTerm}".</p>
             </div>
          ) : (
             <div className="space-y-4">
                {filteredFaqs.map((item) => (
                  <AccordionItem 
                    key={item.id}
                    question={item.question}
                    answer={item.answer}
                    category={item.category}
                    isOpen={activeIndex === item.id}
                    onClick={() => toggleAccordion(item.id)}
                  />
                ))}
             </div>
          )}

        </div>
      </section>

      {/* --- Contact CTA --- */}
      <section className="py-16 px-4 bg-white border-t border-stone-100">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600">
             <MessageCircle size={32} />
          </div>
          <h2 className="text-3xl font-serif text-stone-900 mb-4">Still have questions?</h2>
          <p className="text-stone-500 mb-8">Can't find the answer you're looking for? Please chat to our friendly team.</p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4">
             <a href="mailto:kankariya29777@gmail.com" className="flex items-center justify-center gap-2 px-6 py-3 border border-stone-200 rounded-lg hover:border-rose-500 hover:text-rose-600 transition-all text-stone-700 font-medium">
                <Mail size={18} /> Email Support
             </a>
             <a href="tel:+91 9209833606" className="flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-all font-medium">
                <Phone size={18} /> +91 9209833606
             </a>
          </div>
        </div>
      </section>

    </div>
  )
}

// --- Accordion Component ---
function AccordionItem({ question, answer, category, isOpen, onClick }: { question: string, answer: string, category: string, isOpen: boolean, onClick: () => void }) {
  return (
    <motion.div 
      initial={false}
      className={`border rounded-xl overflow-hidden bg-white transition-all duration-300 ${isOpen ? 'border-rose-200 shadow-md' : 'border-stone-200 hover:border-stone-300'}`}
    >
      <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
      >
        <div>
           <span className="text-[10px] font-bold tracking-wider uppercase text-rose-600 mb-1 block">{category}</span>
           <span className={`text-lg font-medium ${isOpen ? 'text-stone-900' : 'text-stone-700'}`}>{question}</span>
        </div>
        <div className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-rose-100 text-rose-600' : 'bg-stone-100 text-stone-400'}`}>
           {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-6 text-stone-500 leading-relaxed text-sm md:text-base border-t border-stone-50 pt-4">
               {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}