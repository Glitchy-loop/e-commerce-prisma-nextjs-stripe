"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ComponentProps, ReactNode } from "react"

export function Nav({ children }: { children: ReactNode }) {
  return <nav className="border-b flex justify-center px-4">{children}</nav>
}

export function NavLink(props: Omit<ComponentProps<typeof Link>, "className">) {
  const pathName = usePathname()
  return (
    <Link
      {...props}
      className={cn("p-4", pathName === props.href && "text-muted-foreground")}
    />
  )
}
