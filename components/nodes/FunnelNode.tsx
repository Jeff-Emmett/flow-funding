'use client'

import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { FunnelNodeData } from '@/lib/types'

// Pie chart colors for spending (cool tones - going DOWN to outcomes)
const SPENDING_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#6366f1']
// Overflow colors (warm tones - going SIDEWAYS to other funnels)
const OVERFLOW_COLORS = ['#f59e0b', '#ef4444', '#f97316', '#eab308', '#dc2626', '#ea580c']

function FunnelNode({ data, selected, id }: NodeProps) {
  const nodeData = data as FunnelNodeData
  const { label, currentValue, maxCapacity, overflowAllocations = [], spendingAllocations = [] } = nodeData

  const [minThreshold, setMinThreshold] = useState(nodeData.minThreshold)
  const [maxThreshold, setMaxThreshold] = useState(nodeData.maxThreshold)
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editValues, setEditValues] = useState({
    minThreshold: nodeData.minThreshold,
    maxThreshold: nodeData.maxThreshold,
    label: label,
  })
  const sliderRef = useRef<HTMLDivElement>(null)

  // Calculate status
  const isOverflowing = currentValue > maxThreshold
  const isCritical = currentValue < minThreshold

  // Funnel dimensions
  const width = 200
  const height = 160
  const topWidth = 180
  const bottomWidth = 50
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

  // Double-click to edit
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setEditValues({
      minThreshold,
      maxThreshold,
      label,
    })
    setIsEditing(true)
  }, [minThreshold, maxThreshold, label])

  const handleSaveEdit = useCallback(() => {
    setMinThreshold(editValues.minThreshold)
    setMaxThreshold(editValues.maxThreshold)
    setIsEditing(false)
  }, [editValues])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
  }, [])

  // Pie chart calculations for SPENDING (downward to outcomes)
  const spendingPieRadius = 20
  const spendingPieCenter = { x: spendingPieRadius + 4, y: spendingPieRadius + 4 }

  const getSpendingPieSlices = () => {
    if (spendingAllocations.length === 0) return []

    let currentAngle = -90
    return spendingAllocations.map((alloc, idx) => {
      const angle = (alloc.percentage / 100) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle = endAngle

      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180

      const x1 = spendingPieCenter.x + spendingPieRadius * Math.cos(startRad)
      const y1 = spendingPieCenter.y + spendingPieRadius * Math.sin(startRad)
      const x2 = spendingPieCenter.x + spendingPieRadius * Math.cos(endRad)
      const y2 = spendingPieCenter.y + spendingPieRadius * Math.sin(endRad)

      const largeArc = angle > 180 ? 1 : 0

      return {
        path: `M ${spendingPieCenter.x} ${spendingPieCenter.y} L ${x1} ${y1} A ${spendingPieRadius} ${spendingPieRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
        color: alloc.color || SPENDING_COLORS[idx % SPENDING_COLORS.length],
        percentage: alloc.percentage,
        targetId: alloc.targetId,
      }
    })
  }

  // Mini bar chart for OVERFLOW (sideways to other funnels)
  const getOverflowBars = () => {
    return overflowAllocations.map((alloc, idx) => ({
      color: alloc.color || OVERFLOW_COLORS[idx % OVERFLOW_COLORS.length],
      percentage: alloc.percentage,
      targetId: alloc.targetId,
    }))
  }

  const spendingSlices = getSpendingPieSlices()
  const overflowBars = getOverflowBars()
  const hasOverflow = overflowAllocations.length > 0
  const hasSpending = spendingAllocations.length > 0

  return (
    <>
      <div
        className={`
          bg-white rounded-xl shadow-lg border-2 transition-all duration-200
          ${selected ? 'border-blue-500 shadow-blue-200' : 'border-slate-200'}
        `}
        style={{ width: width + 80 }}
        onDoubleClick={handleDoubleClick}
      >
        {/* Top Handle - Inflow from parent funnel overflow */}
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

        {/* Main content */}
        <div className="flex items-start p-2 gap-2">
          {/* Funnel SVG */}
          <svg width={width} height={height} className="flex-shrink-0">
            <defs>
              <linearGradient id={`fill-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isOverflowing ? '#fbbf24' : isCritical ? '#f87171' : '#34d399'} />
                <stop offset="100%" stopColor={isOverflowing ? '#f59e0b' : isCritical ? '#ef4444' : '#10b981'} />
              </linearGradient>
              <clipPath id={`clip-${id}`}>
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
            <g clipPath={`url(#clip-${id})`}>
              <rect x={0} y={balanceY} width={width} height={height} fill={`url(#fill-${id})`}>
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

            {/* Threshold zone indicator */}
            <rect x={rightTop + 4} y={maxY} width={6} height={minY - maxY} fill="#10b981" rx="2" />
            <line x1={rightTop + 2} y1={maxY} x2={rightTop + 12} y2={maxY} stroke="#f59e0b" strokeWidth="2" />
            <line x1={rightTop + 2} y1={minY} x2={rightTop + 12} y2={minY} stroke="#ef4444" strokeWidth="2" />

            {/* Overflow particles - flying to the sides */}
            {isOverflowing && (
              <>
                <circle r="4" fill="#f59e0b">
                  <animate attributeName="cx" values={`${leftTop + 20};${leftTop - 30}`} dur="0.6s" repeatCount="indefinite" />
                  <animate attributeName="cy" values={`${padding + 10};${padding + 30}`} dur="0.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0" dur="0.6s" repeatCount="indefinite" />
                </circle>
                <circle r="4" fill="#f59e0b">
                  <animate attributeName="cx" values={`${rightTop - 20};${rightTop + 30}`} dur="0.7s" repeatCount="indefinite" begin="0.15s" />
                  <animate attributeName="cy" values={`${padding + 10};${padding + 30}`} dur="0.7s" repeatCount="indefinite" begin="0.15s" />
                  <animate attributeName="opacity" values="1;0" dur="0.7s" repeatCount="indefinite" begin="0.15s" />
                </circle>
                <circle r="3" fill="#fbbf24">
                  <animate attributeName="cx" values={`${leftTop + 30};${leftTop - 25}`} dur="0.8s" repeatCount="indefinite" begin="0.3s" />
                  <animate attributeName="cy" values={`${padding + 15};${padding + 40}`} dur="0.8s" repeatCount="indefinite" begin="0.3s" />
                  <animate attributeName="opacity" values="1;0" dur="0.8s" repeatCount="indefinite" begin="0.3s" />
                </circle>
              </>
            )}

            {/* Spending flow particles - going down through the funnel */}
            {hasSpending && currentValue > minThreshold && (
              <>
                <circle r="3" fill="#3b82f6">
                  <animate attributeName="cx" values={`${width/2};${width/2}`} dur="1s" repeatCount="indefinite" />
                  <animate attributeName="cy" values={`${height - 30};${height + 10}`} dur="1s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0" dur="1s" repeatCount="indefinite" />
                </circle>
                <circle r="2" fill="#8b5cf6">
                  <animate attributeName="cx" values={`${width/2 - 5};${width/2 - 5}`} dur="1.2s" repeatCount="indefinite" begin="0.4s" />
                  <animate attributeName="cy" values={`${height - 30};${height + 10}`} dur="1.2s" repeatCount="indefinite" begin="0.4s" />
                  <animate attributeName="opacity" values="1;0" dur="1.2s" repeatCount="indefinite" begin="0.4s" />
                </circle>
              </>
            )}
          </svg>

          {/* Right side info */}
          <div className="flex flex-col gap-2 min-w-[60px]">
            {/* Spending pie chart (downward) */}
            {hasSpending && (
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-slate-500 uppercase tracking-wide mb-1">Spend</span>
                <svg width={spendingPieRadius * 2 + 8} height={spendingPieRadius * 2 + 8}>
                  {spendingSlices.map((slice, idx) => (
                    <path key={idx} d={slice.path} fill={slice.color} stroke="white" strokeWidth="1" />
                  ))}
                  <circle cx={spendingPieCenter.x} cy={spendingPieCenter.y} r={spendingPieRadius * 0.35} fill="white" />
                  <text x={spendingPieCenter.x} y={spendingPieCenter.y + 1} textAnchor="middle" dominantBaseline="middle" className="text-[8px] fill-slate-500">
                    ↓
                  </text>
                </svg>
              </div>
            )}

            {/* Overflow bars (sideways) */}
            {hasOverflow && (
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-amber-600 uppercase tracking-wide mb-1">Overflow</span>
                <div className="flex gap-0.5">
                  {overflowBars.map((bar, idx) => (
                    <div
                      key={idx}
                      className="w-2 rounded-sm"
                      style={{
                        backgroundColor: bar.color,
                        height: `${Math.max(8, bar.percentage / 5)}px`,
                      }}
                      title={`${bar.percentage}%`}
                    />
                  ))}
                </div>
                <span className="text-[8px] text-slate-400 mt-0.5">→ ←</span>
              </div>
            )}
          </div>
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
              <div
                className="absolute h-full bg-red-200"
                style={{ left: 0, width: `${(minThreshold / maxCapacity) * 100}%` }}
              />
              <div
                className="absolute h-full bg-emerald-300"
                style={{
                  left: `${(minThreshold / maxCapacity) * 100}%`,
                  width: `${((maxThreshold - minThreshold) / maxCapacity) * 100}%`
                }}
              />
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
          <div className="text-center mt-1">
            <span className="text-[9px] text-slate-400">Double-click to edit</span>
          </div>
        </div>

        {/* Bottom Handle - Spending outflow to outcomes */}
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-4 !h-4 !bg-pink-500 !border-2 !border-white !-bottom-2"
        />

        {/* Side Handles - Overflow to other funnels */}
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

        {/* Side Handles - Inflow from other funnel overflow */}
        <Handle
          type="target"
          position={Position.Left}
          id="inflow-left"
          className="!w-3 !h-3 !bg-amber-400 !border-2 !border-white"
          style={{ top: '40%' }}
        />
        <Handle
          type="target"
          position={Position.Right}
          id="inflow-right"
          className="!w-3 !h-3 !bg-amber-400 !border-2 !border-white"
          style={{ top: '40%' }}
        />
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handleCancelEdit}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-6 min-w-[320px] max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-800 mb-4">Edit {label}</h3>

            <div className="space-y-4">
              {/* Min Threshold */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Minimum Threshold
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={editValues.maxThreshold - 1000}
                    value={editValues.minThreshold}
                    onChange={(e) => setEditValues(v => ({ ...v, minThreshold: Number(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono text-red-600 w-20 text-right">
                    ${(editValues.minThreshold / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>

              {/* Max Threshold */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Maximum Threshold
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={editValues.minThreshold + 1000}
                    max={maxCapacity}
                    value={editValues.maxThreshold}
                    onChange={(e) => setEditValues(v => ({ ...v, maxThreshold: Number(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono text-amber-600 w-20 text-right">
                    ${(editValues.maxThreshold / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>

              {/* Visual preview */}
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-2">Threshold Range</div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-300"
                    style={{ width: `${(editValues.minThreshold / maxCapacity) * 100}%` }}
                  />
                  <div
                    className="h-full bg-emerald-400 -mt-3"
                    style={{
                      marginLeft: `${(editValues.minThreshold / maxCapacity) * 100}%`,
                      width: `${((editValues.maxThreshold - editValues.minThreshold) / maxCapacity) * 100}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0</span>
                  <span>${(maxCapacity / 1000).toFixed(0)}k</span>
                </div>
              </div>

              {/* Overflow allocations info */}
              {hasOverflow && (
                <div className="border-t border-slate-200 pt-3">
                  <div className="text-xs text-slate-500 mb-2">Overflow Allocations (to other funnels)</div>
                  <div className="space-y-1">
                    {overflowAllocations.map((alloc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: alloc.color || OVERFLOW_COLORS[idx] }}
                        />
                        <span className="text-slate-600">{alloc.targetId}</span>
                        <span className="text-amber-600 font-mono ml-auto">{alloc.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Spending allocations info */}
              {hasSpending && (
                <div className="border-t border-slate-200 pt-3">
                  <div className="text-xs text-slate-500 mb-2">Spending Allocations (to outcomes)</div>
                  <div className="space-y-1">
                    {spendingAllocations.map((alloc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: alloc.color || SPENDING_COLORS[idx] }}
                        />
                        <span className="text-slate-600">{alloc.targetId}</span>
                        <span className="text-blue-600 font-mono ml-auto">{alloc.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default memo(FunnelNode)
