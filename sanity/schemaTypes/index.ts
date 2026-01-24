import { type SchemaTypeDefinition } from 'sanity'
import product from './productType'
import order from './orderType'
import hero from './hero'
import { addressType } from './addressType' // Ye Named Export tha (sahi hai)
import silverRate from './silverRate'

// 👇 CHANGE HERE: Remove { } because it is a default export
import coupon from './coupon' 

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [product, order, hero, addressType, coupon, silverRate],
}