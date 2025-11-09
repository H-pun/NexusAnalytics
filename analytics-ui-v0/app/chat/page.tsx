"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarToggle } from "@/components/layout/sidebar-toggle"
import { ChatInput } from "@/components/chat/chat-input"
import { SuggestionCard } from "@/components/chat/suggestion-card"

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <SidebarToggle onClick={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-semibold text-black text-balance">What data would you like to see?</h1>
          </div>

          {/* Chat Input */}
          <ChatInput />

          {/* Suggestion Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <SuggestionCard category="Chart" description="Make a table block of total Orders." />
            <SuggestionCard category="Analysis" description="Which are the top 3 cities with the highest orders?" />
            <SuggestionCard category="SQL" description="Make an Orders by date Line Chart" />
          </div>
        </div>
      </main>
    </div>
  )
}
