import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'hero',
  title: 'Home Banner (Hero Section)',
  type: 'document',
  fields: [
    // --- 1. Top Title (Example: "Discover") ---
    defineField({
      name: 'headingTop',
      title: 'Heading Top Line',
      type: 'string',
      initialValue: 'Discover',
    }),

    // --- 2. Highlighted Word (Example: "Essence") - Ye Italic/Red dikhega ---
    defineField({
      name: 'headingHighlight',
      title: 'Highlighted Word (Cursive/Red)',
      type: 'string',
      initialValue: 'Essence',
    }),

    // --- 3. Bottom Title (Example: "of Pure Luxury") ---
    defineField({
      name: 'headingBottom',
      title: 'Heading Bottom Line',
      type: 'string',
      initialValue: 'of Pure Luxury',
    }),

    // --- 4. Description ---
    defineField({
      name: 'description',
      title: 'Description Text',
      type: 'text',
      initialValue: 'Experience craftsmanship like never before.',
    }),

    // --- 5. THE OFFER (Ye aapka Main Requirement hai) ---
    defineField({
      name: 'offerText',
      title: 'Offer / Discount Text',
      type: 'string',
      description: 'Example: FLAT 10% OFF on your first order',
      initialValue: 'FLAT 10% OFF on your first order',
    }),

    // --- 6. Images (Optional - Agar future mein image bhi change karni ho) ---
    defineField({
      name: 'image1',
      title: 'Back Image (Floating)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'image2',
      title: 'Front Image (Main)',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
})