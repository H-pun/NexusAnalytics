"use client"

import { memo } from "react"

interface QueryResultTableProps {
  records: any[]
  columns: Array<{ name: string; type: string }>
  totalRows?: number
}

export const QueryResultTable = memo(function QueryResultTable({
  records,
  columns,
  totalRows,
}: QueryResultTableProps) {
  if (!records || records.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic py-4">
        Query executed successfully but returned no results.
      </div>
    )
  }

  const displayRows = records.slice(0, 100)
  const hasMore = totalRows ? totalRows > 100 : records.length > 100

  return (
    <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <span>{col.name}</span>
                    <span className="text-xs font-normal text-gray-400 lowercase">
                      ({col.type})
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {displayRows.map((row: any, rowIdx: number) => (
              <tr
                key={rowIdx}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {columns.map((col, colIdx) => {
                  const value = row[col.name]
                  const displayValue =
                    value !== null && value !== undefined
                      ? String(value)
                      : (
                        <span className="text-gray-400 italic">NULL</span>
                      )

                  return (
                    <td
                      key={colIdx}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {displayValue}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <div className="px-6 py-3 text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
          Showing {displayRows.length} of {totalRows || records.length} rows
        </div>
      )}
    </div>
  )
})




