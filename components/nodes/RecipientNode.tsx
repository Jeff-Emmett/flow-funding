'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

export interface RecipientNodeData {
  label: string
  received: number
  incomingRate: number
  threshold: number
  isReceiving: boolean
}

function RecipientNode({ data }: NodeProps<RecipientNodeData>) {
  const { label, received, incomingRate, threshold, isReceiving } = data as RecipientNodeData
  const progress = Math.min((received / threshold) * 100, 100)
  const thresholdMet = received >= threshold

  return (
    <div className={`
      px-6 py-4 rounded-xl border-2 min-w-[200px]
      bg-gradient-to-br from-slate-800 to-slate-900
      ${thresholdMet ? 'border-emerald-500 shadow-lg shadow-emerald-500/20' :
        isReceiving ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-slate-600'}
      transition-all duration-300
    `}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-purple-500 border-2 border-slate-900"
      />

      <div className="flex items-center gap-3 mb-3">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-xl
          ${thresholdMet ? 'bg-emerald-500/20' : isReceiving ? 'bg-purple-500/20' : 'bg-slate-700'}
        `}>
          🎯
        </div>
        <div>
          <div className="font-semibold text-white">{label}</div>
          <div className="text-xs text-slate-400">Recipient</div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Received</span>
          <span className="text-white font-mono">
            ${received.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Rate</span>
          <span className={`font-mono ${isReceiving ? 'text-purple-400' : 'text-slate-500'}`}>
            +${incomingRate}/hr
          </span>
        </div>
      </div>

      {/* Threshold Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Threshold</span>
          <span className={thresholdMet ? 'text-emerald-400' : 'text-slate-400'}>
            {progress.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              thresholdMet ? 'bg-emerald-500' :
              progress > 75 ? 'bg-amber-500' : 'bg-purple-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1 text-slate-500">
          <span>${received.toLocaleString()}</span>
          <span>${threshold.toLocaleString()}</span>
        </div>
      </div>

      {thresholdMet && (
        <div className="mt-3 flex items-center gap-2 text-emerald-400 text-sm">
          <span>✓</span>
          <span>Threshold Met!</span>
        </div>
      )}

      {/* Optional: outgoing handle for cascading flows */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-emerald-500 border-2 border-slate-900"
      />
    </div>
  )
}

export default memo(RecipientNode)
