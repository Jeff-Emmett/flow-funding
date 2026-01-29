'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

export interface ThresholdGateData {
  threshold: number
  currentValue: number
  label?: string
}

function ThresholdGate({ data }: NodeProps<ThresholdGateData>) {
  const { threshold, currentValue, label } = data as ThresholdGateData
  const isOpen = currentValue >= threshold
  const progress = Math.min((currentValue / threshold) * 100, 100)

  return (
    <div className={`
      relative px-4 py-3 rounded-lg border-2 min-w-[120px]
      bg-slate-900/90 backdrop-blur
      ${isOpen ? 'border-emerald-500' : progress > 75 ? 'border-amber-500' : 'border-rose-500'}
      transition-all duration-300
    `}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 border-2 border-slate-900"
      />

      {/* Gate Icon */}
      <div className="flex flex-col items-center">
        <div className={`
          text-2xl mb-1 transition-transform duration-300
          ${isOpen ? 'scale-110' : 'scale-100'}
        `}>
          {isOpen ? '🔓' : progress > 75 ? '⚠️' : '🔒'}
        </div>

        {label && (
          <div className="text-xs text-slate-400 mb-2">{label}</div>
        )}

        {/* Mini threshold meter */}
        <div className="w-full">
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isOpen ? 'bg-emerald-500' :
                progress > 75 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-2 text-center">
          <div className={`text-xs font-mono ${
            isOpen ? 'text-emerald-400' : 'text-slate-400'
          }`}>
            ${currentValue.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">
            / ${threshold.toLocaleString()}
          </div>
        </div>

        <div className={`
          mt-2 text-xs px-2 py-0.5 rounded-full
          ${isOpen ? 'bg-emerald-500/20 text-emerald-400' :
            progress > 75 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}
        `}>
          {isOpen ? 'OPEN' : progress > 75 ? 'NEAR' : 'LOCKED'}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-emerald-500 border-2 border-slate-900"
      />
    </div>
  )
}

export default memo(ThresholdGate)
