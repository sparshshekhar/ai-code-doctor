import { useState, useEffect } from "react"
import { supabase } from "../supabase"

export default function FixHistory({ onSelectFix }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from("fix_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)

    if (!error) setHistory(data || [])
    setLoading(false)
  }

  const deleteFix = async (id) => {
    await supabase.from("fix_history").delete().eq("id", id)
    setHistory(history.filter(h => h.id !== id))
  }

  if (loading) return (
    <div className="text-gray-400 text-sm text-center py-8">
      Loading history...
    </div>
  )

  if (!history.length) return (
    <div className="text-gray-500 text-sm text-center py-8">
      No fixes yet — paste some broken code! 😄
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest">
        📜 Your Fix History
      </h2>

      {history.map((fix) => (
        <div
          key={fix.id}
          className="bg-gray-900 border border-gray-700 rounded-lg p-4
            hover:border-gray-500 transition cursor-pointer"
          onClick={() => onSelectFix(fix)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-violet-900 text-violet-300
                px-2 py-0.5 rounded font-mono">
                {fix.language}
              </span>
              {fix.verified && (
                <span className="text-xs text-green-400">✅ verified</span>
              )}
              <span className="text-xs text-red-400">
                {fix.errors?.length || 0} bugs
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">
                {new Date(fix.created_at).toLocaleDateString()}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteFix(fix.id) }}
                className="text-gray-600 hover:text-red-400 text-xs transition"
              >
                🗑️
              </button>
            </div>
          </div>

          {fix.what_code_does && (
            <p className="text-sm text-gray-400 mt-2 truncate">
              {fix.what_code_does}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}