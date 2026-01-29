'use client'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
          Flow Funding
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl">
          Visual interactive interface for threshold-based flow funding mechanisms
        </p>
        <div className="mt-8 p-8 rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur">
          <p className="text-slate-400">
            Interactive visualization coming soon...
          </p>
        </div>
      </div>
    </main>
  )
}
