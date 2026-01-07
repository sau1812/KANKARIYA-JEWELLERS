import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { client } from '@/sanity/lib/client'
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react'
import Image from 'next/image'
import imageUrlBuilder from '@sanity/image-url'

const builder = imageUrlBuilder(client)
function urlFor(source: any) {
  try {
    return builder.image(source)
  } catch (error) {
    return null
  }
}

async function getMyOrders(userId: string) {
  const query = `*[_type == "order" && clerkUserId == $userId] | order(orderDate desc) {
    _id,
    orderNumber,
    orderDate,
    totalPrice,
    status,
    amountDiscount,
    products[]{
      product->{
        title,
        image
      },
      quantity,
      priceAtPurchase
    }
  }`;

  const orders = await client.fetch(query, { userId });
  return orders;
}

export default async function MyOrdersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const orders = await getMyOrders(userId);

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-serif text-stone-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-stone-200">
            <Package size={48} className="mx-auto text-stone-300 mb-4" />
            <h2 className="text-xl font-medium text-stone-700">No orders found</h2>
            <p className="text-stone-500 mb-6">Looks like you haven't bought anything yet.</p>
            <Link href="/shop" className="bg-stone-900 text-white px-6 py-2 rounded-full text-sm font-bold">
               Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                
                {/* Order Header */}
                <div className="bg-stone-100/50 p-4 border-b border-stone-100 flex flex-col sm:flex-row justify-between gap-4 text-sm">
                   <div>
                      <p className="text-stone-500 text-xs uppercase tracking-wider font-bold">Order Placed</p>
                      <p className="font-medium text-stone-800">{new Date(order.orderDate).toLocaleDateString()}</p>
                   </div>
                   <div>
                      <p className="text-stone-500 text-xs uppercase tracking-wider font-bold">Total Amount</p>
                      {/* Safety Check for Total Price as well */}
                      <p className="font-medium text-stone-800">₹{(order.totalPrice ?? 0).toLocaleString()}</p>
                   </div>
                   <div>
                      <p className="text-stone-500 text-xs uppercase tracking-wider font-bold">Order #</p>
                      <p className="font-mono text-stone-600">{order.orderNumber}</p>
                   </div>
                   <div className="sm:text-right">
                       <StatusBadge status={order.status} />
                   </div>
                </div>

                {/* Order Items */}
                <div className="p-4 space-y-4">
                   {order.products?.map((item: any, idx: number) => {
                      const imgUrl = item.product?.image && item.product.image[0] 
                        ? urlFor(item.product.image[0])?.width(100).url() 
                        : null;

                      return (
                        <div key={idx} className="flex gap-4 items-center">
                           <div className="relative w-16 h-16 bg-stone-100 rounded-md overflow-hidden flex-shrink-0 border border-stone-200">
                              {imgUrl && <Image src={imgUrl} alt="Product" fill className="object-cover" />}
                           </div>
                           <div className="flex-1">
                              <h4 className="text-sm font-bold text-stone-800">{item.product?.title || "Product Removed"}</h4>
                              <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                           </div>
                           <div className="text-right">
                              {/* 👇 FIX HERE: Added fallback (item.priceAtPurchase ?? 0) */}
                              <p className="text-sm font-medium">
                                ₹{(item.priceAtPurchase ?? 0).toLocaleString()}
                              </p>
                           </div>
                        </div>
                      )
                   })}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
   const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      processing: "bg-blue-100 text-blue-700 border-blue-200",
      shipped: "bg-purple-100 text-purple-700 border-purple-200",
      delivered: "bg-green-100 text-green-700 border-green-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
   };

   const icons: Record<string, any> = {
      pending: Clock,
      processing: Package,
      shipped: TruckIcon,
      delivered: CheckCircle,
      cancelled: XCircle,
   };

   const Icon = icons[status] || Clock;
   const style = styles[status] || "bg-gray-100 text-gray-700";

   return (
     <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${style} w-fit`}>
        <Icon size={12} /> {status?.charAt(0).toUpperCase() + status?.slice(1)}
     </span>
   )
}

const TruckIcon = ({size}: {size:number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
);