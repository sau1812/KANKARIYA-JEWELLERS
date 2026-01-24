// schemas/silverRate.js
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'silverRate',
  title: '⚙️ Daily Silver Rate', // Emoji lagaya taaki alag dikhe
  type: 'document',
  fields: [
    defineField({
      name: 'ratePerGram',
      title: 'Today\'s Silver Rate (per gram) ₹',
      type: 'number',
      description: 'Yahan rate change karne se puri website ke prices update ho jayenge.',
      validation: (Rule) => Rule.required().min(0),
    }),
  ],
  preview: {
    select: {
      rate: 'ratePerGram',
    },
    prepare(selection) {
      return {
        title: `Current Rate: ₹${selection.rate}/gram`,
      };
    },
  },
})