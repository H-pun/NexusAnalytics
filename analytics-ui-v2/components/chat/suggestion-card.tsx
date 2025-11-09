"use client"

import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface SuggestionCardProps {
  category: string
  description: string
  icon?: LucideIcon
  onClick?: () => void
}

export function SuggestionCard({ category, description, onClick }: SuggestionCardProps) {
  return (
    <Card
      className="cursor-pointer border border-gray-200 bg-white transition-all hover:border-[#ff5001] hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-black">{category}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
