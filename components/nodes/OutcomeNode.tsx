'use client'

import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { OutcomeNodeData } from '@/lib/types'

function OutcomeNode({ data, selected }: NodeProps) {
  const nodeData = data as OutcomeNodeData
  const { label, description, fundingReceived, fundingTarget, status } = nodeData

  const progress = fundingTarget > 0 ? Math.min(100, (fundingReceived / fundingTarget) * 100) : 0
  const isFunded = fundingReceived >= fundingTarget
  const isPartial = fundingReceived > 0 && fundingReceived < fundingTarget

  // Status colors
  const statusColors = {
    'not-started': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
    'in-progress': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    'completed': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
    'blocked': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  }

  const colors = statusColors[status] || statusColors['not-started']

  return (
    <div
      className={`
        bg-white rounded-lg shadow-lg border-2 min-w-[200px] max-w-[240px]
        transition-all duration-200
        ${selected ? 'border-pink-500 shadow-pink-200' : 'border-slate-200'}
      `}
    >
      {/* Input Handle - Top */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-4 !h-4 !bg-pink-500 !border-2 !border-white !-top-2"
      />

      {/* Header with icon */}
      <div className="px-3 py-2 border-b border-slate-100 bg-gradient-to-r from-pink-50 to-purple-50 rounded-t-md">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-pink-500 rounded flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-semibold text-slate-800 text-sm truncate">{label}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        {/* Description */}
        {description && (
          <p className="text-xs text-slate-500 line-clamp-2">{description}</p>
        )}

        {/* Status badge */}
        <div className="flex items-center justify-between">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${colors.bg} ${colors.text}`}>
            {status.replace('-', ' ')}
          </span>
          {isFunded && (
            <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Funding progress */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide">Funding</span>
            <span className="text-xs font-mono text-slate-700">
              ${Math.floor(fundingReceived).toLocaleString()} / ${fundingTarget.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isFunded ? 'bg-emerald-500' : isPartial ? 'bg-blue-500' : 'bg-slate-300'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-right mt-0.5">
            <span className="text-[10px] font-medium text-slate-500">{progress.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(OutcomeNode)
