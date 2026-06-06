import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "../supabase"
import DiffViewer from "../components/DiffViewer"
import ErrorList from "../components/ErrorList"

export default function SharedFix() {
  const { slug } = useParams()
  const [fix, setFix] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetchFix()
  }, [slug])

  const fetchFix = async () => {
    const { data, error } = await supabase
      .from("shared_fixes")
      .select("*")
      .eq("slug", slug)
      .single()

    if (error || !data) {
      setNotFound(true)
    } else {
      setFix(data)
    }
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center
      justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-gray-400">Loading fix...</p>
      </div>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center
      justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">😕</div>
        <p className="text-gray-400">Fix not found</p>
        
        <a
          href="/"
          className="mt-4 inline-block text-violet-400 hover:text-violet-300"
        >
          ← Go to AI Code Doctor
        </a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-4 flex items-center
        justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🩺</span>
          <div>
            <h1 className="text-xl font-bold text-white">AI Code Doctor</h1>
            <p className="text-xs text-gray-400">Shared Fix</p>
          </div>
        </div>
        
        <a
          href="/"
          className="text-sm bg-violet-600 hover:bg-violet-500 text-white
            px-4 py-1.5 rounded-lg transition font-semibold"
        >
          Fix My Code →
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* Language badge */}
        <div className="flex items-center gap-3">
          <span className="text-xs bg-violet-900 text-violet-300 px-3 py-1
            rounded-full font-mono">
            {fix.language}
          </span>
          <span className="text-xs text-gray-500">
            Shared on {new Date(fix.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* What code does */}
        {fix.what_code_does && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg
            px-4 py-3">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
              🧠 What this code does:
            </p>
            <p className="text-sm text-gray-300">{fix.what_code_does}</p>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-4 flex-wrap">
          <div className="bg-red-950 border border-red-800 rounded-lg px-4
            py-3 flex items-center gap-2">
            <span className="text-red-400 font-bold text-xl">
              {fix.errors?.length || 0}
            </span>
            <span className="text-red-300 text-sm">bugs found</span>
          </div>
          <div className="bg-green-950 border border-green-800 rounded-lg
            px-4 py-3 flex items-center gap-2">
            <span className="text-green-400 font-bold text-xl">
              {fix.fixes?.length || 0}
            </span>
            <span className="text-green-300 text-sm">fixes applied</span>
          </div>
          {fix.verified && (
            <div className="bg-green-950 border border-green-600 rounded-lg
              px-4 py-3 flex items-center gap-2">
              <span className="text-green-400 text-xl">✅</span>
              <span className="text-green-300 text-sm font-semibold">
                Verified — code actually runs!
              </span>
            </div>
          )}
        </div>

        {/* Errors */}
        <ErrorList errors={fix.errors} fixes={fix.fixes} />

        {/* Diff */}
        <DiffViewer
          original={fix.original_code}
          fixed={fix.fixed_code}
        />

        {/* CTA */}
        <div className="bg-violet-950 border border-violet-700 rounded-lg
          px-6 py-5 text-center">
          <p className="text-violet-300 font-semibold mb-2">
            Got broken code too? 🩺
          </p>
          
          <a
            href="/"
            className="inline-block bg-violet-600 hover:bg-violet-500
              text-white px-6 py-2 rounded-lg text-sm font-semibold transition"
          >
            Fix My Code for Free →
          </a>
        </div>

      </div>
    </div>
  )
}