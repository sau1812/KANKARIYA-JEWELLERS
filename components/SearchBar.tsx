"use client"
import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form 
      onSubmit={handleSearch}
      className='hidden md:flex items-center border-b border-stone-300 focus-within:border-black transition-colors duration-300 pb-1'
    >
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..." 
        suppressHydrationWarning // ✅ Input ke liye sahi hai
        className="
          w-24 lg:w-32 outline-none bg-transparent 
          text-xs uppercase tracking-wide placeholder:text-stone-400 text-stone-800
          transition-all duration-300 focus:w-40 lg:focus:w-48
        "
      />
      
      <button 
        type="submit"
        suppressHydrationWarning // 👈 YE ADD KIYA (Button fix ke liye)
      >
        <Search className="w-4 h-4 text-stone-500 hover:text-stone-800 transition-colors" strokeWidth={1.5} />
      </button>
    </form>
  )
}

export default SearchBar