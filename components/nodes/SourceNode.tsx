'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

export interface SourceNodeData {
  label: string
  balance: number
  flowRate: number
  isActive: boolean
}

function SourceNode({ data }: NodeProps<SourceNodeData>) {
  const { label, balance, flowRate, isActive } = data as SourceNodeData

  return (
    <div className={`
      px-6 py-4 rounded-xl border-2 min-w-[180px]
      bg-gradient-to-br from-slate-800 to-slate-900
      ${isActive ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-slate-600'}
      transition-all duration-300
    `}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-xl
          ${isActive ? 'bg-blue-500/20' : 'bg-slate-700'}
        `}>
          💰
        </div>
        <div>
          <div className="font-semibold text-white">{label}</div>
          <div className="text-xs text-slate-400">Source</div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Balance</span>
          <span className="text-white font-mono">
            ${balance.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Flow Rate</span>
          <span className={`font-mono ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
            ${flowRate}/hr
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
          <span className={isActive ? 'text-emerald-400' : 'text-slate-500'}>
            {isActive ? 'Flowing' : 'Inactive'}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-slate-900"
      />
    </div>
  )
}

export default memo(SourceNode)
