import { HomeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const addressType = defineType({
  name: "address",
  title: "Addresses",
  type: "document",
  icon: HomeIcon,
  fields: [
    
    
    defineField({
      name: "userId",
      title: "User ID",
      type: "string",
      hidden: true, // CMS mein dikhane ki zaroorat nahi
}),

    defineField({
      name: "name", // changed from "Name" to "name" (consistency)
      title: "Address Label", // changed title to be clearer
      type: "string",
      description: "A friendly name for the address (e.g., Home, Office)",
      validation: (Rule) => Rule.required().max(50),
    }),
    defineField({
      name: "email",
      title: "Email Address",
      type: "email",
    }),
    // Added Phone Number (usually needed for shipping)
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
    }),
    defineField({
      name: "streetAddress", // changed from "address" to be more specific
      title: "Street Address",
      type: "string",
      description: "The street address including house/building number",
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: "city",
      title: "City",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "state",
      title: "State/Province",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "pinCode", // changed from "pin code" to "pinCode" (easier for GROQ)
      title: "Pin Code",
      type: "string",
      validation: (Rule) =>
        Rule.required()
          .regex(/^[1-9][0-9]{5}$/, { name: "pin code", invert: false })
          .error("Enter a valid 6-digit pin code."),
    }),
    defineField({
      name: "isDefault", // changed from "default" (default is a reserved keyword in some languages)
      title: "Set as Default Address",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "streetAddress",
      city: "city",
      state: "state",
      isDefault: "isDefault",
    },
    prepare({ title, subtitle, city, state, isDefault }) {
      return {
        title: `${title} ${isDefault ? "(Default)" : ""}`,
        subtitle: `${subtitle}, ${city}, ${state}`,
        // media: HomeIcon (Optional: adds icon to the list view)
      };
    },
  },
});