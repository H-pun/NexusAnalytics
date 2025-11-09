"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarToggle } from "@/components/layout/sidebar-toggle"
import { ChatInput } from "@/components/chat/chat-input"
import { SuggestionCard } from "@/components/chat/suggestion-card"

export default function ChatPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [creating, setCreating] = useState(false)

  const startThread = useCallback(async (summary: string) => {
    if (!summary.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/v1/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to create thread")
      const id = data?.thread?.id ?? data?.thread?.threadId ?? data?.id
      if (!id) throw new Error("No thread id returned")
      router.push(`/chat/${id}`)
    } catch (_e) {
      // TODO: surface error toast if needed
    } finally {
      setCreating(false)
    }
  }, [router])

  const handleSuggestionClick = (description: string) => {
    startThread(description)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <SidebarToggle onClick={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto px-8 py-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-semibold text-black text-balance">What data would you like to see?</h1>
          </div>

          {/* Chat Input */}
          <ChatInput onSend={startThread} disabled={creating} />

          {/* Suggestion Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <SuggestionCard 
              category="Orders" 
              description="Show me total orders by country" 
              onClick={() => handleSuggestionClick("Show me total orders by country")}
            />
            <SuggestionCard 
              category="Products" 
              description="What are the top 5 best selling products?" 
              onClick={() => handleSuggestionClick("What are the top 5 best selling products?")}
            />
            <SuggestionCard 
              category="Revenue" 
              description="Show me revenue by month" 
              onClick={() => handleSuggestionClick("Show me revenue by month")}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
