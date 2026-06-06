import { useState, useEffect } from "react"
import axios from "axios"
import { supabase } from "./supabase"
import Header from "./components/Header"
import CodeInput from "./components/CodeInput"
import DiffViewer from "./components/DiffViewer"
import ErrorList from "./components/ErrorList"
import FixHistory from "./components/FixHistory"
import ShareButton from "./components/ShareButton"

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

export default function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  // check if user is logged in on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
  }, [])

  const handleSubmit = async (code, language, userContext) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await axios.post(`${API_URL}/fix-code`, {
        code,
        language,
        user_context: userContext
      })

      setResult(res.data)

      // save to history if logged in
      if (user) {
        await supabase.from("fix_history").insert({
          user_id: user.id,
          language: res.data.language,
          original_code: res.data.original_code,
          fixed_code: res.data.fixed_code,
          what_code_does: res.data.what_code_does,
          errors: res.data.errors,
          fixes: res.data.fixes,
          verified: res.data.verified,
          attempts: res.data.attempts
        })
      }

    } catch (err) {
      setError("Something went wrong. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectFix = (fix) => {
    setResult({
      original_code: fix.original_code,
      fixed_code: fix.fixed_code,
      what_code_does: fix.what_code_does,
      errors: fix.errors,
      fixes: fix.fixes,
      verified: fix.verified,
      attempts: fix.attempts,
      language: fix.language
    })
    setShowHistory(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header user={user} onAuthChange={setUser} />

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* History toggle */}
        {user && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="self-start text-sm border border-gray-700 px-4 py-2
              rounded-lg text-gray-400 hover:border-gray-500 transition"
          >
            {showHistory ? "← Back to Editor" : "📜 View Fix History"}
          </button>
        )}

        {/* History view */}
        {showHistory && user ? (
          <FixHistory onSelectFix={handleSelectFix} />
        ) : (
          <>
            {/* Input */}
            <CodeInput onSubmit={handleSubmit} loading={loading} />

            {/* Error */}
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-300
                px-4 py-3 rounded-lg text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3">🔍</div>
                <p>AI is analyzing your code...</p>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="flex flex-col gap-8">

                {/* Save hint for non-logged in users */}
                {!user && (
                  <div className="bg-violet-950 border border-violet-700
                    rounded-lg px-4 py-3 text-sm text-violet-300">
                    💡 Login to save this fix to your history!
                  </div>
                )}

                {/* Stats */}
                <div className="flex gap-4 flex-wrap">
                  <div className="bg-red-950 border border-red-800 rounded-lg
                    px-4 py-3 flex items-center gap-2">
                    <span className="text-red-400 font-bold text-xl">
                      {result.errors?.length || 0}
                    </span>
                    <span className="text-red-300 text-sm">bugs found</span>
                  </div>
                  <div className="bg-green-950 border border-green-800
                    rounded-lg px-4 py-3 flex items-center gap-2">
                    <span className="text-green-400 font-bold text-xl">
                      {result.fixes?.length || 0}
                    </span>
                    <span className="text-green-300 text-sm">fixes applied</span>
                  </div>
                  <div className="bg-blue-950 border border-blue-800 rounded-lg
                    px-4 py-3 flex items-center gap-2">
                    <span className="text-blue-400 font-bold text-xl">
                      {result.attempts || 1}
                    </span>
                    <span className="text-blue-300 text-sm">attempts</span>
                  </div>
                  {result.verified ? (
                    <div className="bg-green-950 border border-green-600
                      rounded-lg px-4 py-3 flex items-center gap-2">
                      <span className="text-green-400 text-xl">✅</span>
                      <span className="text-green-300 text-sm font-semibold">
                        Verified — code actually runs!
                      </span>
                    </div>
                  ) : (
                    <div className="bg-yellow-950 border border-yellow-700
                      rounded-lg px-4 py-3 flex items-center gap-2">
                      <span className="text-yellow-400 text-xl">⚠️</span>
                      <span className="text-yellow-300 text-sm font-semibold">
                        Could not fully verify
                      </span>
                    </div>
                  )}
                </div>

                {/* Share button */}
<ShareButton result={result} />

                {/* What AI understood */}
                {result.what_code_does && (
                  <div className="bg-gray-900 border border-gray-700
                    rounded-lg px-4 py-3">
                    <p className="text-xs text-gray-500 uppercase
                      tracking-widest mb-1">
                      🧠 AI understood your code as:
                    </p>
                    <p className="text-sm text-gray-300">
                      {result.what_code_does}
                    </p>
                  </div>
                )}

                <ErrorList errors={result.errors} fixes={result.fixes} />
                <DiffViewer
                  original={result.original_code}
                  fixed={result.fixed_code}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}