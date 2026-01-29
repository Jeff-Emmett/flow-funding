'use client'

import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { FunnelNodeData } from '@/lib/types'

// Pie chart colors
const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']

function FunnelNode({ data, selected }: NodeProps) {
  const nodeData = data as FunnelNodeData
  const { label, currentValue, maxCapacity, outflowAllocations } = nodeData

  const [minThreshold, setMinThreshold] = useState(nodeData.minThreshold)
  const [maxThreshold, setMaxThreshold] = useState(nodeData.maxThreshold)
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Calculate status
  const isOverflowing = currentValue > maxThreshold
  const isCritical = currentValue < minThreshold

  // Funnel dimensions
  const width = 180
  const height = 160
  const topWidth = 160
  const bottomWidth = 40
  const padding = 8

  // Calculate Y positions
  const scaleY = (value: number) => padding + ((maxCapacity - value) / maxCapacity) * (height * 0.65)
  const maxY = scaleY(maxThreshold)
  const minY = scaleY(minThreshold)
  const funnelStartY = minY + 10
  const balanceY = Math.max(padding, scaleY(Math.min(currentValue, maxCapacity * 1.1)))

  // Funnel shape
  const leftTop = (width - topWidth) / 2
  const rightTop = (width + topWidth) / 2
  const leftBottom = (width - bottomWidth) / 2
  const rightBottom = (width + bottomWidth) / 2

  const clipPath = `
    M ${leftTop} ${padding}
    L ${rightTop} ${padding}
    L ${rightTop} ${funnelStartY}
    L ${rightBottom} ${height - padding - 10}
    L ${rightBottom} ${height - padding}
    L ${leftBottom} ${height - padding}
    L ${leftBottom} ${height - padding - 10}
    L ${leftTop} ${funnelStartY}
    Z
  `

  // Dual range slider logic
  const handleSliderMouseDown = useCallback((e: React.MouseEvent, type: 'min' | 'max') => {
    e.stopPropagation()
    setDragging(type)
  }, [])

  const handleSliderMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || !sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    const value = Math.round((x / rect.width) * maxCapacity)

    if (dragging === 'min') {
      setMinThreshold(Math.min(value, maxThreshold - 1000))
    } else {
      setMaxThreshold(Math.max(value, minThreshold + 1000))
    }
  }, [dragging, maxCapacity, minThreshold, maxThreshold])

  const handleSliderMouseUp = useCallback(() => {
    setDragging(null)
  }, [])

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleSliderMouseMove)
      window.addEventListener('mouseup', handleSliderMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleSliderMouseMove)
        window.removeEventListener('mouseup', handleSliderMouseUp)
      }
    }
  }, [dragging, handleSliderMouseMove, handleSliderMouseUp])

  // Pie chart calculations
  const pieRadius = 24
  const pieCenter = { x: pieRadius + 4, y: pieRadius + 4 }

  const getPieSlices = () => {
    if (outflowAllocations.length === 0) return []

    let currentAngle = -90 // Start at top
    return outflowAllocations.map((alloc, idx) => {
      const angle = (alloc.percentage / 100) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle = endAngle

      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180

      const x1 = pieCenter.x + pieRadius * Math.cos(startRad)
      const y1 = pieCenter.y + pieRadius * Math.sin(startRad)
      const x2 = pieCenter.x + pieRadius * Math.cos(endRad)
      const y2 = pieCenter.y + pieRadius * Math.sin(endRad)

      const largeArc = angle > 180 ? 1 : 0

      return {
        path: `M ${pieCenter.x} ${pieCenter.y} L ${x1} ${y1} A ${pieRadius} ${pieRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
        color: alloc.color || PIE_COLORS[idx % PIE_COLORS.length],
        percentage: alloc.percentage,
        targetId: alloc.targetId,
      }
    })
  }

  const pieSlices = getPieSlices()

  return (
    <div
      className={`
        bg-white rounded-xl shadow-lg border-2 transition-all duration-200
        ${selected ? 'border-blue-500 shadow-blue-200' : 'border-slate-200'}
      `}
      style={{ width: width + 100 }}
    >
      {/* Top Handle - Inflow */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-4 !h-4 !bg-blue-500 !border-2 !border-white !-top-2"
      />

      {/* Header */}
      <div className="px-3 py-2 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-800 text-sm">{label}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isOverflowing ? 'bg-amber-100 text-amber-700' :
            isCritical ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {isOverflowing ? 'OVERFLOW' : isCritical ? 'CRITICAL' : 'HEALTHY'}
          </span>
        </div>
      </div>

      {/* Main content - Funnel and Pie side by side */}
      <div className="flex items-start p-2 gap-2">
        {/* Funnel SVG */}
        <svg width={width} height={height} className="flex-shrink-0">
          <defs>
            <linearGradient id={`fill-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isOverflowing ? '#fbbf24' : isCritical ? '#f87171' : '#34d399'} />
              <stop offset="100%" stopColor={isOverflowing ? '#f59e0b' : isCritical ? '#ef4444' : '#10b981'} />
            </linearGradient>
            <clipPath id={`clip-${label}`}>
              <path d={clipPath} />
            </clipPath>
          </defs>

          {/* Zone backgrounds */}
          <rect x={leftTop} y={padding} width={topWidth} height={maxY - padding} fill="#fef3c7" />
          <rect x={leftTop} y={maxY} width={topWidth} height={funnelStartY - maxY} fill="#d1fae5" />
          <path
            d={`M ${leftTop} ${funnelStartY} L ${leftBottom} ${height - padding - 10} L ${rightBottom} ${height - padding - 10} L ${rightTop} ${funnelStartY} Z`}
            fill="#fee2e2"
          />

          {/* Liquid fill */}
          <g clipPath={`url(#clip-${label})`}>
            <rect x={0} y={balanceY} width={width} height={height} fill={`url(#fill-${label})`}>
              <animate attributeName="y" values={`${balanceY};${balanceY - 1};${balanceY}`} dur="2s" repeatCount="indefinite" />
            </rect>
          </g>

          {/* Funnel outline */}
          <path
            d={`M ${leftTop} ${padding} L ${leftTop} ${funnelStartY} L ${leftBottom} ${height - padding - 10} L ${leftBottom} ${height - padding}
                M ${rightBottom} ${height - padding} L ${rightBottom} ${height - padding - 10} L ${rightTop} ${funnelStartY} L ${rightTop} ${padding}`}
            fill="none" stroke="#64748b" strokeWidth="2"
          />
          <line x1={leftTop} y1={padding} x2={rightTop} y2={padding} stroke="#64748b" strokeWidth="2" />

          {/* Threshold zone indicator (single bar on right side) */}
          <rect x={rightTop + 4} y={maxY} width={6} height={minY - maxY} fill="#10b981" rx="2" />
          <line x1={rightTop + 2} y1={maxY} x2={rightTop + 12} y2={maxY} stroke="#f59e0b" strokeWidth="2" />
          <line x1={rightTop + 2} y1={minY} x2={rightTop + 12} y2={minY} stroke="#ef4444" strokeWidth="2" />

          {/* Overflow particles */}
          {isOverflowing && (
            <>
              <circle r="3" fill="#f59e0b">
                <animate attributeName="cx" values={`${leftTop};${leftTop - 20}`} dur="0.7s" repeatCount="indefinite" />
                <animate attributeName="cy" values={`${padding + 5};${padding + 40}`} dur="0.7s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0" dur="0.7s" repeatCount="indefinite" />
              </circle>
              <circle r="3" fill="#f59e0b">
                <animate attributeName="cx" values={`${rightTop};${rightTop + 20}`} dur="0.8s" repeatCount="indefinite" begin="0.2s" />
                <animate attributeName="cy" values={`${padding + 5};${padding + 40}`} dur="0.8s" repeatCount="indefinite" begin="0.2s" />
                <animate attributeName="opacity" values="1;0" dur="0.8s" repeatCount="indefinite" begin="0.2s" />
              </circle>
            </>
          )}
        </svg>

        {/* Pie chart for outflow allocation */}
        {outflowAllocations.length > 0 && (
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Outflow</span>
            <svg width={pieRadius * 2 + 8} height={pieRadius * 2 + 8}>
              {pieSlices.map((slice, idx) => (
                <path key={idx} d={slice.path} fill={slice.color} stroke="white" strokeWidth="1" />
              ))}
              <circle cx={pieCenter.x} cy={pieCenter.y} r={pieRadius * 0.4} fill="white" />
            </svg>
            {/* Mini legend */}
            <div className="mt-1 space-y-0.5">
              {outflowAllocations.slice(0, 3).map((alloc, idx) => (
                <div key={idx} className="flex items-center gap-1 text-[9px]">
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: alloc.color || PIE_COLORS[idx] }} />
                  <span className="text-slate-600 truncate max-w-[50px]">{alloc.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Value display */}
      <div className="px-3 py-1 text-center border-t border-slate-100">
        <span className={`text-lg font-bold font-mono ${
          isOverflowing ? 'text-amber-600' : isCritical ? 'text-red-600' : 'text-emerald-600'
        }`}>
          ${Math.floor(currentValue).toLocaleString()}
        </span>
      </div>

      {/* Dual range slider */}
      <div className="px-3 pb-3">
        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
          <span>MIN: <span className="text-red-600 font-mono">${(minThreshold/1000).toFixed(0)}k</span></span>
          <span>MAX: <span className="text-amber-600 font-mono">${(maxThreshold/1000).toFixed(0)}k</span></span>
        </div>
        <div
          ref={sliderRef}
          className="relative h-4 bg-slate-100 rounded-full cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Track background */}
          <div className="absolute inset-y-0 left-0 right-0 rounded-full overflow-hidden">
            {/* Red zone (0 to min) */}
            <div
              className="absolute h-full bg-red-200"
              style={{ left: 0, width: `${(minThreshold / maxCapacity) * 100}%` }}
            />
            {/* Green zone (min to max) */}
            <div
              className="absolute h-full bg-emerald-300"
              style={{
                left: `${(minThreshold / maxCapacity) * 100}%`,
                width: `${((maxThreshold - minThreshold) / maxCapacity) * 100}%`
              }}
            />
            {/* Amber zone (max to capacity) */}
            <div
              className="absolute h-full bg-amber-200"
              style={{ left: `${(maxThreshold / maxCapacity) * 100}%`, right: 0 }}
            />
          </div>

          {/* Min handle */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 border-2 border-white rounded-full shadow cursor-grab ${dragging === 'min' ? 'cursor-grabbing scale-110' : ''}`}
            style={{ left: `calc(${(minThreshold / maxCapacity) * 100}% - 8px)` }}
            onMouseDown={(e) => handleSliderMouseDown(e, 'min')}
          />

          {/* Max handle */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-500 border-2 border-white rounded-full shadow cursor-grab ${dragging === 'max' ? 'cursor-grabbing scale-110' : ''}`}
            style={{ left: `calc(${(maxThreshold / maxCapacity) * 100}% - 8px)` }}
            onMouseDown={(e) => handleSliderMouseDown(e, 'max')}
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
      <Handle
        type="source"
        position={Position.Left}
        id="overflow-left"
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white"
        style={{ top: '25%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="overflow-right"
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white"
        style={{ top: '25%' }}
      />
    </div>
  )
}

export default memo(FunnelNode)
