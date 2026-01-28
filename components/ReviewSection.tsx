"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle2 } from 'lucide-react';

interface ReviewSectionProps {
  productId: string;
}

const ReviewSection = ({ productId }: ReviewSectionProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasOrdered, setHasOrdered] = useState(false);

  useEffect(() => {
    // Check if user has already ordered (assuming you store name in localStorage after checkout)
    const savedName = localStorage.getItem('customerName');
    if (savedName) {
      setName(savedName);
      setHasOrdered(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert("Please select a rating!");

    const response = await fetch('/api/createReview', {
      method: 'POST',
      body: JSON.stringify({ productId, name, rating, comment }),
    });

    if (response.ok) {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-16 px-6 text-center border border-rose-100 bg-rose-50/30 rounded-3xl my-10 shadow-sm max-w-4xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
          className="w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-200"
        >
          <CheckCircle2 size={40} className="text-white" />
        </motion.div>

        <motion.h3 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-serif font-bold text-stone-900 mb-2"
        >
          Review Submitted!
        </motion.h3>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-stone-600 max-w-sm mx-auto italic"
        >
          Thank you. Your feedback helps us maintain the heritage of Kankariya Jewellers. 
          It will be visible once approved by our team.
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={() => setIsSubmitted(false)}
          className="mt-8 text-rose-600 font-bold text-sm uppercase tracking-widest hover:underline"
        >
          Write another review
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="mt-16 border-t border-stone-100 pt-10 max-w-4xl mx-auto px-4">
      <h2 className="text-3xl font-serif mb-8 text-stone-900">Customer Reviews</h2>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 shadow-sm border border-stone-100 rounded-2xl">
        <h3 className="text-lg font-medium text-stone-800">Share Your Experience</h3>
        
        {/* Name Logic */}
        {!hasOrdered ? (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-stone-200 p-3 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all outline-none"
              placeholder="Enter your full name"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100">
            <span className="text-sm italic">Posting as:</span>
            <span className="font-bold text-stone-900">{name}</span>
          </div>
        )}

        {/* Star Rating with Jiggle Animation */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Your Rating</label>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star 
                  size={32} 
                  className={`transition-colors duration-200 ${
                    (hoverRating || rating) >= star ? 'text-yellow-500 fill-yellow-500' : 'text-stone-300'
                  }`} 
                />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Your Thoughts</label>
          <textarea
            required
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-1 block w-full border border-stone-200 p-3 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all outline-none"
            placeholder="Tell others about the quality, finish, and feel of this piece..."
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full md:w-auto bg-stone-900 text-white px-10 py-4 uppercase tracking-widest text-xs font-bold hover:bg-stone-800 transition-all shadow-xl rounded-xl"
        >
          Submit Review
        </motion.button>
      </form>
    </div>
  );
};

export default ReviewSection;