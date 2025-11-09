"use client"

import type React from "react"

import { useState } from "react"
import { Paperclip, SendHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ChatInputProps {
  onSend?: (message: string) => void
  placeholder?: string
}

export function ChatInput({ onSend, placeholder = "Ask anything" }: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (message.trim()) {
      onSend?.(message)
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative rounded-lg border border-gray-200 bg-white shadow-sm">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[120px] max-h-32 w-full resize-none border-0 bg-transparent px-4 pt-4 pb-20 text-base text-foreground placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
          rows={1}
        />

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" type="button">
              <Paperclip className="h-5 w-5 text-black" />
            </Button>

            <Button variant="ghost" size="sm" className="h-9 shrink-0 gap-2 text-sm text-black" type="button">
              <Database className="h-4 w-4" />
              <span className="font-medium">Source</span>
            </Button>
          </div>

          <Button
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl bg-[#ff5001] hover:bg-[#ff5001]/90"
            onClick={handleSend}
            type="button"
          >
            <SendHorizontal className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function Database({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  )
}
