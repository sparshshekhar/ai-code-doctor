import { useState, useRef } from "react"
import Editor from "@monaco-editor/react"

const LANGUAGES = [
  { value: "python",     label: "🐍 Python" },
  { value: "javascript", label: "🟨 JavaScript" },
  { value: "typescript", label: "🔷 TypeScript" },
  { value: "react",      label: "⚛️  React (JSX)" },
  { value: "java",       label: "☕ Java" },
  { value: "c",          label: "🔵 C" },
  { value: "cpp",        label: "🔵 C++" },
  { value: "go",         label: "🐹 Go" },
  { value: "rust",       label: "🦀 Rust" },
  { value: "sql",        label: "🗄️  SQL" },
]

const MONACO_LANG_MAP = {
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  react: "javascript",
  java: "java",
  c: "c",
  cpp: "cpp",
  go: "go",
  rust: "rust",
  sql: "sql",
}

export default function CodeInput({ onSubmit, loading }) {
  const [code, setCode] = useState(`def divide(a, b):
    return a / b

result = divide(10, 0)
print(reslt)`)
  const [language, setLanguage] = useState("python")
  const [userContext, setUserContext] = useState("")
  const fileRef = useRef()

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCode(ev.target.result)
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Top bar — language selector + upload */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-400">Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white text-sm
              rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
          >
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => fileRef.current.click()}
          className="text-xs text-gray-400 border border-gray-700 px-3 py-2
            rounded-lg hover:border-gray-500 transition"
        >
          📎 Upload file
        </button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* Context box */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400">
          💬 Tell me what you're building and what errors you're seeing
          <span className="text-gray-600 ml-2">(optional but helps a lot)</span>
        </label>
        <textarea
          value={userContext}
          onChange={(e) => setUserContext(e.target.value)}
          placeholder="e.g. I'm building a calculator app. Getting ZeroDivisionError on line 5 when dividing by zero. Also the result variable seems to not print correctly..."
          rows={3}
          className="bg-gray-900 border border-gray-700 text-white text-sm
            rounded-lg px-4 py-3 resize-none focus:outline-none
            focus:border-violet-500 placeholder-gray-600"
        />
      </div>

      {/* Monaco Editor */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400">Your Code:</label>
        <div className="rounded-lg overflow-hidden border border-gray-700">
          <Editor
            height="320px"
            language={MONACO_LANG_MAP[language]}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 12 },
            }}
          />
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={() => onSubmit(code, language, userContext)}
        disabled={loading || !code.trim()}
        className="w-full py-3 rounded-lg font-semibold text-sm transition
          bg-violet-600 hover:bg-violet-500 text-white
          disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "🔍 Analyzing..." : "🔍 Fix My Code"}
      </button>
    </div>
  )
}