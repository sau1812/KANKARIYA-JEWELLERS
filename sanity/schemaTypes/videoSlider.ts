export default {
  name: 'videoSlider',
  title: 'Video Slider',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Project Title',
      type: 'string',
    },
    {
      name: 'videos',
      title: 'Slider Videos',
      type: 'array',
      of: [
        {
          type: 'file',
          options: {
            accept: 'video/*'
          },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string'
            }
          ]
        }
      ]
    }
  ]
}