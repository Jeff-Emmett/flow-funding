'use client'

import { memo, useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { ThresholdNodeData } from '@/lib/types'

function ThresholdNode({ data, selected }: NodeProps) {
  const nodeData = data as ThresholdNodeData
  const [minThreshold, setMinThreshold] = useState(nodeData.minThreshold)
  const [maxThreshold, setMaxThreshold] = useState(nodeData.maxThreshold)
  const currentValue = nodeData.currentValue
  const maxCapacity = 100000

  // Calculate status
  const isOverflowing = currentValue > maxThreshold
  const isCritical = currentValue < minThreshold
  const isHealthy = !isOverflowing && !isCritical

  // Funnel dimensions
  const width = 160
  const height = 200
  const topWidth = 140
  const bottomWidth = 30
  const padding = 10

  // Calculate Y positions for thresholds and fill
  const maxY = padding + ((maxCapacity - maxThreshold) / maxCapacity) * (height * 0.6)
  const minY = padding + ((maxCapacity - minThreshold) / maxCapacity) * (height * 0.6)
  const funnelStartY = minY + 15
  const balanceY = Math.max(padding, padding + ((maxCapacity - Math.min(currentValue, maxCapacity * 1.1)) / maxCapacity) * (height * 0.6))

  // Funnel shape calculations
  const leftTop = (width - topWidth) / 2
  const rightTop = (width + topWidth) / 2
  const leftBottom = (width - bottomWidth) / 2
  const rightBottom = (width + bottomWidth) / 2

  // Clip path for liquid fill
  const clipPath = `
    M ${leftTop} ${padding}
    L ${rightTop} ${padding}
    L ${rightTop} ${funnelStartY}
    L ${rightBottom} ${height - padding - 15}
    L ${rightBottom} ${height - padding}
    L ${leftBottom} ${height - padding}
    L ${leftBottom} ${height - padding - 15}
    L ${leftTop} ${funnelStartY}
    Z
  `

  return (
    <div
      className={`
        bg-white rounded-xl shadow-lg border-2 transition-all duration-200
        ${selected ? 'border-purple-500 shadow-purple-200' : 'border-slate-200'}
      `}
      style={{ width: width + 80, padding: '12px' }}
    >
      {/* Top Handle - Inflow */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-4 !h-4 !bg-blue-500 !border-2 !border-white !-top-2"
      />

      {/* Header */}
      <div className="text-center mb-2">
        <div className="font-semibold text-slate-800 text-sm">{nodeData.label}</div>
        <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
          isOverflowing ? 'bg-amber-100 text-amber-700' :
          isCritical ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {isOverflowing ? 'OVERFLOW' : isCritical ? 'CRITICAL' : 'HEALTHY'}
        </div>
      </div>

      {/* Funnel SVG */}
      <svg width={width} height={height} className="mx-auto overflow-visible">
        <defs>
          <linearGradient id={`fill-${nodeData.label}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isOverflowing ? '#fbbf24' : isCritical ? '#f87171' : '#34d399'} />
            <stop offset="100%" stopColor={isOverflowing ? '#f59e0b' : isCritical ? '#ef4444' : '#10b981'} />
          </linearGradient>
          <clipPath id={`clip-${nodeData.label}`}>
            <path d={clipPath} />
          </clipPath>
        </defs>

        {/* Zone backgrounds */}
        {/* Overflow zone */}
        <rect
          x={leftTop}
          y={padding}
          width={topWidth}
          height={maxY - padding}
          fill="#fef3c7"
          rx="2"
        />
        {/* Healthy zone */}
        <rect
          x={leftTop}
          y={maxY}
          width={topWidth}
          height={funnelStartY - maxY}
          fill="#d1fae5"
        />
        {/* Critical zone (funnel part) */}
        <path
          d={`
            M ${leftTop} ${funnelStartY}
            L ${leftBottom} ${height - padding - 15}
            L ${rightBottom} ${height - padding - 15}
            L ${rightTop} ${funnelStartY}
            Z
          `}
          fill="#fee2e2"
        />

        {/* Liquid fill */}
        <g clipPath={`url(#clip-${nodeData.label})`}>
          <rect
            x={0}
            y={balanceY}
            width={width}
            height={height}
            fill={`url(#fill-${nodeData.label})`}
          >
            <animate
              attributeName="y"
              values={`${balanceY};${balanceY - 1};${balanceY}`}
              dur="1.5s"
              repeatCount="indefinite"
            />
          </rect>
        </g>

        {/* Funnel outline */}
        <path
          d={`
            M ${leftTop} ${padding}
            L ${leftTop} ${funnelStartY}
            L ${leftBottom} ${height - padding - 15}
            L ${leftBottom} ${height - padding}
            M ${rightBottom} ${height - padding}
            L ${rightBottom} ${height - padding - 15}
            L ${rightTop} ${funnelStartY}
            L ${rightTop} ${padding}
          `}
          fill="none"
          stroke="#64748b"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Top line */}
        <line x1={leftTop} y1={padding} x2={rightTop} y2={padding} stroke="#64748b" strokeWidth="2" />

        {/* MAX line */}
        <line
          x1={leftTop - 5}
          y1={maxY}
          x2={rightTop + 5}
          y2={maxY}
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
        <text x={rightTop + 8} y={maxY + 3} fill="#f59e0b" fontSize="9" fontWeight="500">MAX</text>

        {/* MIN line */}
        <line
          x1={leftTop - 5}
          y1={minY}
          x2={rightTop + 5}
          y2={minY}
          stroke="#ef4444"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
        <text x={rightTop + 8} y={minY + 3} fill="#ef4444" fontSize="9" fontWeight="500">MIN</text>

        {/* Overflow particles */}
        {isOverflowing && (
          <>
            <circle r="3" fill="#f59e0b">
              <animate attributeName="cx" values={`${leftTop};${leftTop - 25}`} dur="0.8s" repeatCount="indefinite" />
              <animate attributeName="cy" values={`${padding + 5};${padding + 50}`} dur="0.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0" dur="0.8s" repeatCount="indefinite" />
            </circle>
            <circle r="3" fill="#f59e0b">
              <animate attributeName="cx" values={`${rightTop};${rightTop + 25}`} dur="0.9s" repeatCount="indefinite" begin="0.3s" />
              <animate attributeName="cy" values={`${padding + 5};${padding + 50}`} dur="0.9s" repeatCount="indefinite" begin="0.3s" />
              <animate attributeName="opacity" values="1;0" dur="0.9s" repeatCount="indefinite" begin="0.3s" />
            </circle>
          </>
        )}
      </svg>

      {/* Value display */}
      <div className="text-center mt-2">
        <div className={`text-xl font-bold font-mono ${
          isOverflowing ? 'text-amber-600' : isCritical ? 'text-red-600' : 'text-emerald-600'
        }`}>
          ${Math.floor(currentValue).toLocaleString()}
        </div>
      </div>

      {/* Threshold sliders */}
      <div className="mt-3 space-y-2 px-2">
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Min</span>
            <span className="font-mono text-red-600">${minThreshold.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="0"
            max={maxThreshold - 1000}
            value={minThreshold}
            onChange={(e) => setMinThreshold(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Max</span>
            <span className="font-mono text-amber-600">${maxThreshold.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={minThreshold + 1000}
            max="100000"
            value={maxThreshold}
            onChange={(e) => setMaxThreshold(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>

      {/* Bottom Handle - Outflow */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-4 !h-4 !bg-pink-500 !border-2 !border-white !-bottom-2"
      />

      {/* Side Handles - Overflow */}
      {isOverflowing && (
        <>
          <Handle
            type="source"
            position={Position.Left}
            id="overflow-left"
            className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white"
            style={{ top: '30%' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="overflow-right"
            className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white"
            style={{ top: '30%' }}
          />
        </>
      )}
    </div>
  )
}

export default memo(ThresholdNode)
