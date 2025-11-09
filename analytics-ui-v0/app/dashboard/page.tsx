"use client"

import { redirect } from "next/navigation"
import { useEffect } from "react"

export default function DashboardIndexPage() {
  useEffect(() => {
    redirect("/dashboard/product-dashboard")
  }, [])

  return null
}
