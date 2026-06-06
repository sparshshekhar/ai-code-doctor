import { useState } from "react"
import { supabase } from "../supabase"

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email, password
        })
        if (error) throw error
        onClose()
      } else {
        const { error } = await supabase.auth.signUp({
          email, password
        })
        if (error) throw error
        setMessage("✅ Check your email to confirm your account!")
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  const handleApple = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center
      justify-center z-50 px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6
        w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">
            {mode === "login" ? "Welcome back 👋" : "Create account 🚀"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            ✕
          </button>
        </div>

        {/* Social buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3
              rounded-lg border border-gray-700 text-white text-sm
              hover:bg-gray-800 transition font-semibold"
          >
            <img
              src="https://www.google.com/favicon.ico"
              className="w-4 h-4"
            />
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="text-xs text-gray-500">or continue with email</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition
              ${mode === "login"
                ? "bg-violet-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition
              ${mode === "signup"
                ? "bg-violet-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
          >
            Sign Up
          </button>
        </div>

        {/* Email/Password form */}
        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-sm
              rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-sm
              rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
          />
        </div>

        {error && <p className="text-red-400 text-sm mt-3">⚠️ {error}</p>}
        {message && <p className="text-green-400 text-sm mt-3">{message}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          className="w-full mt-4 py-3 rounded-lg font-semibold text-sm
            bg-violet-600 hover:bg-violet-500 text-white transition
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "..." : mode === "login" ? "Login" : "Sign Up"}
        </button>

      </div>
    </div>
  )
}