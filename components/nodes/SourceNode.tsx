'use client'

import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { SourceNodeData } from '@/lib/types'

function SourceNode({ data, selected }: NodeProps) {
  const { label, balance, flowRate } = data as SourceNodeData

  return (
    <div
      className={`
        bg-white rounded-lg shadow-lg border-2 min-w-[200px]
        transition-all duration-200
        ${selected ? 'border-blue-500 shadow-blue-100' : 'border-slate-200'}
      `}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 rounded-t-md">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-white font-medium text-sm">{label}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-xs uppercase tracking-wide">Balance</span>
          <span className="font-mono font-semibold text-slate-800">
            ${balance.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-xs uppercase tracking-wide">Flow Rate</span>
          <span className="font-mono text-blue-600">
            ${flowRate}/hr
          </span>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />
    </div>
  )
}

export default memo(SourceNode)
