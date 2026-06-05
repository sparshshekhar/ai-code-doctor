import { useState } from "react"
import ReactDiffViewer from "react-diff-viewer-continued"

export default function DiffViewer({ original, fixed }) {
  const [copied, setCopied] = useState(false)

  if (!original || !fixed) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(fixed)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Header with copy button */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest">
          📝 Before vs After
        </h2>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg border transition
            border-green-700 text-green-400 hover:bg-green-900 hover:border-green-500"
        >
          {copied ? "✅ Copied!" : "📋 Copy Fixed Code"}
        </button>
      </div>

      {/* Diff view */}
      <div className="rounded-lg overflow-hidden border border-gray-700 text-xs">
        <ReactDiffViewer
          oldValue={original}
          newValue={fixed}
          splitView={true}
          leftTitle="❌ Before"
          rightTitle="✅ After"
          useDarkTheme={true}
        />
      </div>

    </div>
  )
}