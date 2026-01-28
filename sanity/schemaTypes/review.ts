import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'review',
  title: 'Customer Reviews',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Customer Name',
      type: 'string',
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      description: 'Rating 1 se 5 ke beech',
      validation: (rule) => rule.required().min(1).max(5),
    }),
    defineField({
      name: 'comment',
      title: 'Review Comment',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'product',
      title: 'Product',
      type: 'reference',
      to: [{ type: 'product' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'approved',
      title: 'Approved',
      type: 'boolean',
      description: 'Sirf approved reviews hi live dikhenge',
      initialValue: false,
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      rating: 'rating',
    },
    prepare(selection) {
      const { title, rating } = selection
      return {
        title: title || 'No Name',
        subtitle: `${rating || 0} Stars`,
      }
    },
  },
})