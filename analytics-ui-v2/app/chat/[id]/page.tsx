"use client"

import { useEffect, useMemo, useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarToggle } from "@/components/layout/sidebar-toggle"
import { ChatInput } from "@/components/chat/chat-input"
import { QueryResultTable } from "@/components/chat/query-result-table"
import { MarkdownSummary } from "@/components/chat/markdown-summary"
import { VegaChart } from "@/components/chat/vega-chart"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CheckCircle2, Code2, PieChart } from "lucide-react"

interface ThreadMessage {
  question: string
  responseId?: number
  sql?: string
  records?: any[]
  columns?: Array<{ name: string; type: string }>
  totalRows?: number
  summary?: string
  error?: string
  errorCode?: string
  explanation?: string
  loading: boolean
  generatingSummary?: boolean
  chartSpec?: any
  generatingChart?: boolean
  chartError?: string
}

export default function ChatThreadPage() {
  const params = useParams<{ id: string }>()
  const threadId = useMemo(() => params?.id, [params])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const autoStartedRef = useRef(false)
  const messagesRef = useRef<ThreadMessage[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingSql, setEditingSql] = useState<string>("")

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const loadThread = useCallback(async () => {
    if (!threadId) return
    try {
      const res = await fetch(`/api/v1/threads/${threadId}`)
      if (!res.ok) {
        console.error("Failed to load thread:", res.status, res.statusText)
        // Keep existing messages if load fails
        return
      }
      const data = await res.json()
      const responses = (data?.thread?.responses || []) as any[]
      const mapped: ThreadMessage[] = responses.map((r) => {
        const base: ThreadMessage = {
          question: r?.question || r?.prompt || "",
          responseId: r?.id,
          sql: r?.sql || r?.answerDetail?.sql || undefined,
          // Get summary from answerDetail.content (persisted summary) or fallback to summary field
          summary: r?.answerDetail?.content ?? r?.answerDetail?.summary ?? r?.summary ?? undefined,
          // Get chart data from chartDetail
          chartSpec: r?.chartDetail?.chartSchema ?? undefined,
          chartError: r?.chartDetail?.error ? (typeof r.chartDetail.error === 'string' ? r.chartDetail.error : r.chartDetail.error?.message) : undefined,
          loading: false,
        }

        // Use existing records if available (don't fetch preview data on load to avoid too many DB connections)
        // Preview data will be fetched when user views the SQL tab
        base.records = r?.answerDetail?.records ?? r?.records ?? undefined
        base.columns = r?.answerDetail?.columns ?? r?.columns ?? undefined
        base.totalRows = r?.answerDetail?.totalRows ?? r?.totalRows ?? undefined

        return base
      })
      setMessages(mapped)
      // Reset autoStartedRef after loading so new responses can be processed
      autoStartedRef.current = false
    } catch (error) {
      console.error("Error loading thread:", error)
      // Keep existing messages on error
    }
  }, [threadId])

  useEffect(() => {
    loadThread()
  }, [loadThread])

  // Auto-start generation for responses that have no SQL yet (only for the latest one to avoid multiple concurrent requests)
  useEffect(() => {
    if (autoStartedRef.current) return
    if (!threadId) return
    if (!messages || messages.length === 0) return
    
    // Find the latest response that needs processing (no SQL, no error, not loading)
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i]
      if (!msg.sql && !msg.error && !msg.loading && msg.responseId) {
        autoStartedRef.current = true
        void runForMessageIndex(i, msg.question)
        break // Only process one at a time
      }
    }
  }, [messages, threadId])

  const askInThread = useCallback(async (question: string) => {
    if (!question.trim() || !threadId) return

    const newMsg: ThreadMessage = { question, loading: true }
    setMessages((prev) => [...prev, newMsg])
    setLoading(true)

    let responseId: number | undefined

    try {
      // Step 0: Create thread response first (like analytics-ui does)
      try {
        const createResponseRes = await fetch(`/api/v1/threads/${threadId}/responses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        })
        const createResponseData = await createResponseRes.json()
        if (createResponseRes.ok && createResponseData?.response?.id) {
          responseId = createResponseData.response.id
          // Update message with responseId
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = { ...updated[updated.length - 1], responseId }
            return updated
          })
        }
      } catch {
        // Continue even if create fails, we'll handle it later
      }

      // Step 1: Generate SQL for this thread
      const generateResponse = await fetch("/api/v1/generate_sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, threadId }),
      })
      const generateData = await generateResponse.json()

      if (!generateResponse.ok || generateData?.error) {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            error: generateData?.error || "Failed to generate SQL",
            errorCode: generateData?.code,
            // seed sql editor if backend provides invalidSql
            sql: generateData?.invalidSql || updated[updated.length - 1]?.sql,
            loading: false,
          }
          return updated
        })
        setLoading(false)
        return
      }

      const sql: string | undefined = generateData?.sql
      if (!sql) {
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

      // Persist SQL to the thread response if we have responseId
      if (responseId) {
        try {
          await fetch(`/api/v1/threads/${threadId}/responses/${responseId}/sql`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sql }),
          })
        } catch { /* ignore persist error */ }
      }

      // Step 2: Run SQL
      const runResponse = await fetch("/api/v1/run_sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql, threadId }),
      })
      const runData = await runResponse.json()

      if (!runResponse.ok || runData?.error) {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            sql,
            error: runData?.error || "Failed to execute SQL",
            errorCode: runData?.code,
            loading: false,
          }
          return updated
        })
        setLoading(false)
        return
      }

      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          sql,
          records: runData?.records || [],
          columns: runData?.columns || [],
          totalRows: runData?.totalRows || 0,
          generatingSummary: true,
        }
        return updated
      })

      // Step 3: Generate summary (streaming)
      try {
        const summaryCreateResponse = await fetch("/api/v1/generate_summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, sql, threadId, sampleSize: 500 }),
        })
        const summaryCreateData = await summaryCreateResponse.json()

        if (summaryCreateResponse.ok && summaryCreateData?.explanationQueryId) {
          const streamResponse = await fetch(
            `/api/v1/stream_summary?queryId=${summaryCreateData.explanationQueryId}`,
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
              const lines = buffer.split("\n")
              buffer = lines.pop() || ""
              for (const line of lines) {
                if (line.trim() === "") continue
                if (line.startsWith("data: ")) {
                  try {
                    const jsonStr = line.slice(6).trim()
                    if (jsonStr === "") continue
                    const data = JSON.parse(jsonStr)
                    if (data.done) break
                    if (data.message) {
                      summary += data.message
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
                  } catch {
                    // ignore parse errors
                  }
                }
              }
            }

            // flush buffer
            if (buffer.trim()) {
              const trimmed = buffer.trim()
              if (trimmed.startsWith("data: ")) {
                try {
                  const jsonStr = trimmed.slice(6).trim()
                  if (jsonStr) {
                    const data = JSON.parse(jsonStr)
                    if (!data.done && data.message) {
                      summary += data.message
                    }
                  }
                } catch {
                  // ignore
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

            // Persist final summary content into DB
            if (responseId && summary) {
              try {
                await fetch(`/api/v1/threads/${threadId}/responses/${responseId}/answer`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ content: summary }),
                })
              } catch { /* ignore persist error */ }
            }
          }
        } else {
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
      } catch {
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

      // Refresh thread to show all responses (including the new one we just created)
      await loadThread()
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
  }, [threadId, loadThread])

  // Run generation flow but update an existing message by index (used for initial response)
  const runForMessageIndex = useCallback(async (index: number, question: string) => {
    if (!question.trim() || !threadId) return

    // mark message as loading
    setMessages((prev) => {
      const updated = [...prev]
      if (updated[index]) {
        updated[index] = { ...updated[index], loading: true }
      }
      return updated
    })
    setLoading(true)

    try {
      // Step 1: Generate SQL for this thread
      const generateResponse = await fetch("/api/v1/generate_sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, threadId }),
      })
      const generateData = await generateResponse.json()

      if (!generateResponse.ok || generateData?.error) {
        setMessages((prev) => {
          const updated = [...prev]
          if (updated[index]) {
            updated[index] = {
              ...updated[index],
              error: generateData?.error || "Failed to generate SQL",
              errorCode: generateData?.code,
              sql: generateData?.invalidSql || updated[index]?.sql,
              loading: false,
            }
          }
        return updated
        })
        setLoading(false)
        return
      }

      const sql: string | undefined = generateData?.sql
      if (!sql) {
        setMessages((prev) => {
          const updated = [...prev]
          if (updated[index]) {
            updated[index] = { ...updated[index], error: "No SQL generated", loading: false }
          }
          return updated
        })
        setLoading(false)
        return
      }

      // Persist SQL for this existing response if possible
      const responseId = messagesRef.current[index]?.responseId
      if (responseId) {
        try {
          await fetch(`/api/v1/threads/${threadId}/responses/${responseId}/sql`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sql }),
          })
        } catch { /* ignore persist error */ }
      }

      // Step 2: Run SQL
      const runResponse = await fetch("/api/v1/run_sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql, threadId }),
      })
      const runData = await runResponse.json()

      if (!runResponse.ok || runData?.error) {
        setMessages((prev) => {
          const updated = [...prev]
          if (updated[index]) {
            updated[index] = {
              ...updated[index],
              sql,
              error: runData?.error || "Failed to execute SQL",
              errorCode: runData?.code,
              loading: false,
            }
          }
          return updated
        })
        setLoading(false)
        return
      }

      setMessages((prev) => {
        const updated = [...prev]
        if (updated[index]) {
          updated[index] = {
            ...updated[index],
            sql,
            records: runData?.records || [],
            columns: runData?.columns || [],
            totalRows: runData?.totalRows || 0,
            generatingSummary: true,
          }
        }
        return updated
      })

      // Step 3: Generate summary (streaming)
      try {
        const summaryCreateResponse = await fetch("/api/v1/generate_summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, sql, threadId, sampleSize: 500 }),
        })
        const summaryCreateData = await summaryCreateResponse.json()

        if (summaryCreateResponse.ok && summaryCreateData?.explanationQueryId) {
          const streamResponse = await fetch(
            `/api/v1/stream_summary?queryId=${summaryCreateData.explanationQueryId}`,
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
              const lines = buffer.split("\n")
              buffer = lines.pop() || ""
              for (const line of lines) {
                if (line.trim() === "") continue
                if (line.startsWith("data: ")) {
                  try {
                    const jsonStr = line.slice(6).trim()
                    if (jsonStr === "") continue
                    const data = JSON.parse(jsonStr)
                    if (data.done) break
                    if (data.message) {
                      summary += data.message
                      setMessages((prev) => {
                        const updated = [...prev]
                        if (updated[index]) {
                          updated[index] = { ...updated[index], summary, generatingSummary: true }
                        }
                        return updated
                      })
                    }
                  } catch {
                    // ignore parse errors
                  }
                }
              }
            }

            // flush buffer
            if (buffer.trim()) {
              const trimmed = buffer.trim()
              if (trimmed.startsWith("data: ")) {
                try {
                  const jsonStr = trimmed.slice(6).trim()
                  if (jsonStr) {
                    const data = JSON.parse(jsonStr)
                    if (!data.done && data.message) {
                      summary += data.message
                    }
                  }
                } catch {
                  // ignore
                }
              }
            }

            setMessages((prev) => {
              const updated = [...prev]
              if (updated[index]) {
                updated[index] = { ...updated[index], summary, generatingSummary: false, loading: false }
              }
              return updated
            })

            // Persist final summary content into DB
            if (responseId && summary) {
              try {
                await fetch(`/api/v1/threads/${threadId}/responses/${responseId}/answer`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ content: summary }),
                })
              } catch { /* ignore persist error */ }
            }
          }
        } else {
          setMessages((prev) => {
            const updated = [...prev]
            if (updated[index]) {
              updated[index] = { ...updated[index], generatingSummary: false, loading: false }
            }
            return updated
          })
        }
      } catch {
        setMessages((prev) => {
          const updated = [...prev]
          if (updated[index]) {
            updated[index] = { ...updated[index], generatingSummary: false, loading: false }
          }
          return updated
        })
      }
      // Avoid extra refetch to prevent perceived reload; rely on local state and persistence
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev]
        if (updated[index]) {
          updated[index] = {
            ...updated[index],
            error: error instanceof Error ? error.message : "Unknown error",
            loading: false,
          }
        }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }, [threadId, loadThread])

  // Execute run+summary for an existing message using provided SQL (used by Fix SQL)
  const runWithExistingSql = useCallback(async (index: number, question: string, sql: string) => {
    if (!threadId || !sql.trim()) return
    setMessages((prev) => {
      const updated = [...prev]
      if (updated[index]) {
        updated[index] = { ...updated[index], error: undefined, errorCode: undefined, loading: true }
      }
      return updated
    })
    setLoading(true)

    try {
      const responseId = messagesRef.current[index]?.responseId
      if (responseId) {
        try {
          await fetch(`/api/v1/threads/${threadId}/responses/${responseId}/sql`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sql }),
          })
        } catch { /* ignore persist error */ }
      }

      const runResponse = await fetch("/api/v1/run_sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql, threadId }),
      })
      const runData = await runResponse.json()
      if (!runResponse.ok || runData?.error) {
        setMessages((prev) => {
          const updated = [...prev]
          if (updated[index]) {
            updated[index] = { ...updated[index], sql, error: runData?.error || "Failed to execute SQL", errorCode: runData?.code, loading: false }
          }
          return updated
        })
        setLoading(false)
        return
      }

      setMessages((prev) => {
        const updated = [...prev]
        if (updated[index]) {
          updated[index] = { ...updated[index], sql, records: runData?.records || [], columns: runData?.columns || [], totalRows: runData?.totalRows || 0, generatingSummary: true }
        }
        return updated
      })

      // generate summary streaming
      try {
        const summaryCreateResponse = await fetch("/api/v1/generate_summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, sql, threadId, sampleSize: 500 }),
        })
        const summaryCreateData = await summaryCreateResponse.json()
        if (summaryCreateResponse.ok && summaryCreateData?.explanationQueryId) {
          const streamResponse = await fetch(`/api/v1/stream_summary?queryId=${summaryCreateData.explanationQueryId}`)
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
                      setMessages((prev) => {
                        const updated = [...prev]
                        if (updated[index]) {
                          updated[index] = { ...updated[index], summary, generatingSummary: true }
                        }
                        return updated
                      })
                    }
                  } catch {}
                }
              }
            }
            // flush buffer
            if (buffer.trim()) {
              const trimmed = buffer.trim()
              if (trimmed.startsWith('data: ')) {
                try {
                  const jsonStr = trimmed.slice(6).trim()
                  if (jsonStr) {
                    const data = JSON.parse(jsonStr)
                    if (!data.done && data.message) {
                      summary += data.message
                    }
                  }
                } catch {}
              }
            }
            setMessages((prev) => {
              const updated = [...prev]
              if (updated[index]) {
                updated[index] = { ...updated[index], summary, generatingSummary: false, loading: false }
              }
              return updated
            })
            const responseId2 = messagesRef.current[index]?.responseId
            if (responseId2 && summary) {
              try {
                await fetch(`/api/v1/threads/${threadId}/responses/${responseId2}/answer`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ content: summary }),
                })
              } catch {}
            }
          }
        } else {
          setMessages((prev) => {
            const updated = [...prev]
            if (updated[index]) {
              updated[index] = { ...updated[index], generatingSummary: false, loading: false }
            }
            return updated
          })
        }
      } catch {
        setMessages((prev) => {
          const updated = [...prev]
          if (updated[index]) {
            updated[index] = { ...updated[index], generatingSummary: false, loading: false }
          }
          return updated
        })
      }
    } finally {
      setLoading(false)
      setEditingIndex(null)
      setEditingSql("")
    }
  }, [threadId])

  // Fetch preview data for a message if not already loaded
  const fetchPreviewData = useCallback(async (index: number, sql: string) => {
    if (!threadId || !sql) return
    const msg = messagesRef.current[index]
    if (msg?.records) return // Already loaded

    setMessages((prev) => {
      const updated = [...prev]
      if (updated[index]) {
        updated[index] = { ...updated[index], loading: true }
      }
      return updated
    })

    try {
      const previewRes = await fetch("/api/v1/run_sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql, threadId, limit: 500 }),
      })
      const previewData = await previewRes.json()
      if (previewRes.ok && previewData?.records) {
        setMessages((prev) => {
          const updated = [...prev]
          if (updated[index]) {
            updated[index] = {
              ...updated[index],
              records: previewData.records,
              columns: previewData.columns,
              totalRows: previewData.totalRows || 0,
              loading: false,
            }
          }
          return updated
        })
      } else {
        setMessages((prev) => {
          const updated = [...prev]
          if (updated[index]) {
            updated[index] = { ...updated[index], loading: false }
          }
          return updated
        })
      }
    } catch (error) {
      console.error("Error fetching preview data:", error)
      setMessages((prev) => {
        const updated = [...prev]
        if (updated[index]) {
          updated[index] = { ...updated[index], loading: false }
        }
        return updated
      })
    }
  }, [threadId])

  // Generate chart for a message
  const generateChart = useCallback(async (index: number, question: string, sql: string) => {
    if (!threadId || !sql) return

    setMessages((prev) => {
      const updated = [...prev]
      if (updated[index]) {
        updated[index] = { ...updated[index], generatingChart: true, chartError: undefined }
      }
      return updated
    })

    try {
      const chartRes = await fetch("/api/v1/generate_vega_chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, sql, threadId, sampleSize: 10000 }),
      })
      const chartData = await chartRes.json()

      if (!chartRes.ok || chartData?.error) {
        setMessages((prev) => {
          const updated = [...prev]
          if (updated[index]) {
            updated[index] = {
              ...updated[index],
              generatingChart: false,
              chartError: chartData?.error || "Failed to generate chart",
            }
          }
          return updated
        })
        return
      }

      if (chartData?.vegaSpec) {
        setMessages((prev) => {
          const updated = [...prev]
          if (updated[index]) {
            updated[index] = {
              ...updated[index],
              chartSpec: chartData.vegaSpec,
              generatingChart: false,
            }
          }
          return updated
        })

        // Persist chart to thread response if we have responseId
        const responseId = messagesRef.current[index]?.responseId
        if (responseId) {
          try {
            // Note: We might need to add an endpoint to persist chart, but for now we'll just update via loadThread
            await loadThread()
          } catch { /* ignore */ }
        }
      }
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev]
        if (updated[index]) {
          updated[index] = {
            ...updated[index],
            generatingChart: false,
            chartError: error instanceof Error ? error.message : "Failed to generate chart",
          }
        }
        return updated
      })
    }
  }, [threadId, loadThread])

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <SidebarToggle onClick={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto px-8 py-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-black">Thread #{threadId}</h1>
          </div>

          {/* Messages */}
          <div className="w-full space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={msg.responseId || idx}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <div className="px-6 py-4 bg-linear-to-r from-gray-50 to-white border-b border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">Q</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium leading-relaxed">{msg.question}</p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-5">
                  {msg.loading && !msg.sql && (
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm">Processing your question...</span>
                    </div>
                  )}

                  {msg.error && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-red-600 font-medium">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {msg.error}
                      </div>
                      {msg.errorCode && (
                        <div className="text-xs text-gray-600">Code: {msg.errorCode}</div>
                      )}
                      {msg.sql && (
                        <div className="bg-gray-900 text-green-400 text-xs font-mono rounded-md border border-gray-700 overflow-x-auto p-3">
                          <code className="whitespace-pre">{msg.sql}</code>
                        </div>
                      )}
                      {editingIndex !== idx ? (
                        <div>
                          <button
                            className="text-xs px-3 py-1 bg-[#ff5001] text-white rounded hover:bg-[#ff5001]/90"
                            onClick={() => {
                              setEditingIndex(idx)
                              setEditingSql(msg.sql || "")
                            }}
                          >
                            Fix SQL
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <textarea
                            className="w-full h-32 text-xs font-mono rounded-md border border-gray-300 p-2 text-black"
                            value={editingSql}
                            onChange={(e) => setEditingSql(e.target.value)}
                            placeholder="Edit SQL here"
                          />
                          <div className="flex gap-2">
                            <button
                              className="text-xs px-3 py-1 bg-[#0ea5e9] text-white rounded hover:bg-[#0284c7]"
                              onClick={() => runWithExistingSql(idx, msg.question, editingSql)}
                              disabled={!editingSql.trim()}
                            >
                              Run
                            </button>
                            <button
                              className="text-xs px-3 py-1 bg-gray-200 text-black rounded hover:bg-gray-300"
                              onClick={() => { setEditingIndex(null); setEditingSql("") }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {msg.sql && !msg.error && (
                    <Tabs defaultValue="answer" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="answer" className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Answer
                        </TabsTrigger>
                        <TabsTrigger 
                          value="sql" 
                          className="flex items-center gap-2"
                          onClick={() => {
                            if (msg.sql && !msg.records) {
                              void fetchPreviewData(idx, msg.sql)
                            }
                          }}
                        >
                          <Code2 className="h-4 w-4" />
                          View SQL
                        </TabsTrigger>
                        <TabsTrigger 
                          value="chart" 
                          className="flex items-center gap-2"
                          onClick={() => {
                            if (!msg.chartSpec && !msg.generatingChart && msg.sql) {
                              void generateChart(idx, msg.question, msg.sql)
                            }
                          }}
                        >
                          <PieChart className="h-4 w-4" />
                          Chart
                          {!msg.chartSpec && !msg.generatingChart && (
                            <span className="ml-1 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Beta</span>
                          )}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="answer" className="mt-4">
                        {msg.generatingSummary && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span>Generating summary...</span>
                          </div>
                        )}
                        {msg.summary && (
                          <MarkdownSummary
                            content={msg.summary}
                            isStreaming={msg.generatingSummary}
                          />
                        )}
                        {!msg.summary && !msg.generatingSummary && (
                          <div className="text-sm text-gray-500">No summary available yet.</div>
                        )}
                      </TabsContent>

                      <TabsContent value="sql" className="mt-4 space-y-4">
                        <div className="relative">
                          <div className="absolute top-0 left-0 px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded-tl-md rounded-br-md z-10">
                            SQL Query
                          </div>
                          <div className="pt-8 px-4 py-3 bg-gray-900 rounded-lg border border-gray-700 overflow-x-auto">
                            <code className="text-xs text-green-400 font-mono whitespace-pre">
                              {msg.sql}
                            </code>
                          </div>
                        </div>

                        {msg.records && msg.columns && (
                          <div>
                            <QueryResultTable
                              records={msg.records}
                              columns={msg.columns}
                              totalRows={msg.totalRows}
                            />
                            <div className="text-right mt-2 text-xs text-gray-500">
                              Showing up to 500 rows
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="chart" className="mt-4">
                        {msg.generatingChart && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span>Generating chart...</span>
                          </div>
                        )}
                        {msg.chartError && (
                          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {msg.chartError}
                          </div>
                        )}
                        {msg.chartSpec && (
                          <div className="border border-gray-200 rounded-lg p-4 bg-white">
                            <VegaChart spec={msg.chartSpec} />
                          </div>
                        )}
                        {!msg.chartSpec && !msg.generatingChart && !msg.chartError && (
                          <div className="text-sm text-gray-500">
                            Click the Chart tab to generate a visualization.
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input to continue the thread */}
          <ChatInput onSend={askInThread} disabled={loading} />
        </div>
      </main>
    </div>
  )
}


