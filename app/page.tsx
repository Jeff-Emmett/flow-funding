'use client'

import dynamic from 'next/dynamic'

const FlowCanvas = dynamic(() => import('@/components/FlowCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-600">Loading flow editor...</span>
      </div>
    </div>
  ),
})

export default function Home() {
  return (
    <main className="h-screen w-screen">
      <FlowCanvas />
    </main>
  )
}
