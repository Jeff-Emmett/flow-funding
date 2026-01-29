'use client'

import { memo, useState, useCallback } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { ThresholdNodeData } from '@/lib/types'

function ThresholdNode({ data, selected }: NodeProps) {
  const nodeData = data as ThresholdNodeData
  const [minThreshold, setMinThreshold] = useState(nodeData.minThreshold)
  const [maxThreshold, setMaxThreshold] = useState(nodeData.maxThreshold)
  const currentValue = nodeData.currentValue

  // Calculate status
  const getStatus = () => {
    if (currentValue < minThreshold) return { label: 'Below Min', color: 'red', bg: 'bg-red-500' }
    if (currentValue > maxThreshold) return { label: 'Overflow', color: 'amber', bg: 'bg-amber-500' }
    return { label: 'Active', color: 'green', bg: 'bg-emerald-500' }
  }

  const status = getStatus()
  const fillPercent = Math.min(100, Math.max(0, ((currentValue - minThreshold) / (maxThreshold - minThreshold)) * 100))

  return (
    <div
      className={`
        bg-white rounded-lg shadow-lg border-2 min-w-[240px]
        transition-all duration-200
        ${selected ? 'border-purple-500 shadow-purple-100' : 'border-slate-200'}
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white"
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2 rounded-t-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <span className="text-white font-medium text-sm">{nodeData.label}</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${status.bg}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Current Value Display */}
        <div className="text-center">
          <span className="text-2xl font-bold font-mono text-slate-800">
            ${currentValue.toLocaleString()}
          </span>
          <p className="text-xs text-slate-500 mt-1">Current Value</p>
        </div>

        {/* Visual Bar */}
        <div className="relative">
          <div className="h-8 bg-slate-100 rounded-lg overflow-hidden relative">
            {/* Fill */}
            <div
              className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                currentValue < minThreshold ? 'bg-red-400' :
                currentValue > maxThreshold ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{
                width: currentValue < minThreshold
                  ? `${(currentValue / minThreshold) * 33}%`
                  : currentValue > maxThreshold
                  ? '100%'
                  : `${33 + fillPercent * 0.67}%`
              }}
            />
            {/* Min marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500"
              style={{ left: '33%' }}
            />
            {/* Max marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-500"
              style={{ left: '100%', transform: 'translateX(-2px)' }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-slate-500">
            <span>$0</span>
            <span className="text-red-500">Min</span>
            <span className="text-amber-500">Max</span>
          </div>
        </div>

        {/* Threshold Controls */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-slate-500 uppercase tracking-wide">Min Threshold</label>
              <span className="font-mono text-sm text-red-600">${minThreshold.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max={maxThreshold - 1000}
              value={minThreshold}
              onChange={(e) => setMinThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-slate-500 uppercase tracking-wide">Max Threshold</label>
              <span className="font-mono text-sm text-amber-600">${maxThreshold.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={minThreshold + 1000}
              max="100000"
              value={maxThreshold}
              onChange={(e) => setMaxThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white"
      />
    </div>
  )
}

export default memo(ThresholdNode)
