"use server"

import db from "@/db/db"
import { Resend } from "resend"
import { z } from "zod"

const emailSchema = z.string().email()
const resend = new Resend(process.env.SENDGRID_API_KEY as string)

export async function emailOrderHistory(
  prevState: unknown,
  formData: FormData
): Promise<{ message?: string; error?: string }> {
  const result = emailSchema.safeParse(formData.get("email") as string)

  if (result.success === false) {
    return { error: "Invalid email address." }
  }

  const user = await db.user.findUnique({
    where: {
      email: result.data,
    },
    select: {
      email: true,
      orders: {
        select: {
          pricePaidInCents: true,
          id: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              imagePath: true,
              description: true,
            },
          },
        },
      },
    },
  })

  if (user == null) {
    return { error: "No user found with that email address." }
  }

  const orders = user.orders.map((order) => {
    return {
      ...order,
      downloadVerificationId: db.downloadVerification.create({
        data: {
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
          productId: order.product.id,
        },
      }),
    }
  })

  const data = await resend.emails.send({
    from: `Support <${process.env.SENDER_EMAIL}>`,
    to: user.email,
    subject: "Your Order History",
    text: "Your orders history goes here...",
  })

  if (data.error) {
    return { error: "Failed to send email." }
  }

  return { message: "Check your email to view your order history." }
}
