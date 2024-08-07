"use server"

import db from "@/db/db"

export default async function userOrderExists(
  email: string,
  productId: string
) {
  return (
    (await db.order.findFirst({
      where: {
        user: { email: email },
        product: { id: productId },
      },
      select: { id: true },
    })) != null
  )
}
