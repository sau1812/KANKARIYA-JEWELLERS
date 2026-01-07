import React from 'react'
import { Search } from 'lucide-react'

function SearchBar() {
  return (
    <div className='hidden md:flex items-center border-b border-stone-300 focus-within:border-black transition-colors duration-300 pb-1'>
      <input 
        type="text" 
        placeholder="Search..." 
        // 👇 Ye line add karein: Isse hydration error chala jayega
        suppressHydrationWarning
        className="
          w-24 lg:w-32 outline-none bg-transparent 
          text-xs uppercase tracking-wide placeholder:text-stone-400 text-stone-800
          transition-all duration-300 focus:w-40 lg:focus:w-48
        "
      />
      <Search className="w-4 h-4 text-stone-500" strokeWidth={1.5} />
    </div>
  )
}

export default SearchBar