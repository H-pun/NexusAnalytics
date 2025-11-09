"use client"

import { PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarToggleProps {
  onClick: () => void
}

export function SidebarToggle({ onClick }: SidebarToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="fixed left-[272px] top-4 z-50 h-10 w-10 rounded-lg hover:bg-gray-100 active:bg-[#ff5001] active:text-white transition-colors"
      aria-label="Toggle sidebar"
    >
      <PanelLeft className="h-6 w-6 text-black" />
    </Button>
  )
}
