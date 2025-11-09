"use client"

import { useEffect, useRef, useState } from "react"

interface VegaChartProps {
  spec: any
  className?: string
}

export function VegaChart({ spec, className }: VegaChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current || !spec) return

    // Dynamic import vega-embed
    const loadChart = async () => {
      const container = containerRef.current
      if (!container) return

      try {
        const vegaEmbed = await import("vega-embed")
        const embed = vegaEmbed.default

        // Clear previous chart
        if (viewRef.current) {
          viewRef.current.finalize()
          viewRef.current = null
        }

        const embedOptions = {
          mode: 'vega-lite' as const,
          renderer: 'svg' as const,
          actions: {
            export: true,
            source: false,
            compiled: false,
            editor: false,
          },
        }

        // Update spec to use Vega-Lite v6 schema if it's using v5
        const updatedSpec = { ...spec }
        if (updatedSpec.$schema && updatedSpec.$schema.includes('vega-lite/v5')) {
          updatedSpec.$schema = updatedSpec.$schema.replace('vega-lite/v5', 'vega-lite/v6')
        } else if (!updatedSpec.$schema) {
          // Add v6 schema if not present
          updatedSpec.$schema = 'https://vega.github.io/schema/vega-lite/v6.json'
        }

        // Embed the chart
        const result = await embed(container, updatedSpec, embedOptions)
        viewRef.current = result.view
        setError(null)
      } catch (err) {
        console.error("Error embedding chart:", err)
        setError(err instanceof Error ? err.message : "Failed to render chart")
      }
    }

    loadChart()

    // Cleanup on unmount
    return () => {
      if (viewRef.current) {
        viewRef.current.finalize()
        viewRef.current = null
      }
    }
  }, [spec])

  if (!spec) {
    return (
      <div className="text-sm text-gray-500 p-4">
        No chart data available
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 bg-red-50 p-4 rounded-md">
        Error rendering chart: {error}
      </div>
    )
  }

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ width: '100%', minHeight: '400px' }}
    />
  )
}

