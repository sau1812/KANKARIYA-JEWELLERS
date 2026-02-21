import { BasketIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'order',
  title: 'Orders',
  type: 'document',
  icon: BasketIcon,
  fields: [
    // --- 1. ORDER & CUSTOMER INFO ---
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    
    defineField({
      name: "invoice",
      title: "Invoice Details",
      type: "object",
      fields: [
        { name: "id", title: "Invoice ID", type: "string" },
        { name: "invoiceNumber", title: "Invoice Number", type: "string" },
        { name: "hosted_invoice_url", title: "Invoice URL", type: "url" },
      ],
    }),

    defineField({
      name: "clerkUserId",
      title: "Clerk User ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'customerName',
      title: 'Customer Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email Address",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    }),

    // --- 2. PAYMENT INFO ---
    // 👇 Naye Razorpay Fields yahan add kiye hain aur Stripe hata diya hai
    defineField({
      name: "razorpayOrderId",
      title: "Razorpay Order ID",
      type: "string",
    }),
    defineField({
      name: "razorpayPaymentId",
      title: "Razorpay Payment ID",
      type: "string",
    }),
    defineField({
      name: "totalPrice",
      title: "Total Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "INR",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "amountDiscount",
      title: "Amount Discount",
      type: "number",
      initialValue: 0,
    }),

    // --- 3. PRODUCTS BOUGHT (Nested Extras Added Here) ---
    defineField({
      name: "products",
      title: "Products",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "product",
              title: "Product Bought",
              type: "reference",
              to: [{ type: "product" }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "quantity",
              title: "Quantity Purchased",
              type: "number",
              initialValue: 1,
            }),
            defineField({
              name: "priceAtPurchase",
              title: "Price per unit (at purchase)",
              type: "number",
            }),
            // ✨ MOVED: Selected Extras ab har product ke andar hai
            defineField({
              name: "selectedExtras",
              title: "Selected Extras (Customizations)",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    { name: "optionName", title: "Option Name", type: "string" },
                    { name: "price", title: "Price", type: "number" },
                    { name: "description", title: "Small Note / Description", type: "string" }, // "Small Note" yahan dikhega
                  ]
                }
              ]
            }),
          ],
          preview: {
            select: {
              productTitle: "product.title",
              quantity: "quantity",
              image: "product.image",
              price: "priceAtPurchase",
            },
            prepare(select) {
              return {
                title: `${select.productTitle || 'Unknown'} (x${select.quantity})`,
                subtitle: `Unit Price: ₹${select.price || 0}`,
                media: select.image && select.image[0],
              };
            },
          },
        }),
      ],
    }),

    // --- 4. SHIPPING ADDRESS ---
    defineField({
      name: "shippingAddress",
      title: "Shipping Address",
      type: "object",
      fields: [
        { name: "name", title: "Name", type: "string" },
        { name: "address", title: "Street Address", type: "string" },
        { name: "city", title: "City", type: "string" },
        { name: "state", title: "State", type: "string" },
        { name: "pinCode", title: "Pin Code", type: "string" },
        { name: "phone", title: "Phone Number", type: "string" },
      ],
    }),

    // --- 5. STATUS & DATE ---
    defineField({
      name: "status",
      title: "Order Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Paid", value: "paid" }, // 👇 "Paid" option add kar diya
          { title: "Processing", value: "processing" },
          { title: "Shipped", value: "shipped" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "orderDate",
      title: "Order Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
  ],

  preview: {
    select: {
      name: "customerName",
      amount: "totalPrice",
      currency: "currency",
      orderId: "orderNumber",
      email: "email",
    },
    prepare(select) {
      const orderIdSnippet = select.orderId ? `${select.orderId.slice(0, 5)}...${select.orderId.slice(-5)}` : 'No ID';
      return {
        title: `${select.name} (${orderIdSnippet})`,
        subtitle: `₹${select.amount} ${select.currency} - ${select.email}`,
        media: BasketIcon,
      };
    },
  },
});