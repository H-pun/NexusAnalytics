"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Database, Hash, Calendar, LinkIcon, Diamond } from "lucide-react"

interface Field {
  name: string
  type: string
  icon: string
  references?: {
    table: string
    field: string
  }
}

interface Model {
  id: string
  name: string
  fields: Field[]
  relationships: string[]
  position: { x: number; y: number }
}

interface DatabaseDiagramProps {
  models: Model[]
}

export function DatabaseDiagram({ models: initialModels }: DatabaseDiagramProps) {
  const [models, setModels] = useState(initialModels)
  const [dragging, setDragging] = useState<string | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent, modelId: string) => {
    const model = models.find((m) => m.id === modelId)
    if (!model) return

    setDragging(modelId)
    setOffset({
      x: e.clientX - model.position.x,
      y: e.clientY - model.position.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return

    setModels((prev) =>
      prev.map((model) =>
        model.id === dragging
          ? {
              ...model,
              position: {
                x: e.clientX - offset.x,
                y: e.clientY - offset.y,
              },
            }
          : model,
      ),
    )
  }

  const handleMouseUp = () => {
    setDragging(null)
  }

  const getFieldIcon = (icon: string) => {
    switch (icon) {
      case "database":
        return <Database className="h-3 w-3" />
      case "hash":
        return <Hash className="h-3 w-3" />
      case "calendar":
        return <Calendar className="h-3 w-3" />
      case "link":
        return <LinkIcon className="h-3 w-3" />
      default:
        return <Database className="h-3 w-3" />
    }
  }

  // Calculate connection lines between related tables
  const _getConnectionLine = (fromModel: Model, toModelId: string) => {
    const toModel = models.find((m) => m.id === toModelId)
    if (!toModel) return null

    const fromX = fromModel.position.x + 150 // Half of card width (300px / 2)
    const fromY = fromModel.position.y + 200 // Approximate card height
    const toX = toModel.position.x + 150
    const toY = toModel.position.y

    return { fromX, fromY, toX, toY }
  }

  const _getFieldConnections = () => {
    const connections: Array<{
      fromX: number
      fromY: number
      toX: number
      toY: number
      fromModel: string
      toModel: string
    }> = []

    const cardWidth = 300
    const headerHeight = 36
    const fieldHeight = 24
    const paddingTop = 12

    models.forEach((model) => {
      model.fields.forEach((field, fieldIndex) => {
        if (field.references) {
          const toModel = models.find((m) => m.id === field.references!.table)
          if (!toModel) return

          const toFieldIndex = toModel.fields.findIndex((f) => f.name === field.references!.field)
          if (toFieldIndex === -1) return

          // Calculate from position (foreign key field)
          const fromX = model.position.x + cardWidth
          const fromY = model.position.y + headerHeight + paddingTop + fieldIndex * fieldHeight + fieldHeight / 2

          // Calculate to position (primary key field)
          const toX = toModel.position.x
          const toY = toModel.position.y + headerHeight + paddingTop + toFieldIndex * fieldHeight + fieldHeight / 2

          connections.push({
            fromX,
            fromY,
            toX,
            toY,
            fromModel: model.id,
            toModel: toModel.id,
          })
        }
      })
    })

    return connections
  }

  const getUniqueRelationships = () => {
    const relationshipMap = new Map<
      string,
      {
        fromModel: Model
        toModel: Model
        fromFields: string[]
        toFields: string[]
      }
    >()

    models.forEach((model) => {
      model.fields.forEach((field) => {
        if (field.references) {
          const toModel = models.find((m) => m.id === field.references!.table)
          if (!toModel) return

          const key = [model.id, toModel.id].sort().join("-")

          if (!relationshipMap.has(key)) {
            relationshipMap.set(key, {
              fromModel: model,
              toModel: toModel,
              fromFields: [field.name],
              toFields: [field.references.field],
            })
          } else {
            const existing = relationshipMap.get(key)!
            existing.fromFields.push(field.name)
            existing.toFields.push(field.references.field)
          }
        }
      })
    })

    return Array.from(relationshipMap.values())
  }

  return (
    <div
      ref={canvasRef}
      className="relative h-full w-full bg-gray-50"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* SVG for relationship lines */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        {getUniqueRelationships().map((rel, idx) => {
          const fromX = rel.fromModel.position.x + 300
          const fromY = rel.fromModel.position.y + 100
          const toX = rel.toModel.position.x
          const toY = rel.toModel.position.y + 100

          const midX = (fromX + toX) / 2

          return (
            <g key={`relationship-${idx}`}>
              {/* Dashed line */}
              <path
                d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
                stroke="#9ca3af"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
              />
              {/* Connection points */}
              <circle cx={fromX} cy={fromY} r="4" fill="#ff5001" />
              <circle cx={toX} cy={toY} r="4" fill="#ff5001" />

              {/* Cardinality indicators */}
              <text x={fromX - 15} y={fromY + 4} fontSize="12" fill="#6b7280" fontWeight="bold">
                N
              </text>
              <text x={toX + 10} y={toY + 4} fontSize="12" fill="#6b7280" fontWeight="bold">
                1
              </text>
            </g>
          )
        })}
      </svg>

      {/* Draggable table cards */}
      {models.map((model) => (
        <div
          key={model.id}
          className="absolute w-[300px] cursor-move rounded-lg border border-gray-200 bg-white shadow-sm"
          style={{
            left: `${model.position.x}px`,
            top: `${model.position.y}px`,
            userSelect: "none",
          }}
          onMouseDown={(e) => handleMouseDown(e, model.id)}
        >
          {/* Header */}
          <div className="flex items-center gap-2 rounded-t-lg bg-[#ff5001] px-3 py-2">
            <Diamond className="h-4 w-4 fill-white text-white" />
            <span className="text-sm font-medium text-white">{model.name}</span>
          </div>

          {/* Fields */}
          <div className="p-3">
            <div className="space-y-1.5">
              {model.fields.map((field, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{getFieldIcon(field.icon)}</span>
                    <span className="text-gray-900">{field.name}</span>
                  </div>
                  {field.icon === "link" && <LinkIcon className="h-3 w-3 text-gray-400" />}
                </div>
              ))}
            </div>

            {/* Relationships */}
            {model.relationships.length > 0 && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <div className="mb-1.5 text-xs text-gray-400">Relationships</div>
                <div className="space-y-1">
                  {model.relationships.map((rel, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <Diamond className="h-3 w-3 text-gray-600" />
                      <span className="text-gray-900">{rel}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
