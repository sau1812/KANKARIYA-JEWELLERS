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

    // --- CALCULATION FIELDS (Auto Logic) ---
    defineField({
      name: 'weight',
      title: 'Silver Weight (grams)',
      type: 'number',
      description: 'Product ka wajan dalein.',
      validation: (Rule) => Rule.required().min(0),
    }),
    
    defineField({
      name: 'makingCharges',
      title: 'Making Charges (%)',
      type: 'number',
      description: 'Kitne percent making charge lagana hai? (e.g., Type 15 for 15%)',
      validation: (Rule) => Rule.required().min(0),
      initialValue: 10, // Default 10%
    }),

    // --- INVENTORY ---
    defineField({
      name: 'stockQuantity',
      title: 'Stock Quantity',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
      initialValue: 1, 
    }),

    // schemas/product.js ke fields array ke andar add karein:

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
  ],

  // --- PREVIEW ---
  preview: {
    select: {
      title: 'title',
      media: 'image',
      weight: 'weight',
      making: 'makingCharges'
    },
    prepare(selection) {
      const { title, media, weight, making } = selection;
      return {
        title: title,
        media: media && media[0],
        // Preview me ab weight aur percentage dikhega
        subtitle: `${weight}g | Making: ${making}%`
      };
    },
  },
})