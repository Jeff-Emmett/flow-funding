'use client'

import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { RecipientNodeData } from '@/lib/types'

function RecipientNode({ data, selected }: NodeProps) {
  const { label, received, target } = data as RecipientNodeData
  const progress = Math.min(100, (received / target) * 100)
  const isFunded = received >= target

  return (
    <div
      className={`
        bg-white rounded-lg shadow-lg border-2 min-w-[180px]
        transition-all duration-200
        ${selected ? 'border-emerald-500 shadow-emerald-100' : 'border-slate-200'}
      `}
    >
      {/* Input Handle - Top for vertical flow */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-4 !h-4 !bg-pink-500 !border-2 !border-white !-top-2"
      />

      {/* Header */}
      <div className={`px-4 py-2 rounded-t-md bg-gradient-to-r ${
        isFunded ? 'from-emerald-500 to-emerald-600' : 'from-slate-500 to-slate-600'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-white font-medium text-sm">{label}</span>
          {isFunded && (
            <svg className="w-4 h-4 text-white ml-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-xs uppercase tracking-wide">Received</span>
          <span className="font-mono font-semibold text-slate-800">
            ${Math.floor(received).toLocaleString()}
          </span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-500 text-xs">Progress</span>
            <span className="text-xs font-medium text-slate-600">{progress.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isFunded ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <span className="text-slate-500 text-xs uppercase tracking-wide">Target</span>
          <span className="font-mono text-slate-600">
            ${target.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

export default memo(RecipientNode)
