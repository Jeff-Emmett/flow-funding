'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const FundingFunnel = dynamic(() => import('@/components/FundingFunnel'), {
  ssr: false,
  loading: () => (
    <div className="w-[500px] h-[600px] flex items-center justify-center bg-slate-900 rounded-2xl">
      <div className="text-slate-400 animate-pulse">Loading visualization...</div>
    </div>
  ),
})

export default function Home() {
  const [view, setView] = useState<'single' | 'multi'>('single')

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Threshold-Based Flow Funding
            </h1>
            <p className="text-slate-400 mt-2">
              Interactive visualization of funding flows with minimum and maximum thresholds
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('single')}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                view === 'single'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Single Funnel
            </button>
            <button
              onClick={() => setView('multi')}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                view === 'multi'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Multi-Funnel
            </button>
          </div>
        </div>
      </header>

      {/* Legend */}
      <div className="mb-8 flex items-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-500/30 border border-rose-500" />
          <span className="text-slate-400">Critical Zone (below min)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500/30 border border-emerald-500" />
          <span className="text-slate-400">Healthy Zone (min to max)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500/30 border border-amber-500" />
          <span className="text-slate-400">Overflow Zone (above max)</span>
        </div>
      </div>

      {/* Funnel Visualizations */}
      {view === 'single' ? (
        <div className="flex justify-center">
          <FundingFunnel
            name="Community Treasury"
            currentBalance={35000}
            minThreshold={20000}
            maxThreshold={80000}
            inflowRate={500}
            outflowRate={300}
            maxCapacity={100000}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
          <FundingFunnel
            name="Public Goods Fund"
            currentBalance={45000}
            minThreshold={25000}
            maxThreshold={75000}
            inflowRate={400}
            outflowRate={350}
            maxCapacity={100000}
          />
          <FundingFunnel
            name="Research Grant Pool"
            currentBalance={12000}
            minThreshold={30000}
            maxThreshold={60000}
            inflowRate={200}
            outflowRate={150}
            maxCapacity={80000}
          />
          <FundingFunnel
            name="Emergency Reserve"
            currentBalance={85000}
            minThreshold={50000}
            maxThreshold={70000}
            inflowRate={300}
            outflowRate={100}
            maxCapacity={100000}
          />
        </div>
      )}

      {/* Instructions */}
      <div className="mt-12 max-w-2xl mx-auto">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-rose-400 font-bold">1.</span>
              <span>
                <strong className="text-rose-400">Minimum Threshold</strong> — Below this level,
                the funnel narrows, restricting outflow. Funds are conserved until the minimum is reached.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 font-bold">2.</span>
              <span>
                <strong className="text-emerald-400">Healthy Range</strong> — Between min and max,
                the funnel has straight walls. Normal operations with balanced in/out flows.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400 font-bold">3.</span>
              <span>
                <strong className="text-amber-400">Maximum Threshold</strong> — Above this level,
                excess funds overflow and can be redistributed to other pools or purposes.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">↕</span>
              <span>
                <strong className="text-purple-400">Drag the threshold lines</strong> to adjust
                minimum and maximum levels interactively.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
