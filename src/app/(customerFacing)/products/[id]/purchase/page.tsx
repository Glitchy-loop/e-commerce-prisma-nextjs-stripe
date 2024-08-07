import CheckoutForm from "@/components/CheckoutForm"
import db from "@/db/db"
import { notFound } from "next/navigation"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

const PurchasePage = async ({ params: { id } }: { params: { id: string } }) => {
  const product = await db.product.findUnique({ where: { id } })

  if (product == null) return notFound()

  const paymentIntent = stripe.paymentIntents.create({
    amount: product.priceInCents,
    currency: "EUR",
    metadata: { productId: product.id },
  })

  if ((await paymentIntent).client_secret == null)
    throw new Error("Payment intent creation failed")

  return (
    <CheckoutForm
      product={product}
      clientSecret={(await paymentIntent)?.client_secret || ""}
    />
  )
}

export default PurchasePage
