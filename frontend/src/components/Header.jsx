export default function Header() {
  return (
    <div className="border-b border-gray-800 px-8 py-4 flex items-center gap-3">
      <span className="text-2xl">🩺</span>
      <div>
        <h1 className="text-xl font-bold text-white">AI Code Doctor</h1>
        <p className="text-xs text-gray-400">Paste broken code → Get it fixed instantly</p>
      </div>
    </div>
  )
}