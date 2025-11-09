"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarToggle } from "@/components/layout/sidebar-toggle"
import { DatabaseDiagram } from "@/components/data-source/database-diagram"

const dataModels = [
  {
    id: "customers",
    name: "customers",
    fields: [
      { name: "Id", type: "text", icon: "link" },
      { name: "City", type: "text", icon: "database" },
      { name: "State", type: "text", icon: "database" },
    ],
    relationships: ["orders"],
    position: { x: 100, y: 100 },
  },
  {
    id: "orders",
    name: "orders",
    fields: [
      { name: "Id", type: "text", icon: "link" },
      { name: "CustomerId", type: "text", icon: "link", references: { table: "customers", field: "Id" } },
      { name: "OrderDate", type: "date", icon: "calendar" },
      { name: "Status", type: "text", icon: "database" },
    ],
    relationships: ["customers", "order_items"],
    position: { x: 500, y: 100 },
  },
  {
    id: "order_items",
    name: "order_items",
    fields: [
      { name: "Id", type: "text", icon: "link" },
      { name: "OrderId", type: "text", icon: "link", references: { table: "orders", field: "Id" } },
      { name: "ProductId", type: "text", icon: "database" },
      { name: "ItemNumber", type: "number", icon: "hash" },
      { name: "Price", type: "number", icon: "hash" },
      { name: "FreightValue", type: "number", icon: "database" },
      { name: "ShippingLimitDate", type: "date", icon: "calendar" },
    ],
    relationships: ["orders"],
    position: { x: 900, y: 100 },
  },
]

export default function DataSourcePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <SidebarToggle isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 overflow-hidden">
        <DatabaseDiagram models={dataModels} />
      </main>
    </div>
  )
}
