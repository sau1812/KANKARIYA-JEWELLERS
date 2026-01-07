import { defineField, defineType } from "sanity";
import { TagIcon } from "@sanity/icons";

export default defineType({
  name: "coupon",
  title: "Coupons",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "code",
      title: "Coupon Code",
      type: "string",
      description: "e.g., SAVE20 (Must be unique)",
      validation: (Rule) => Rule.required().uppercase(),
    }),
    defineField({
      name: "discountPercentage",
      title: "Discount Percentage",
      type: "number",
      description: "e.g., 10 for 10% off",
      validation: (Rule) => Rule.required().min(1).max(100),
    }),
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      initialValue: true,
      description: "Toggle this to enable/disable coupon without deleting it",
    }),
  ],
});