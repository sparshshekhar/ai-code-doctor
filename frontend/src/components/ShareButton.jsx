import { useState } from "react"
import { supabase } from "../supabase"
import { nanoid } from "nanoid"

export default function ShareButton({ result }) {
  const [loading, setLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    setLoading(true)

    try {
      // generate a short unique slug
      const slug = nanoid(8)

      // save to shared_fixes table
      const { error } = await supabase
        .from("shared_fixes")
        .insert({
          slug,
          language: result.language,
          original_code: result.original_code,
          fixed_code: result.fixed_code,
          what_code_does: result.what_code_does,
          errors: result.errors,
          fixes: result.fixes,
          verified: result.verified,
          attempts: result.attempts
        })

      if (error) throw error

      const url = `${window.location.origin}/fix/${slug}`
      setShareUrl(url)

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // after link is generated
  if (shareUrl) {
    return (
      <div className="flex items-center gap-2 bg-gray-900 border border-gray-700
        rounded-lg px-4 py-3">
        <span className="text-sm text-gray-400 flex-1 truncate">{shareUrl}</span>
        <button
          onClick={handleCopy}
          className="text-xs px-3 py-1.5 rounded-lg border transition
            border-green-700 text-green-400 hover:bg-green-900 shrink-0"
        >
          {copied ? "✅ Copied!" : "📋 Copy"}
        </button>
        
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-600
            text-gray-400 hover:border-gray-400 transition shrink-0"
        >
          Open →
        </a>
      </div>
    )
  }

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="flex items-center gap-2 text-sm border border-gray-700
        px-4 py-2 rounded-lg text-gray-400 hover:border-violet-500
        hover:text-violet-400 transition disabled:opacity-40"
    >
      {loading ? "Generating link..." : "🔗 Share this Fix"}
    </button>
  )
}