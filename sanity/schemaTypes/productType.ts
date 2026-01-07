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

      // --- 1. SELLING PRICE (Customer ye pay karega) ---
      defineField({
        name: 'price',
        title: 'Sale Price (Final Price) ₹',
        type: 'number',
        description: 'Ye wo price hai jo customer actually pay karega.',
        validation: (Rule) => Rule.required().min(0),
      }),

      // --- 2. ORIGINAL PRICE (Ye cross hokar dikhega) ---
      defineField({
        name: 'originalPrice',
        title: 'Original Price (MRP) ₹',
        type: 'number',
        description: 'Agar discount dikhana hai to yahan bada amount dalein. (Example: 5000)',
      }),

      // --- 3. INVENTORY / STOCK (New Section) ---
      defineField({
        name: 'stockQuantity',
        title: 'Stock Quantity',
        type: 'number',
        description: 'How many items are currently available?',
        validation: (Rule) => Rule.required().min(0), // Prevents negative numbers
        initialValue: 1, 
      }),

      // --- GENDER ---
      defineField({
        name: 'gender',
        title: 'Gender / Target Audience',
        type: 'string',
        options: {
          list: [
            { title: 'Women', value: 'women' },
            { title: 'Men', value: 'men' },
            { title: 'Unisex', value: 'unisex' },
          ],
          layout: 'radio',
          direction: 'horizontal'
        },
        initialValue: 'women',
      }),

      // --- HOT DEAL ---
      defineField({
        name: 'isHotDeal',
        title: 'Hot Deal 🔥',
        type: 'boolean',
        initialValue: false,
      }),
    



      defineField({
        name: 'description',
        title: 'Description',
        type: 'text',
      }),
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
          ]
        },
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: 'image',
        title: 'Product Image',
        type: 'array',
        of: [{ type: 'image', options: { hotspot: true } }],
        
        validation: (Rule) => Rule.required(),
      }),
    ],
    preview: {
      select: {
        title: 'title',
        media: 'image',
        subtitle:'price',
      },
      prepare(selection){
        const {title, media, subtitle} = selection;
        const image = media && media[0];
        return {
          title: title,
          media: image,
          subtitle: `₹${subtitle}`
        };
      }
    },
  })