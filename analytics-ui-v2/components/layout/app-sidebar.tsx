"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SquarePen,
  PieChart,
  Database,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Plus,
  Minus,
  Maximize2,
  RefreshCw,
  Diamond,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const navigationItems = [
  { icon: SquarePen, label: "New Chat", href: "/chat", badge: null },
  { icon: PieChart, label: "Dashboard", href: "/dashboard", badge: "2" },
  { icon: Database, label: "Data Source", href: "/data-source", badge: "3" },
]

type ThreadListItem = {
  id: number
  summary: string
  createdAt?: string
}

const dashboardItems = [
  { id: "product-dashboard", name: "Product Dashboard" },
  { id: "dashboard-2", name: "Dashboard 2" },
]

const dataSourceModels = [
  { id: "customers", name: "customers" },
  { id: "order_items", name: "order_items" },
  { id: "orders", name: "orders" },
]

const dataSourceViews = [{ id: "review_score", name: "review_score" }]

interface AppSidebarProps {
  isOpen?: boolean
  onToggle?: () => void
}

export function AppSidebar({ isOpen = true, onToggle }: AppSidebarProps) {
  const pathname = usePathname()
  const [historyExpanded, setHistoryExpanded] = useState(true)
  const [modelsExpanded, setModelsExpanded] = useState(true)
  const [viewsExpanded, setViewsExpanded] = useState(true)
  const [selectedDatabase, setSelectedDatabase] = useState("ecommerce_db")
  const [threads, setThreads] = useState<ThreadListItem[]>([])
  const [loadingThreads, setLoadingThreads] = useState(false)

  const fetchThreads = async () => {
    setLoadingThreads(true)
    try {
      const res = await fetch("/api/v1/threads", { cache: "no-store" })
      if (!res.ok) {
        console.error("Failed to fetch threads:", res.status, res.statusText)
        // Keep existing threads if fetch fails
        return
      }
      const data = await res.json()
      if (Array.isArray(data?.threads)) {
        setThreads(
          data.threads.map((t: any) => ({ id: t.id, summary: t.summary, createdAt: t.createdAt }))
        )
      } else if (Array.isArray(data)) {
        // Handle case where API returns array directly
        setThreads(
          data.map((t: any) => ({ id: t.id, summary: t.summary, createdAt: t.createdAt }))
        )
      }
    } catch (error) {
      console.error("Error fetching threads:", error)
      // Keep existing threads on error
    } finally {
      setLoadingThreads(false)
    }
  }

  useEffect(() => {
    fetchThreads()
  }, [])

  // refresh the list on route change (e.g., after creating a new thread)
  useEffect(() => {
    if (pathname.startsWith("/chat")) {
      fetchThreads()
    }
  }, [pathname])

  return (
    <aside
      className={cn(
        "flex h-screen w-64 flex-col border-r border-border bg-sidebar transition-transform duration-300 shrink-0",
        !isOpen && "-translate-x-full md:translate-x-0",
      )}
    >
      {/* Logo Header */}
      <div className="flex items-center gap-2 border-b border-sidebar-border p-4">
        <div className="relative h-8 w-8">
          <Image src="/logo.png" alt="NQR Analytics" width={32} height={32} className="rounded" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[#ff5001]">NQR Analytics</span>
          <span className="text-xs text-black">v1.0.0</span>
        </div>
        <Button variant="ghost" size="icon" className="ml-auto h-6 w-6" onClick={onToggle}>
          <ChevronsUpDown className="h-4 w-4 text-black" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-sm font-normal text-black",
                    isActive && "bg-[#ff5001] text-white hover:bg-[#ff5001]/90 hover:text-white",
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-black")} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        isActive ? "bg-white/20 text-white" : "bg-muted text-black",
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Button>
              </Link>
            )
          })}
        </div>

        {/* Data Source specific sections */}
        {pathname.startsWith("/data-source") && (
          <div className="mt-6 space-y-4">
            {/* Database Selector */}
            <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
              <SelectTrigger className="w-full text-black">
                <SelectValue placeholder="Select database" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ecommerce_db">ecommerce_db</SelectItem>
                <SelectItem value="analytics_db">analytics_db</SelectItem>
                <SelectItem value="users_db">users_db</SelectItem>
              </SelectContent>
            </Select>

            {/* Models Section */}
            <div>
              <button
                onClick={() => setModelsExpanded(!modelsExpanded)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-black hover:bg-accent rounded-md"
              >
                {modelsExpanded ? (
                  <ChevronDown className="h-4 w-4 text-black" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-black" />
                )}
                <span>Models</span>
              </button>

              {modelsExpanded && (
                <div className="mt-1 space-y-0.5 pl-2">
                  {dataSourceModels.map((model) => (
                    <button
                      key={model.id}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-black hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Diamond className="h-3 w-3 text-black" />
                        <span>{model.name}</span>
                      </div>
                      <ChevronRight className="h-3 w-3 text-black" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Views Section */}
            <div>
              <button
                onClick={() => setViewsExpanded(!viewsExpanded)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-black hover:bg-accent rounded-md"
              >
                {viewsExpanded ? (
                  <ChevronDown className="h-4 w-4 text-black" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-black" />
                )}
                <span>Views</span>
              </button>

              {viewsExpanded && (
                <div className="mt-1 space-y-0.5 pl-2">
                  {dataSourceViews.map((view) => (
                    <button
                      key={view.id}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-black hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Eye className="h-3 w-3 text-black" />
                        <span>{view.name}</span>
                      </div>
                      <ChevronRight className="h-3 w-3 text-black" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {pathname.startsWith("/dashboard") && (
          <div className="mt-6">
            <Link href="/dashboard/new">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-sm font-normal text-black hover:bg-accent"
              >
                <Plus className="h-4 w-4 text-black" />
                <span>New Dashboard</span>
              </Button>
            </Link>

            <div className="mt-2 space-y-0.5">
              {dashboardItems.map((dashboard) => {
                const isActive = pathname.includes(dashboard.id)
                return (
                  <Link key={dashboard.id} href={`/dashboard/${dashboard.id}`}>
                    <button
                      className={cn(
                        "w-full rounded-md px-3 py-2 text-left text-sm text-black hover:bg-accent transition-colors",
                        isActive && "bg-accent",
                      )}
                    >
                      {dashboard.name}
                    </button>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* History Section */}
        {pathname.startsWith("/chat") && (
          <div className="mt-6">
            <button
              onClick={() => setHistoryExpanded(!historyExpanded)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-black hover:bg-accent rounded-md"
            >
              {historyExpanded ? (
                <ChevronDown className="h-4 w-4 text-black" />
              ) : (
                <ChevronRight className="h-4 w-4 text-black" />
              )}
              <span>History</span>
            </button>

            {historyExpanded && (
              <div className="mt-1 space-y-0.5 pl-2">
                {loadingThreads && (
                  <div className="px-3 py-2 text-xs text-black">Loading...</div>
                )}
                {!loadingThreads && threads.length === 0 && (
                  <div className="px-3 py-2 text-xs text-black">No threads yet</div>
                )}
                {!loadingThreads && threads.map((t) => {
                  const isActive = pathname === `/chat/${t.id}`
                  return (
                    <Link key={t.id} href={`/chat/${t.id}`}>
                      <button
                        className={cn(
                          "w-full rounded-md px-3 py-2 text-left text-sm text-black hover:bg-accent transition-colors truncate",
                          isActive && "bg-accent",
                        )}
                        title={t.summary}
                      >
                        {t.summary}
                      </button>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Bottom toolbar for data source page */}
      {pathname.startsWith("/data-source") && (
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center justify-around">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="h-4 w-4 text-black" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Minus className="h-4 w-4 text-black" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Maximize2 className="h-4 w-4 text-black" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <RefreshCw className="h-4 w-4 text-black" />
            </Button>
          </div>
        </div>
      )}

      {/* User Profile Footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder.svg?height=36&width=36" />
            <AvatarFallback className="bg-[#ff5001] text-white">SH</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-black">shiro</p>
            <p className="text-xs text-black truncate">shiro@example.com</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle}>
            <ChevronsUpDown className="h-4 w-4 text-black" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
