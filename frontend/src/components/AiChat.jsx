import { useState, useRef, useEffect } from "react"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

const SUGGESTIONS = [
  "Explain this fix like I'm a beginner",
  "Why did you choose this approach?",
  "Are there other ways to fix this?",
  "What does this function do?",
  "How can I avoid this bug in future?",
]

export default function AiChat({ result }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hey! 👋 I just fixed your ${result.language} code. I found **${result.errors?.length || 0} bug(s)** and fixed them all. Ask me anything about the fix!`
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (text) => {
    const userMessage = text || input
    if (!userMessage.trim()) return

    setInput("")
    setLoading(true)

    // add user message
    const newMessages = [
      ...messages,
      { role: "user", content: userMessage }
    ]
    setMessages(newMessages)

    // add empty assistant message
    setMessages(prev => [...prev, { role: "assistant", content: "" }])

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.filter(m => m.role !== "system"),
          original_code: result.original_code,
          fixed_code: result.fixed_code,
          language: result.language,
          errors: result.errors || [],
          fixes: result.fixes || []
        })
      })

      // stream the response
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: "assistant",
            content: updated[updated.length - 1].content + chunk
          }
          return updated
        })
      }

    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry something went wrong. Try again!"
        }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest">
        💬 Ask AI About This Fix
      </h2>

      {/* Chat messages */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg
        flex flex-col gap-4 p-4 max-h-96 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center
              text-xs shrink-0 ${msg.role === "assistant"
                ? "bg-violet-700"
                : "bg-gray-700"
              }`}
            >
              {msg.role === "assistant" ? "🩺" : "👤"}
            </div>

            {/* Message bubble */}
            <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm
              whitespace-pre-wrap ${msg.role === "assistant"
                ? "bg-gray-800 text-gray-200"
                : "bg-violet-700 text-white"
              }`}
            >
              {msg.content || (
                <span className="text-gray-500 animate-pulse">thinking...</span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s)}
              disabled={loading}
              className="text-xs border border-gray-700 text-gray-400 px-3
                py-1.5 rounded-full hover:border-violet-500 hover:text-violet-400
                transition disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask anything about this fix... (Enter to send)"
          rows={2}
          disabled={loading}
          className="flex-1 bg-gray-900 border border-gray-700 text-white
            text-sm rounded-lg px-4 py-3 resize-none focus:outline-none
            focus:border-violet-500 placeholder-gray-600
            disabled:opacity-40"
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white
            rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed
            font-semibold text-sm"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  )
}