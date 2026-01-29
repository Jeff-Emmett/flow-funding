'use client'

import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { FunnelNodeData, OutcomeNodeData } from '@/lib/types'

// Colors
const SPENDING_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#6366f1']
const OVERFLOW_COLORS = ['#f59e0b', '#ef4444', '#f97316', '#eab308', '#dc2626', '#ea580c']

function FunnelNode({ data, selected, id }: NodeProps) {
  const nodeData = data as FunnelNodeData
  const { label, currentValue, maxCapacity, overflowAllocations = [], spendingAllocations = [] } = nodeData

  const { getNode, setNodes, setEdges, getNodes } = useReactFlow()

  const [minThreshold, setMinThreshold] = useState(nodeData.minThreshold)
  const [maxThreshold, setMaxThreshold] = useState(nodeData.maxThreshold)
  const [isEditing, setIsEditing] = useState(false)
  const [draggingPie, setDraggingPie] = useState<{ type: 'overflow' | 'spending', index: number } | null>(null)
  const [localOverflow, setLocalOverflow] = useState(overflowAllocations)
  const [localSpending, setLocalSpending] = useState(spendingAllocations)
  const [showAddOutflow, setShowAddOutflow] = useState(false)
  const [showAddOutcome, setShowAddOutcome] = useState(false)
  const [newItemName, setNewItemName] = useState('')

  const sliderRef = useRef<HTMLDivElement>(null)
  const overflowPieRef = useRef<SVGSVGElement>(null)
  const spendingPieRef = useRef<SVGSVGElement>(null)

  // Calculate status
  const isOverflowing = currentValue > maxThreshold
  const isCritical = currentValue < minThreshold
  const fillPercent = Math.min(100, (currentValue / maxCapacity) * 100)

  // Simplified funnel dimensions
  const width = 140
  const height = 100
  const topWidth = 120
  const bottomWidth = 40

  // Double-click to edit
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setLocalOverflow([...overflowAllocations])
    setLocalSpending([...spendingAllocations])
    setIsEditing(true)
  }, [overflowAllocations, spendingAllocations])

  const handleCloseEdit = useCallback(() => {
    setIsEditing(false)
    setShowAddOutflow(false)
    setShowAddOutcome(false)
    setNewItemName('')
  }, [])

  // Threshold slider drag
  const [draggingThreshold, setDraggingThreshold] = useState<'min' | 'max' | null>(null)

  const handleThresholdMouseDown = useCallback((e: React.MouseEvent, type: 'min' | 'max') => {
    e.stopPropagation()
    setDraggingThreshold(type)
  }, [])

  useEffect(() => {
    if (!draggingThreshold || !sliderRef.current) return

    const handleMove = (e: MouseEvent) => {
      const rect = sliderRef.current!.getBoundingClientRect()
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
      const value = Math.round((x / rect.width) * maxCapacity)

      if (draggingThreshold === 'min') {
        setMinThreshold(Math.min(value, maxThreshold - 1000))
      } else {
        setMaxThreshold(Math.max(value, minThreshold + 1000))
      }
    }

    const handleUp = () => setDraggingThreshold(null)

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [draggingThreshold, maxCapacity, minThreshold, maxThreshold])

  // Pie chart drag editing
  useEffect(() => {
    if (!draggingPie) return

    const handleMove = (e: MouseEvent) => {
      const pieRef = draggingPie.type === 'overflow' ? overflowPieRef.current : spendingPieRef.current
      if (!pieRef) return

      const rect = pieRef.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI) + 90
      const normalizedAngle = ((angle % 360) + 360) % 360
      const percentage = Math.round((normalizedAngle / 360) * 100)

      if (draggingPie.type === 'overflow') {
        setLocalOverflow(prev => {
          const newAllocs = [...prev]
          if (newAllocs.length > 1) {
            const otherIdx = (draggingPie.index + 1) % newAllocs.length
            const newCurrent = Math.max(5, Math.min(95, percentage))
            newAllocs[draggingPie.index] = { ...newAllocs[draggingPie.index], percentage: newCurrent }
            newAllocs[otherIdx] = { ...newAllocs[otherIdx], percentage: 100 - newCurrent - newAllocs.filter((_, i) => i !== draggingPie.index && i !== otherIdx).reduce((s, a) => s + a.percentage, 0) }
          }
          return newAllocs
        })
      } else {
        setLocalSpending(prev => {
          const newAllocs = [...prev]
          if (newAllocs.length > 1) {
            const otherIdx = (draggingPie.index + 1) % newAllocs.length
            const newCurrent = Math.max(5, Math.min(95, percentage))
            newAllocs[draggingPie.index] = { ...newAllocs[draggingPie.index], percentage: newCurrent }
            newAllocs[otherIdx] = { ...newAllocs[otherIdx], percentage: 100 - newCurrent - newAllocs.filter((_, i) => i !== draggingPie.index && i !== otherIdx).reduce((s, a) => s + a.percentage, 0) }
          }
          return newAllocs
        })
      }
    }

    const handleUp = () => setDraggingPie(null)

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [draggingPie])

  // Add new outflow funnel
  const handleAddOutflow = useCallback(() => {
    if (!newItemName.trim()) return

    const currentNode = getNode(id)
    if (!currentNode) return

    const newId = `funnel-${Date.now()}`
    const newNodeData: FunnelNodeData = {
      label: newItemName,
      currentValue: 0,
      minThreshold: 10000,
      maxThreshold: 40000,
      maxCapacity: 50000,
      inflowRate: 0,
      overflowAllocations: [],
      spendingAllocations: [],
    }

    // Add new funnel node to the right
    setNodes((nodes) => [
      ...nodes,
      {
        id: newId,
        type: 'funnel',
        position: { x: currentNode.position.x + 250, y: currentNode.position.y },
        data: newNodeData,
      },
    ])

    // Add allocation to local state
    const newAllocation = {
      targetId: newId,
      percentage: localOverflow.length === 0 ? 100 : Math.floor(100 / (localOverflow.length + 1)),
      color: OVERFLOW_COLORS[localOverflow.length % OVERFLOW_COLORS.length],
    }

    // Redistribute percentages
    const newOverflow = localOverflow.map(a => ({
      ...a,
      percentage: Math.floor(a.percentage * localOverflow.length / (localOverflow.length + 1))
    }))
    newOverflow.push(newAllocation)

    setLocalOverflow(newOverflow)
    setShowAddOutflow(false)
    setNewItemName('')
  }, [newItemName, id, getNode, setNodes, localOverflow])

  // Add new outcome/deliverable
  const handleAddOutcome = useCallback(() => {
    if (!newItemName.trim()) return

    const currentNode = getNode(id)
    if (!currentNode) return

    const newId = `outcome-${Date.now()}`
    const newNodeData: OutcomeNodeData = {
      label: newItemName,
      description: '',
      fundingReceived: 0,
      fundingTarget: 20000,
      status: 'not-started',
    }

    // Add new outcome node below
    setNodes((nodes) => [
      ...nodes,
      {
        id: newId,
        type: 'outcome',
        position: { x: currentNode.position.x, y: currentNode.position.y + 300 },
        data: newNodeData,
      },
    ])

    // Add allocation to local state
    const newAllocation = {
      targetId: newId,
      percentage: localSpending.length === 0 ? 100 : Math.floor(100 / (localSpending.length + 1)),
      color: SPENDING_COLORS[localSpending.length % SPENDING_COLORS.length],
    }

    // Redistribute percentages
    const newSpending = localSpending.map(a => ({
      ...a,
      percentage: Math.floor(a.percentage * localSpending.length / (localSpending.length + 1))
    }))
    newSpending.push(newAllocation)

    setLocalSpending(newSpending)
    setShowAddOutcome(false)
    setNewItemName('')
  }, [newItemName, id, getNode, setNodes, localSpending])

  // Remove allocation
  const handleRemoveOutflow = useCallback((index: number) => {
    setLocalOverflow(prev => {
      const newAllocs = prev.filter((_, i) => i !== index)
      // Redistribute percentages
      if (newAllocs.length > 0) {
        const total = newAllocs.reduce((s, a) => s + a.percentage, 0)
        return newAllocs.map(a => ({ ...a, percentage: Math.round(a.percentage / total * 100) }))
      }
      return newAllocs
    })
  }, [])

  const handleRemoveSpending = useCallback((index: number) => {
    setLocalSpending(prev => {
      const newAllocs = prev.filter((_, i) => i !== index)
      // Redistribute percentages
      if (newAllocs.length > 0) {
        const total = newAllocs.reduce((s, a) => s + a.percentage, 0)
        return newAllocs.map(a => ({ ...a, percentage: Math.round(a.percentage / total * 100) }))
      }
      return newAllocs
    })
  }, [])

  // Pie chart rendering helper
  const renderPieChart = (allocations: typeof overflowAllocations, colors: string[], type: 'overflow' | 'spending', size: number) => {
    if (allocations.length === 0) return null

    const center = size / 2
    const radius = size / 2 - 4
    let currentAngle = -90

    return allocations.map((alloc, idx) => {
      const angle = (alloc.percentage / 100) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle = endAngle

      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180

      const x1 = center + radius * Math.cos(startRad)
      const y1 = center + radius * Math.sin(startRad)
      const x2 = center + radius * Math.cos(endRad)
      const y2 = center + radius * Math.sin(endRad)

      const largeArc = angle > 180 ? 1 : 0

      return (
        <path
          key={idx}
          d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
          fill={alloc.color || colors[idx % colors.length]}
          stroke="white"
          strokeWidth="2"
          className="cursor-grab hover:opacity-80"
          onMouseDown={(e) => {
            e.stopPropagation()
            setDraggingPie({ type, index: idx })
          }}
        />
      )
    })
  }

  // Simple bar representation for allocations
  const renderSimpleBars = (allocations: typeof overflowAllocations, colors: string[], direction: 'horizontal' | 'vertical') => {
    if (allocations.length === 0) return null

    return (
      <div className={`flex ${direction === 'horizontal' ? 'flex-row h-2' : 'flex-col w-2'} rounded overflow-hidden`}>
        {allocations.map((alloc, idx) => (
          <div
            key={idx}
            className="transition-all"
            style={{
              backgroundColor: alloc.color || colors[idx % colors.length],
              [direction === 'horizontal' ? 'width' : 'height']: `${alloc.percentage}%`,
            }}
          />
        ))}
      </div>
    )
  }

  const hasOverflow = overflowAllocations.length > 0
  const hasSpending = spendingAllocations.length > 0

  return (
    <>
      <div
        className={`
          bg-white rounded-xl shadow-lg border-2 transition-all duration-200
          ${selected ? 'border-blue-500 shadow-blue-200' : 'border-slate-200'}
          ${isEditing ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
        `}
        style={{ width: width + 40 }}
        onDoubleClick={handleDoubleClick}
      >
        {/* TOP Handle - INFLOWS */}
        <Handle
          type="target"
          position={Position.Top}
          className="!w-4 !h-4 !bg-emerald-500 !border-2 !border-white !-top-2"
        />

        {/* Header */}
        <div className="px-3 py-2 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 text-sm">{label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              isOverflowing ? 'bg-amber-100 text-amber-700' :
              isCritical ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isOverflowing ? 'OVER' : isCritical ? 'LOW' : 'OK'}
            </span>
          </div>
        </div>

        {/* Simplified Funnel View */}
        <div className="p-3">
          {/* Inflow indicator */}
          <div className="flex items-center justify-center gap-1 mb-2">
            <span className="text-[9px] text-emerald-600 uppercase">In</span>
            <svg className="w-3 h-3 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-8 8h5v8h6v-8h5z"/>
            </svg>
          </div>

          {/* Simple funnel shape with fill */}
          <svg width={width} height={height} className="mx-auto">
            <defs>
              <linearGradient id={`fill-${id}`} x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor={isOverflowing ? '#fbbf24' : isCritical ? '#f87171' : '#34d399'} />
                <stop offset="100%" stopColor={isOverflowing ? '#fde68a' : isCritical ? '#fca5a5' : '#6ee7b7'} />
              </linearGradient>
              <clipPath id={`funnel-${id}`}>
                <path d={`
                  M ${(width - topWidth) / 2} 0
                  L ${(width + topWidth) / 2} 0
                  L ${(width + bottomWidth) / 2} ${height}
                  L ${(width - bottomWidth) / 2} ${height}
                  Z
                `} />
              </clipPath>
            </defs>

            {/* Funnel background */}
            <path
              d={`
                M ${(width - topWidth) / 2} 0
                L ${(width + topWidth) / 2} 0
                L ${(width + bottomWidth) / 2} ${height}
                L ${(width - bottomWidth) / 2} ${height}
                Z
              `}
              fill="#f1f5f9"
              stroke="#94a3b8"
              strokeWidth="2"
            />

            {/* Fill level */}
            <g clipPath={`url(#funnel-${id})`}>
              <rect
                x={0}
                y={height - (height * fillPercent / 100)}
                width={width}
                height={height * fillPercent / 100}
                fill={`url(#fill-${id})`}
              >
                <animate
                  attributeName="y"
                  values={`${height - (height * fillPercent / 100)};${height - (height * fillPercent / 100) - 2};${height - (height * fillPercent / 100)}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
              </rect>
            </g>

            {/* Funnel outline */}
            <path
              d={`
                M ${(width - topWidth) / 2} 0
                L ${(width + topWidth) / 2} 0
                L ${(width + bottomWidth) / 2} ${height}
                L ${(width - bottomWidth) / 2} ${height}
                Z
              `}
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
            />
          </svg>

          {/* Value */}
          <div className="text-center mt-2">
            <span className={`text-base font-bold font-mono ${
              isOverflowing ? 'text-amber-600' : isCritical ? 'text-red-600' : 'text-emerald-600'
            }`}>
              ${Math.floor(currentValue / 1000)}k
            </span>
          </div>

          {/* Simplified allocation bars */}
          <div className="flex items-center justify-between mt-3 gap-2">
            {/* Outflow (sides) */}
            <div className="flex flex-col items-center flex-1">
              <span className="text-[8px] text-amber-600 uppercase mb-1">Out</span>
              {hasOverflow ? (
                renderSimpleBars(overflowAllocations, OVERFLOW_COLORS, 'horizontal')
              ) : (
                <div className="h-2 w-full bg-slate-100 rounded" />
              )}
            </div>

            {/* Outcomes (bottom) */}
            <div className="flex flex-col items-center flex-1">
              <span className="text-[8px] text-blue-600 uppercase mb-1">Spend</span>
              {hasSpending ? (
                renderSimpleBars(spendingAllocations, SPENDING_COLORS, 'horizontal')
              ) : (
                <div className="h-2 w-full bg-slate-100 rounded" />
              )}
            </div>
          </div>

          <div className="text-center mt-2">
            <span className="text-[8px] text-slate-400">Double-click to edit</span>
          </div>
        </div>

        {/* SIDE Handles - OUTFLOWS to other funnels */}
        <Handle
          type="source"
          position={Position.Left}
          id="outflow-left"
          className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white"
          style={{ top: '50%' }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="outflow-right"
          className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white"
          style={{ top: '50%' }}
        />

        {/* BOTTOM Handle - OUTCOMES/DELIVERABLES */}
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-4 !h-4 !bg-blue-500 !border-2 !border-white !-bottom-2"
        />
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handleCloseEdit}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 min-w-[480px] max-w-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">{label}</h3>
              <button
                onClick={handleCloseEdit}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Current Value Display */}
            <div className="text-center mb-4">
              <span className={`text-3xl font-bold font-mono ${
                isOverflowing ? 'text-amber-600' : isCritical ? 'text-red-600' : 'text-emerald-600'
              }`}>
                ${Math.floor(currentValue).toLocaleString()}
              </span>
              <span className="text-slate-400 text-sm ml-2">/ ${maxCapacity.toLocaleString()}</span>
            </div>

            {/* MIN/MAX Threshold Slider */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>MIN: <span className="text-red-600 font-mono font-medium">${(minThreshold/1000).toFixed(0)}k</span></span>
                <span>MAX: <span className="text-amber-600 font-mono font-medium">${(maxThreshold/1000).toFixed(0)}k</span></span>
              </div>
              <div
                ref={sliderRef}
                className="relative h-6 bg-slate-100 rounded-full cursor-pointer"
              >
                {/* Zone colors */}
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-red-200"
                    style={{ left: 0, width: `${(minThreshold / maxCapacity) * 100}%` }}
                  />
                  <div
                    className="absolute h-full bg-emerald-200"
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

                {/* Current value indicator */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-slate-800 rounded"
                  style={{ left: `${Math.min(100, (currentValue / maxCapacity) * 100)}%` }}
                />

                {/* Min handle */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 border-2 border-white rounded-full shadow-lg cursor-grab ${draggingThreshold === 'min' ? 'cursor-grabbing scale-110' : 'hover:scale-105'}`}
                  style={{ left: `calc(${(minThreshold / maxCapacity) * 100}% - 10px)` }}
                  onMouseDown={(e) => handleThresholdMouseDown(e, 'min')}
                />

                {/* Max handle */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-amber-500 border-2 border-white rounded-full shadow-lg cursor-grab ${draggingThreshold === 'max' ? 'cursor-grabbing scale-110' : 'hover:scale-105'}`}
                  style={{ left: `calc(${(maxThreshold / maxCapacity) * 100}% - 10px)` }}
                  onMouseDown={(e) => handleThresholdMouseDown(e, 'max')}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>$0</span>
                <span className="text-slate-600 font-medium">Drag handles to adjust</span>
                <span>${(maxCapacity/1000).toFixed(0)}k</span>
              </div>
            </div>

            {/* Allocations Section */}
            <div className="grid grid-cols-2 gap-4">
              {/* Outflows Column */}
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-amber-700">→ Outflows</span>
                  <button
                    onClick={() => setShowAddOutflow(true)}
                    className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center hover:bg-amber-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {localOverflow.length > 0 ? (
                  <>
                    <svg ref={overflowPieRef} width={100} height={100} className="mx-auto cursor-pointer">
                      {renderPieChart(localOverflow, OVERFLOW_COLORS, 'overflow', 100)}
                      <circle cx={50} cy={50} r={20} fill="white" />
                    </svg>
                    <div className="mt-3 space-y-1">
                      {localOverflow.map((alloc, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs group">
                          <div
                            className="w-3 h-3 rounded flex-shrink-0"
                            style={{ backgroundColor: alloc.color || OVERFLOW_COLORS[idx] }}
                          />
                          <span className="text-slate-600 truncate flex-1">{alloc.targetId}</span>
                          <span className="text-amber-600 font-mono">{alloc.percentage}%</span>
                          <button
                            onClick={() => handleRemoveOutflow(idx)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-amber-600/60 text-center py-4">No outflows yet</p>
                )}

                {/* Add Outflow Form */}
                {showAddOutflow && (
                  <div className="mt-3 p-2 bg-white rounded-lg border border-amber-200">
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="New funnel name..."
                      className="w-full text-xs px-2 py-1 border border-slate-200 rounded mb-2"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={handleAddOutflow}
                        className="flex-1 text-xs px-2 py-1 bg-amber-500 text-white rounded hover:bg-amber-600"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setShowAddOutflow(false); setNewItemName(''); }}
                        className="text-xs px-2 py-1 text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Spending/Outcomes Column */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-blue-700">↓ Outcomes</span>
                  <button
                    onClick={() => setShowAddOutcome(true)}
                    className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {localSpending.length > 0 ? (
                  <>
                    <svg ref={spendingPieRef} width={100} height={100} className="mx-auto cursor-pointer">
                      {renderPieChart(localSpending, SPENDING_COLORS, 'spending', 100)}
                      <circle cx={50} cy={50} r={20} fill="white" />
                    </svg>
                    <div className="mt-3 space-y-1">
                      {localSpending.map((alloc, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs group">
                          <div
                            className="w-3 h-3 rounded flex-shrink-0"
                            style={{ backgroundColor: alloc.color || SPENDING_COLORS[idx] }}
                          />
                          <span className="text-slate-600 truncate flex-1">{alloc.targetId}</span>
                          <span className="text-blue-600 font-mono">{alloc.percentage}%</span>
                          <button
                            onClick={() => handleRemoveSpending(idx)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-blue-600/60 text-center py-4">No outcomes yet</p>
                )}

                {/* Add Outcome Form */}
                {showAddOutcome && (
                  <div className="mt-3 p-2 bg-white rounded-lg border border-blue-200">
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="New outcome name..."
                      className="w-full text-xs px-2 py-1 border border-slate-200 rounded mb-2"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={handleAddOutcome}
                        className="flex-1 text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setShowAddOutcome(false); setNewItemName(''); }}
                        className="text-xs px-2 py-1 text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="text-center text-[10px] text-slate-400 mt-4">
              Drag pie slices to adjust • Click + to add new items
            </p>

            {/* Close button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleCloseEdit}
                className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default memo(FunnelNode)
