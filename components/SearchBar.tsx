"use client" // 👈 Zaroori hai kyunki hum hooks use kar rahe hain
import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation' // 👈 Next.js 13+ router

function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault() // Page refresh hone se rokega
    
    // Agar query khali nahi hai, tabhi search karo
    if (query.trim()) {
      // User ko search page par bhej do query ke sath
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    // <div> ki jagah <form> use kiya taaki 'Enter' key chal jaye
    <form 
      onSubmit={handleSearch}
      className='hidden md:flex items-center border-b border-stone-300 focus-within:border-black transition-colors duration-300 pb-1'
    >
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..." 
        suppressHydrationWarning
        className="
          w-24 lg:w-32 outline-none bg-transparent 
          text-xs uppercase tracking-wide placeholder:text-stone-400 text-stone-800
          transition-all duration-300 focus:w-40 lg:focus:w-48
        "
      />
      {/* Icon par click karne se bhi form submit hoga */}
      <button type="submit">
        <Search className="w-4 h-4 text-stone-500 hover:text-stone-800 transition-colors" strokeWidth={1.5} />
      </button>
    </form>
  )
}

export default SearchBar