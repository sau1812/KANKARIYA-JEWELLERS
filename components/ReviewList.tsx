"use client";

import React, { useEffect, useState } from 'react';
import { client } from '@/sanity/lib/client';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const ReviewList = ({ productId }: { productId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const query = `*[_type == "review" && product._ref == $productId && approved == true] | order(createdAt desc)`;
        const data = await client.fetch(query, { productId });
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  if (loading) return <div className="text-center py-10 italic text-stone-400">Loading reviews...</div>;
  if (reviews.length === 0) return null;

  // Pehle sirf 2 reviews dikhayenge, baaki "See All" dabane par
  const displayedReviews = showAll ? reviews : reviews.slice(0, 2);

  return (
    <div className="mt-16 max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-end mb-8 border-b border-stone-100 pb-4">
        <div>
          <h2 className="text-3xl font-serif text-stone-900">Customer Stories</h2>
          <p className="text-stone-500 text-sm mt-1">Real feedback from our silver community</p>
        </div>
        <div className="text-stone-400 text-sm font-medium">
          {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {displayedReviews.map((review, index) => (
            <motion.div 
              key={review._id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="p-6 bg-white rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between hover:border-rose-200 transition-colors"
            >
              <div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={`${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-stone-200'}`} 
                    />
                  ))}
                </div>
                <p className="text-stone-700 leading-relaxed mb-4 text-sm italic">"{review.comment}"</p>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-stone-50">
                <span className="font-bold text-stone-900 text-xs tracking-wide uppercase">{review.name}</span>
                <span className="text-stone-400 text-[10px]">
                  {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* See All / See Less Button */}
      {reviews.length > 2 && (
        <div className="mt-10 text-center">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-8 py-3 border border-stone-900 text-stone-900 text-xs font-bold uppercase tracking-[0.2em] hover:bg-stone-900 hover:text-white transition-all rounded-full"
          >
            {showAll ? (
              <>Show Less <ChevronUp size={16} /></>
            ) : (
              <>See All Reviews ({reviews.length - 2} More) <ChevronDown size={16} /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;