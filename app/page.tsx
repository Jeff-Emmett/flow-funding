'use client'

import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with React Flow
const FlowCanvas = dynamic(() => import('@/components/FlowCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-950">
      <div className="text-slate-400 animate-pulse">Loading flow visualization...</div>
    </div>
  ),
})

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-slate-900/80 backdrop-blur border-b border-slate-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
              Flow Funding
            </h1>
            <span className="text-xs text-slate-500 border border-slate-700 px-2 py-0.5 rounded">
              TBFF Demo
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-3 py-1.5 text-sm text-slate-300 hover:text-white transition">
              Reset
            </button>
            <button className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition">
              + Add Node
            </button>
          </div>
        </div>
      </header>

      {/* Flow Canvas */}
      <div className="pt-16 h-full">
        <FlowCanvas />
      </div>
    </main>
  )
}
