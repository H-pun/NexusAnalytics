"use client"

import { useState } from "react"
import { PieChartIcon, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarToggle } from "@/components/layout/sidebar-toggle"
import { ProductDistributionChart } from "@/components/dashboard/product-distribution-chart"
import { ProductsTotalChart } from "@/components/dashboard/products-total-chart"

// Sample data for Product Distribution donut chart
const distributionData = [
  { name: "Category A", value: 500, color: "#3b82f6" }, // Blue
  { name: "Category B", value: 400, color: "#f59e0b" }, // Orange
  { name: "Category C", value: 700, color: "#ef4444" }, // Red
  { name: "Category D", value: 300, color: "#84cc16" }, // Green
  { name: "Category E", value: 100, color: "#9ca3af" }, // Gray
]

// Sample data for Products Total 2025 bar chart
const _monthlyData = [
  { month: "Jan", value: 5 },
  { month: "Feb", value: 8 },
  { month: "Mar", value: 12 },
  { month: "Apr", value: 18 },
  { month: "May", value: 25 },
  { month: "Jun", value: 35 },
  { month: "Jul", value: 48 },
  { month: "Aug", value: 52 },
  { month: "Sep", value: 58 },
  { month: "Oct", value: 68 },
  { month: "Nov", value: 85 },
  { month: "Dec", value: 100 },
]

const _totalData = distributionData.reduce((sum, item) => sum + item.value, 0)

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <SidebarToggle onClick={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 overflow-auto bg-background p-8">
        <div className="mx-auto max-w-7xl">
          {/* Page Title */}
          <h1 className="mb-8 text-3xl font-semibold text-black">Product Dashboard</h1>

          {/* Dashboard Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Product Distribution Card */}
            <Card className="border border-border bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-medium text-black">
                  <PieChartIcon className="h-5 w-5 text-black" />
                  Product Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductDistributionChart />
              </CardContent>
            </Card>

            {/* Products Total 2025 Card */}
            <Card className="border border-border bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-medium text-black">
                  <BarChart3 className="h-5 w-5 text-black" />
                  Products Total 2025
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductsTotalChart />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
