export default function ErrorList({ errors, fixes }) {
  if (!errors?.length) return null

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest">
        🐛 Bugs Found & Fixed
      </h2>

      {errors.map((error, i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-700 bg-gray-900 p-4 flex flex-col gap-2"
        >
          {/* Error */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-red-900 text-red-300 px-2 py-0.5 rounded">
              Line {error.line}
            </span>
            <span className="text-sm font-semibold text-red-400">
              {error.type}
            </span>
          </div>
          <p className="text-sm text-gray-400">{error.description}</p>

          {/* Fix */}
          {fixes?.[i] && (
            <div className="mt-1 border-t border-gray-700 pt-2 flex flex-col gap-1">
              <p className="text-sm text-green-400">
                ✅ {fixes[i].what}
              </p>
              <p className="text-xs text-gray-500">
                {fixes[i].why}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}