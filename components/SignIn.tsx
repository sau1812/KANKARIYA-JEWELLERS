"use client"; // Hook use kar rahe hain, isliye client component zaroori hai

import React from 'react'
import { SignInButton, useUser } from '@clerk/nextjs'
import { User } from 'lucide-react'

function SignIn() {
  const { isSignedIn } = useUser();

  // SAFETY CHECK: Agar user pehle se login hai, to ye button render hi mat karo.
  if (isSignedIn) {
    return null;
  }

  return (
    <SignInButton mode="modal">
        <button 
          className="p-2 relative group cursor-pointer"
          aria-label="Sign In"
        >
          <User 
            className="w-5 h-5 text-stone-600 group-hover:text-black transition-colors duration-300" 
            strokeWidth={1.5} 
          />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></span>
        </button>
    </SignInButton>
  )
}

export default SignIn