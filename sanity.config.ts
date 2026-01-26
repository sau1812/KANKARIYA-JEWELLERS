'use client'

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schema} from './sanity/schemaTypes'
import {structure} from './sanity/structure'

export default defineConfig({
  basePath: '/studio',
  
  // 🔴 Screenshot se li gayi sahi values yahan direct likh di hain
  projectId: 'v49tww2o', 
  dataset: 'production', 

  schema,
  plugins: [
    structureTool({structure}),
    visionTool({defaultApiVersion: '2024-01-01'}),
  ],
})