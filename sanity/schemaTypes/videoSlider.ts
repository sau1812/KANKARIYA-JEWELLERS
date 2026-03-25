export default {
  name: 'imageSlider', // Name update kiya (query me yehi use hoga)
  title: 'Premium Image Slider',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Slider Title',
      type: 'string',
    },
    {
      name: 'images', // Field name 'videos' se 'images' kar diya
      title: 'Slider Images',
      type: 'array',
      of: [
        {
          type: 'image', // Type 'file' se 'image' me change kiya
          options: {
            hotspot: true // Ye UI me cropping/focus point set karne deta hai
          },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text (SEO ke liye zaroori)',
              type: 'string',
              description: 'Image me kya hai wo describe karein (e.g., "Diamond Necklace by Kankariya Jewellers")'
            }
          ]
        }
      ]
    }
  ]
}