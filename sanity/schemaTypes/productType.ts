// schemas/product.js
import { TrolleyIcon } from "@sanity/icons"
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  icon: TrolleyIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Product Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    // --- PRICING TYPE SELECTION ---
    defineField({
      name: 'pricingType',
      title: 'Pricing Type',
      type: 'string',
      description: 'Product ka rate kaise niklega?',
      options: {
        list: [
          { title: 'Calculated (Weight × Silver Rate + Making)', value: 'calculated' },
          { title: 'Fixed Price (Flat Rate)', value: 'fixed' }
        ],
        layout: 'radio',
        direction: 'horizontal'
      },
      initialValue: 'calculated',
      validation: (Rule) => Rule.required(),
    }),

    // --- CALCULATION FIELDS ---
    defineField({
      name: 'weight',
      title: 'Silver Weight (grams)',
      type: 'number',
      description: 'Product ka wajan dalein. (Fixed price me bhi wajan daalna zaroori hai details ke liye)',
      // 👈 YAHAN SE 'hidden' WALI LINE HATA DI HAI TAARI YE HAMESHA DIKHE
    }),
    
    defineField({
      name: 'makingCharges',
      title: 'Making Charges (%)',
      type: 'number',
      description: 'Kitne percent making charge lagana hai? (e.g., Type 15 for 15%)',
      initialValue: 10,
      // Yeh sirf calculated items me dikhega kyunki fixed me iska kaam nahi
      hidden: ({ document }) => document?.pricingType === 'fixed',
    }),

    // --- FIXED PRICE FIELD ---
    defineField({
      name: 'fixedPrice',
      title: 'Fixed Price (₹)',
      type: 'number',
      description: 'Agar product ka rate fix hai, toh yaha daalein (Bina GST ke).',
      // Yeh field tabhi dikhega jab pricingType 'fixed' hoga
      hidden: ({ document }) => document?.pricingType !== 'fixed',
    }),

    // --- INVENTORY ---
    defineField({
      name: 'stockQuantity',
      title: 'Stock Quantity',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
      initialValue: 1, 
    }),

    // --- EXTRA OPTIONS ---
    defineField({
      name: 'extraOptions',
      title: 'Extra Add-ons / Customizations',
      type: 'array',
      description: 'Add extra things like Diamonds, Engraving, or Special Polish.',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'optionName', title: 'Option Name', type: 'string', description: 'e.g., Extra Diamond' },
            { name: 'price', title: 'Additional Price (₹)', type: 'number', validation: (Rule) => Rule.min(0) },
            { name: 'description', title: 'Small Note', type: 'string' }
          ]
        }
      ]
    }),

    // --- CATEGORY & DETAILS ---
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
            { title: 'Ring', value: 'ring' },
            { title: 'Necklace', value: 'necklace' },
            { title: 'Earring', value: 'earring' },
            { title: 'Bracelet', value: 'bracelet' },
            { title: 'Bangle', value: 'bangle' },
            { title: 'Silver Coins', value: 'coins' },
            { title: 'Chains', value: 'chains' },
            { title: 'Watches', value: 'watches' },
        ]
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'gender',
      title: 'Gender',
      type: 'string',
      options: {
        list: [
          { title: 'Women', value: 'women' },
          { title: 'Men', value: 'men' },
          { title: 'Unisex', value: 'unisex' },
          { title: 'Kids', value: 'kids' },
        ],
        layout: 'radio',
        direction: 'horizontal'
      },
      initialValue: 'women',
    }),

    defineField({
      name: 'isHotDeal',
      title: 'best seller 🔥',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'image',
      title: 'Product Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
  name: 'isArchived',
  title: 'Archive Product (Hide from Shop)',
  type: 'boolean',
  initialValue: false,
}),
  ],

  // --- PREVIEW ---
  preview: {
    select: {
      title: 'title',
      media: 'image',
      weight: 'weight',
      making: 'makingCharges',
      pricingType: 'pricingType',
      fixedPrice: 'fixedPrice'
    },
    prepare(selection) {
      const { title, media, weight, making, pricingType, fixedPrice } = selection;
      
      let subtitleText = '';
      if (pricingType === 'fixed') {
        // 👈 Fixed price wale items me ab wajan bhi dikhega list view me
        subtitleText = `Fixed: ₹${fixedPrice || 0} | Weight: ${weight || 0}g`;
      } else {
        subtitleText = `${weight || 0}g | Making: ${making || 10}%`;
      }

      return {
        title: title,
        media: media && media[0],
        subtitle: subtitleText
      };
    },
  },
})