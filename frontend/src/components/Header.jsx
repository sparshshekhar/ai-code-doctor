import { useState } from "react"
import { supabase } from "../supabase"
import AuthModal from "./AuthModal"

export default function Header({ user, onAuthChange }) {
  const [showAuth, setShowAuth] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onAuthChange(null)
  }

  return (
    <>
      <div className="border-b border-gray-800 px-8 py-4 flex items-center
        justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🩺</span>
          <div>
            <h1 className="text-xl font-bold text-white">AI Code Doctor</h1>
            <p className="text-xs text-gray-400">
              Paste broken code → Get it fixed instantly
            </p>
          </div>
        </div>

        {/* Auth buttons */}
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 border border-gray-700
                  px-3 py-1.5 rounded-lg hover:border-gray-500 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="text-sm bg-violet-600 hover:bg-violet-500 text-white
                px-4 py-1.5 rounded-lg transition font-semibold"
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => {
            setShowAuth(false)
          }}
        />
      )}
    </>
  )
}