"use client"

import { useState, useCallback } from "react"

interface GenerateSQLResponse {
  id: string
  sql?: string
  error?: string
  code?: string
  explanationQueryId?: string
}

interface RunSQLResponse {
  id: string
  records?: any[]
  columns?: Array<{ name: string; type: string }>
  totalRows?: number
  threadId?: string
  error?: string
  code?: string
}

interface GenerateSummaryResponse {
  id: string
  summary?: string
  explanationQueryId?: string
  threadId?: string
  error?: string
  code?: string
}

interface ChatMessage {
  question: string
  sql?: string
  records?: any[]
  columns?: Array<{ name: string; type: string }>
  totalRows?: number
  summary?: string
  error?: string
  explanation?: string
  loading: boolean
  generatingSummary?: boolean
}

export function useAskChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)

  const askQuestion = useCallback(async (question: string) => {
    if (!question.trim()) return

    // Add user message
    const userMessage: ChatMessage = {
      question,
      loading: true,
    }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    try {
      // Step 1: Generate SQL
      const generateResponse = await fetch("/api/v1/generate_sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          threadId: null, // New thread
        }),
      })

      const generateData: GenerateSQLResponse = await generateResponse.json()

      if (!generateResponse.ok || generateData.error) {
        // Handle NON_SQL_QUERY with explanation
        if (generateData.code === "NON_SQL_QUERY" && generateData.explanationQueryId) {
          try {
            // Fetch explanation from streaming endpoint
            const explanationResponse = await fetch(
              `/api/v1/stream_explanation?queryId=${generateData.explanationQueryId}`
            )
            
            if (explanationResponse.ok) {
              const reader = explanationResponse.body?.getReader()
              const decoder = new TextDecoder()
              let explanation = ""
              
              if (reader) {
                let buffer = ""
                while (true) {
                  const { done, value } = await reader.read()
                  if (done) break
                  
                  buffer += decoder.decode(value, { stream: true })
                  const lines = buffer.split('\n')
                  buffer = lines.pop() || "" // Keep incomplete line in buffer
                  
                  for (const line of lines) {
                    if (line.trim() === '') continue
                    if (line.startsWith('data: ')) {
                      try {
                        const jsonStr = line.slice(6).trim()
                        if (jsonStr === '') continue
                        const data = JSON.parse(jsonStr)
                        if (data.done) break
                        if (data.message) {
                          explanation += data.message
                          // Update message with partial explanation (streaming)
                          setMessages((prev) => {
                            const updated = [...prev]
                            updated[updated.length - 1] = {
                              ...updated[updated.length - 1],
                              explanation,
                              loading: true,
                            }
                            return updated
                          })
                        }
                      } catch (err) {
                        // Ignore parse errors for malformed JSON
                        console.warn('Failed to parse SSE data:', err)
                      }
                    }
                  }
                }
                // Process remaining buffer
                if (buffer.trim()) {
                  const trimmedBuffer = buffer.trim()
                  if (trimmedBuffer.startsWith('data: ')) {
                    try {
                      const jsonStr = trimmedBuffer.slice(6).trim()
                      if (jsonStr) {
                        const data = JSON.parse(jsonStr)
                        if (!data.done && data.message) {
                          explanation += data.message
                        }
                      }
                    } catch (_e) {
                      // Ignore parse errors
                    }
                  }
                }
              }
              
              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  explanation,
                  error: generateData.error,
                  loading: false,
                }
                return updated
              })
            } else {
              // Fallback if explanation fetch fails
              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  error: generateData.error || "Cannot generate SQL from this question.",
                  loading: false,
                }
                return updated
              })
            }
          } catch (_explanationError) {
            // Fallback if explanation fetch fails
            setMessages((prev) => {
              const updated = [...prev]
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                error: generateData.error || "Cannot generate SQL from this question.",
                loading: false,
              }
              return updated
            })
          }
        } else {
          // Regular error handling
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              error: generateData.error || "Failed to generate SQL",
              loading: false,
            }
            return updated
          })
        }
        setLoading(false)
        return
      }

      if (!generateData.sql) {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            error: "No SQL generated",
            loading: false,
          }
          return updated
        })
        setLoading(false)
        return
      }

      // Step 2: Run SQL
      const runResponse = await fetch("/api/v1/run_sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql: generateData.sql,
          threadId: null,
        }),
      })

      const runData: RunSQLResponse = await runResponse.json()

      if (!runResponse.ok || runData.error) {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            sql: generateData.sql,
            error: runData.error || "Failed to execute SQL",
            loading: false,
          }
          return updated
        })
        setLoading(false)
        return
      }

      // Update message with SQL and data
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          sql: generateData.sql,
          records: runData.records || [],
          columns: runData.columns || [],
          totalRows: runData.totalRows || 0,
          generatingSummary: true,
        }
        return updated
      })

      // Step 3: Generate Summary (with streaming)
      try {
        // First, create the summary task
        const summaryCreateResponse = await fetch("/api/v1/generate_summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
            sql: generateData.sql,
            threadId: runData.threadId,
            sampleSize: 500,
          }),
        })

        const summaryCreateData: GenerateSummaryResponse = await summaryCreateResponse.json()

        if (summaryCreateResponse.ok && summaryCreateData.explanationQueryId) {
          // Stream the summary word by word
          try {
            const streamResponse = await fetch(
              `/api/v1/stream_summary?queryId=${summaryCreateData.explanationQueryId}`
            )

            if (streamResponse.ok && streamResponse.body) {
              const reader = streamResponse.body.getReader()
              const decoder = new TextDecoder()
              let summary = ""
              let buffer = ""

              while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() || ""

                for (const line of lines) {
                  if (line.trim() === '') continue
                  if (line.startsWith('data: ')) {
                    try {
                      const jsonStr = line.slice(6).trim()
                      if (jsonStr === '') continue
                      const data = JSON.parse(jsonStr)
                      if (data.done) break
                      if (data.message) {
                        summary += data.message
                        // Update message with streaming summary
                        setMessages((prev) => {
                          const updated = [...prev]
                          updated[updated.length - 1] = {
                            ...updated[updated.length - 1],
                            summary,
                            generatingSummary: true,
                          }
                          return updated
                        })
                      }
                  } catch (_e) {
                    console.warn('Failed to parse SSE data:', _e)
                    }
                  }
                }
              }

              // Process remaining buffer
              if (buffer.trim()) {
                const trimmedBuffer = buffer.trim()
                if (trimmedBuffer.startsWith('data: ')) {
                  try {
                    const jsonStr = trimmedBuffer.slice(6).trim()
                    if (jsonStr) {
                      const data = JSON.parse(jsonStr)
                      if (!data.done && data.message) {
                        summary += data.message
                      }
                    }
                  } catch (_e) {
                    // Ignore parse errors
                  }
                }
              }

              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  summary,
                  generatingSummary: false,
                  loading: false,
                }
                return updated
              })
            }
          } catch (streamError) {
            console.warn("Failed to stream summary:", streamError)
            setMessages((prev) => {
              const updated = [...prev]
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                generatingSummary: false,
                loading: false,
              }
              return updated
            })
          }
        } else {
          // If summary generation fails, still show the data
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              generatingSummary: false,
              loading: false,
            }
            return updated
          })
        }
      } catch (summaryError) {
        // If summary generation fails, still show the data
        console.warn("Failed to generate summary:", summaryError)
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            generatingSummary: false,
            loading: false,
          }
          return updated
        })
      }
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          error: error instanceof Error ? error.message : "Unknown error",
          loading: false,
        }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    messages,
    loading,
    askQuestion,
  }
}

