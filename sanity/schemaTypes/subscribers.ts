export default {
  name: 'marketingNumber',
  title: 'Marketing Subscribers',
  type: 'document',
  fields: [
    {
      name: 'phoneNumber',
      title: 'Phone Number',
      type: 'string',
      validation: (Rule: any) => Rule.required().min(10).max(10),
    },
   
  ],
};