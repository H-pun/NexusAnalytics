"use client"

import { memo } from "react"

interface MarkdownSummaryProps {
  content: string
  isStreaming?: boolean
}

export const MarkdownSummary = memo(function MarkdownSummary({
  content,
  isStreaming = false,
}: MarkdownSummaryProps) {
  if (!content) return null

  // Simple markdown-like rendering
  const renderContent = (text: string) => {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    let inList = false
    let listItems: string[] = []
    let inTable = false
    let tableRows: React.ReactNode[] = []
    let tableRowIndex = 0
    let isFirstTableRow = true

    const flushTable = () => {
      if (tableRows.length > 0) {
        elements.push(
          <div key={`table-${tableRowIndex}`} className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse border border-gray-200 rounded-lg">
              <tbody>
                {tableRows}
              </tbody>
            </table>
          </div>
        )
        tableRows = []
        isFirstTableRow = true
      }
      inTable = false
    }

    lines.forEach((line, idx) => {
      // Headers
      if (line.startsWith('## ')) {
        if (inTable) flushTable()
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`list-${idx}`} className="list-disc list-inside mb-4 space-y-1">
              {listItems.map((item, i) => (
                <li key={i} className="text-gray-700">{item}</li>
              ))}
            </ul>
          )
          listItems = []
          inList = false
        }
        elements.push(
          <h2 key={idx} className="text-xl font-semibold text-gray-900 mb-3 mt-6 first:mt-0">
            {line.replace('## ', '')}
          </h2>
        )
      } else if (line.startsWith('### ')) {
        if (inTable) flushTable()
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`list-${idx}`} className="list-disc list-inside mb-4 space-y-1">
              {listItems.map((item, i) => (
                <li key={i} className="text-gray-700">{item}</li>
              ))}
            </ul>
          )
          listItems = []
          inList = false
        }
        elements.push(
          <h3 key={idx} className="text-lg font-semibold text-gray-900 mb-2 mt-4">
            {line.replace('### ', '')}
          </h3>
        )
      }
      // Table
      else if (line.startsWith('|') && line.includes('---')) {
        // Skip separator line, but mark that we're in a table
        inTable = true
      } else if (line.startsWith('|')) {
        inTable = true
        const cells = line.split('|').filter(c => c.trim())
        if (cells.length > 0) {
          const isHeader = isFirstTableRow && cells[0].trim().match(/^[A-Za-z\s]+$/)
          tableRows.push(
            <tr key={tableRowIndex} className={isHeader ? 'bg-gray-50' : ''}>
              {cells.map((cell, cellIdx) => {
                const content = cell.trim()
                const isBold = content.startsWith('**') && content.endsWith('**')
                const text = isBold ? content.slice(2, -2) : content
                const Component = isHeader ? 'th' : 'td'
                return (
                  <Component
                    key={cellIdx}
                    className={`px-4 py-2 text-sm border border-gray-200 ${
                      isHeader ? 'font-semibold text-gray-700' : 'text-gray-900'
                    }`}
                  >
                    {isBold ? <strong>{text}</strong> : text}
                  </Component>
                )
              })}
            </tr>
          )
          tableRowIndex++
          isFirstTableRow = false
        }
      }
      // List items
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        if (inTable) flushTable()
        inList = true
        listItems.push(line.trim().substring(2))
      }
      // Empty line
      else if (line.trim() === '') {
        if (inTable) flushTable()
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`list-${idx}`} className="list-disc list-inside mb-4 space-y-1">
              {listItems.map((item, i) => (
                <li key={i} className="text-gray-700">{item}</li>
              ))}
            </ul>
          )
          listItems = []
          inList = false
        }
        elements.push(<br key={idx} />)
      }
      // Regular paragraph
      else {
        if (inTable) flushTable()
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`list-${idx}`} className="list-disc list-inside mb-4 space-y-1">
              {listItems.map((item, i) => (
                <li key={i} className="text-gray-700">{item}</li>
              ))}
            </ul>
          )
          listItems = []
          inList = false
        }
        // Handle bold text
        const parts = line.split(/(\*\*[^*]+\*\*)/g)
        const paragraph = (
          <p key={idx} className="text-gray-700 mb-3 leading-relaxed">
            {parts.map((part, partIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={partIdx} className="font-semibold text-gray-900">
                    {part.slice(2, -2)}
                  </strong>
                )
              }
              return <span key={partIdx}>{part}</span>
            })}
          </p>
        )
        elements.push(paragraph)
      }
    })

    // Handle remaining list items
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key="list-final" className="list-disc list-inside mb-4 space-y-1">
          {listItems.map((item, i) => (
            <li key={i} className="text-gray-700">{item}</li>
          ))}
        </ul>
      )
    }

    // Handle remaining table rows
    if (inTable) {
      flushTable()
    }

    return elements
  }

  return (
    <div className="prose prose-sm max-w-none">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 shadow-sm">
        <div className="space-y-2">
          {renderContent(content)}
          {isStreaming && (
            <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1" />
          )}
        </div>
      </div>
    </div>
  )
})

