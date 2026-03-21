import { type SchemaTypeDefinition } from 'sanity'
import product from './productType'
import order from './orderType'
import hero from './hero'
import { addressType } from './addressType' // Ye Named Export tha (sahi hai)
import silverRate from './silverRate'
import  review  from './review'

// 👇 CHANGE HERE: Remove { } because it is a default export
import coupon from './coupon' 
import subscribers from './subscribers'
import videoSlider from './videoSlider'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [product, order, hero, addressType, coupon, silverRate, review, subscribers, videoSlider],
}