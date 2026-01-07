import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // ⚠️ False rakhein kyunki hum realtime data write kar rahe hain
  token: process.env.SANITY_API_TOKEN, // 👈 Ye line sabse IMPORTANT hai
})