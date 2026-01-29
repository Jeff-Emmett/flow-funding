'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface FundingFunnelProps {
  name: string
  currentBalance: number
  minThreshold: number
  maxThreshold: number
  inflowRate: number // per hour
  outflowRate: number // per hour
  maxCapacity?: number
  onMinThresholdChange?: (value: number) => void
  onMaxThresholdChange?: (value: number) => void
}

export default function FundingFunnel({
  name,
  currentBalance,
  minThreshold: initialMin,
  maxThreshold: initialMax,
  inflowRate,
  outflowRate,
  maxCapacity = 100000,
  onMinThresholdChange,
  onMaxThresholdChange,
}: FundingFunnelProps) {
  const [minThreshold, setMinThreshold] = useState(initialMin)
  const [maxThreshold, setMaxThreshold] = useState(initialMax)
  const [balance, setBalance] = useState(currentBalance)
  const [isDraggingMin, setIsDraggingMin] = useState(false)
  const [isDraggingMax, setIsDraggingMax] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Funnel dimensions
  const width = 300
  const height = 500
  const funnelTopWidth = 280
  const funnelNarrowWidth = 80
  const padding = 10

  // Calculate Y positions for thresholds (inverted - 0 is at bottom)
  const minY = height - (minThreshold / maxCapacity) * height
  const maxY = height - (maxThreshold / maxCapacity) * height
  const balanceY = height - (balance / maxCapacity) * height

  // Funnel shape points
  const funnelPath = `
    M ${padding} ${maxY}
    L ${padding} ${minY}
    L ${(width - funnelNarrowWidth) / 2} ${height - padding}
    L ${(width + funnelNarrowWidth) / 2} ${height - padding}
    L ${width - padding} ${minY}
    L ${width - padding} ${maxY}
    L ${padding} ${maxY}
  `

  // Overflow zone (above max)
  const overflowPath = `
    M ${padding} ${padding}
    L ${padding} ${maxY}
    L ${width - padding} ${maxY}
    L ${width - padding} ${padding}
    Z
  `

  // Calculate fill path based on current balance
  const getFillPath = () => {
    if (balance <= 0) return ''

    const fillY = Math.max(balanceY, padding)

    if (balance >= maxThreshold) {
      // Overflow zone - straight walls above max
      const overflowY = Math.max(fillY, padding)
      return `
        M ${padding} ${minY}
        L ${(width - funnelNarrowWidth) / 2} ${height - padding}
        L ${(width + funnelNarrowWidth) / 2} ${height - padding}
        L ${width - padding} ${minY}
        L ${width - padding} ${overflowY}
        L ${padding} ${overflowY}
        Z
      `
    } else if (balance >= minThreshold) {
      // Between min and max - straight walls
      return `
        M ${padding} ${minY}
        L ${(width - funnelNarrowWidth) / 2} ${height - padding}
        L ${(width + funnelNarrowWidth) / 2} ${height - padding}
        L ${width - padding} ${minY}
        L ${width - padding} ${fillY}
        L ${padding} ${fillY}
        Z
      `
    } else {
      // Below min - in the funnel narrowing section
      const ratio = balance / minThreshold
      const bottomWidth = funnelNarrowWidth
      const topWidth = funnelTopWidth - 2 * padding
      const currentWidth = bottomWidth + (topWidth - bottomWidth) * ratio
      const leftX = (width - currentWidth) / 2
      const rightX = (width + currentWidth) / 2

      return `
        M ${(width - funnelNarrowWidth) / 2} ${height - padding}
        L ${(width + funnelNarrowWidth) / 2} ${height - padding}
        L ${rightX} ${fillY}
        L ${leftX} ${fillY}
        Z
      `
    }
  }

  // Simulate balance changes
  useEffect(() => {
    const interval = setInterval(() => {
      setBalance((prev) => {
        const netFlow = (inflowRate - outflowRate) / 3600 // per second
        const newBalance = prev + netFlow
        return Math.max(0, Math.min(maxCapacity * 1.2, newBalance))
      })
    }, 100)
    return () => clearInterval(interval)
  }, [inflowRate, outflowRate, maxCapacity])

  // Handle threshold dragging
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const y = e.clientY - rect.top
      const value = Math.max(0, Math.min(maxCapacity, ((height - y) / height) * maxCapacity))

      if (isDraggingMin) {
        const newMin = Math.min(value, maxThreshold - 1000)
        setMinThreshold(Math.max(0, newMin))
        onMinThresholdChange?.(Math.max(0, newMin))
      } else if (isDraggingMax) {
        const newMax = Math.max(value, minThreshold + 1000)
        setMaxThreshold(Math.min(maxCapacity, newMax))
        onMaxThresholdChange?.(Math.min(maxCapacity, newMax))
      }
    },
    [isDraggingMin, isDraggingMax, maxThreshold, minThreshold, maxCapacity, onMinThresholdChange, onMaxThresholdChange]
  )

  const handleMouseUp = useCallback(() => {
    setIsDraggingMin(false)
    setIsDraggingMax(false)
  }, [])

  useEffect(() => {
    if (isDraggingMin || isDraggingMax) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDraggingMin, isDraggingMax, handleMouseMove, handleMouseUp])

  // Determine zone status
  const getZoneStatus = () => {
    if (balance < minThreshold) return { zone: 'critical', color: '#F43F5E', label: 'Below Minimum' }
    if (balance > maxThreshold) return { zone: 'overflow', color: '#F59E0B', label: 'Overflow' }
    return { zone: 'healthy', color: '#10B981', label: 'Healthy Range' }
  }

  const status = getZoneStatus()

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-bold text-white mb-2">{name}</h3>

      <div className="flex gap-8">
        {/* Main Funnel Visualization */}
        <div
          ref={containerRef}
          className="relative bg-slate-900 rounded-2xl p-4 border border-slate-700"
          style={{ width: width + 80, height: height + 40 }}
        >
          <svg width={width} height={height} className="overflow-visible">
            <defs>
              {/* Gradient for the fill */}
              <linearGradient id={`fill-gradient-${name}`} x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#EC4899" stopOpacity="0.7" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Wave pattern for liquid effect */}
              <pattern id="wave" x="0" y="0" width="20" height="10" patternUnits="userSpaceOnUse">
                <path
                  d="M0 5 Q5 0 10 5 T20 5"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>

            {/* Background zones */}
            {/* Overflow zone (above max) */}
            <rect
              x={padding}
              y={padding}
              width={width - 2 * padding}
              height={maxY - padding}
              fill="#F59E0B"
              fillOpacity="0.1"
              stroke="#F59E0B"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* Healthy zone (between min and max) - straight walls */}
            <rect
              x={padding}
              y={maxY}
              width={width - 2 * padding}
              height={minY - maxY}
              fill="#10B981"
              fillOpacity="0.1"
            />

            {/* Funnel zone (below min) */}
            <path
              d={`
                M ${padding} ${minY}
                L ${(width - funnelNarrowWidth) / 2} ${height - padding}
                L ${(width + funnelNarrowWidth) / 2} ${height - padding}
                L ${width - padding} ${minY}
                Z
              `}
              fill="#F43F5E"
              fillOpacity="0.1"
            />

            {/* Funnel outline */}
            <path
              d={`
                M ${padding} ${padding}
                L ${padding} ${minY}
                L ${(width - funnelNarrowWidth) / 2} ${height - padding}
                L ${(width + funnelNarrowWidth) / 2} ${height - padding}
                L ${width - padding} ${minY}
                L ${width - padding} ${padding}
              `}
              fill="none"
              stroke="#475569"
              strokeWidth="2"
            />

            {/* Fill (current balance) */}
            <path
              d={getFillPath()}
              fill={`url(#fill-gradient-${name})`}
              filter="url(#glow)"
            >
              <animate
                attributeName="opacity"
                values="0.8;1;0.8"
                dur="2s"
                repeatCount="indefinite"
              />
            </path>

            {/* Animated inflow particles */}
            {inflowRate > 0 && (
              <>
                {[...Array(5)].map((_, i) => (
                  <circle
                    key={`inflow-${i}`}
                    r="4"
                    fill="#3B82F6"
                    opacity="0.8"
                  >
                    <animate
                      attributeName="cy"
                      values={`-10;${balanceY}`}
                      dur={`${1 + i * 0.2}s`}
                      repeatCount="indefinite"
                      begin={`${i * 0.2}s`}
                    />
                    <animate
                      attributeName="cx"
                      values={`${width / 2 - 20 + i * 10};${width / 2 - 10 + i * 5}`}
                      dur={`${1 + i * 0.2}s`}
                      repeatCount="indefinite"
                      begin={`${i * 0.2}s`}
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0.8;0"
                      dur={`${1 + i * 0.2}s`}
                      repeatCount="indefinite"
                      begin={`${i * 0.2}s`}
                    />
                  </circle>
                ))}
              </>
            )}

            {/* Animated outflow particles */}
            {outflowRate > 0 && balance > 0 && (
              <>
                {[...Array(3)].map((_, i) => (
                  <circle
                    key={`outflow-${i}`}
                    r="3"
                    fill="#EC4899"
                    opacity="0.8"
                  >
                    <animate
                      attributeName="cy"
                      values={`${height - padding};${height + 30}`}
                      dur={`${0.8 + i * 0.15}s`}
                      repeatCount="indefinite"
                      begin={`${i * 0.25}s`}
                    />
                    <animate
                      attributeName="cx"
                      values={`${width / 2 - 10 + i * 10};${width / 2 - 15 + i * 15}`}
                      dur={`${0.8 + i * 0.15}s`}
                      repeatCount="indefinite"
                      begin={`${i * 0.25}s`}
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0.6;0"
                      dur={`${0.8 + i * 0.15}s`}
                      repeatCount="indefinite"
                      begin={`${i * 0.25}s`}
                    />
                  </circle>
                ))}
              </>
            )}

            {/* Max threshold line (draggable) */}
            <g
              className="cursor-ns-resize"
              onMouseDown={() => setIsDraggingMax(true)}
            >
              <line
                x1={0}
                y1={maxY}
                x2={width}
                y2={maxY}
                stroke="#F59E0B"
                strokeWidth={isDraggingMax ? 4 : 2}
                strokeDasharray="8 4"
              />
              <rect
                x={width - 8}
                y={maxY - 12}
                width={16}
                height={24}
                rx={4}
                fill="#F59E0B"
                className="cursor-ns-resize"
              />
              <text
                x={width + 12}
                y={maxY + 5}
                fill="#F59E0B"
                fontSize="12"
                fontFamily="monospace"
              >
                MAX ${maxThreshold.toLocaleString()}
              </text>
            </g>

            {/* Min threshold line (draggable) */}
            <g
              className="cursor-ns-resize"
              onMouseDown={() => setIsDraggingMin(true)}
            >
              <line
                x1={padding}
                y1={minY}
                x2={width - padding}
                y2={minY}
                stroke="#F43F5E"
                strokeWidth={isDraggingMin ? 4 : 2}
                strokeDasharray="8 4"
              />
              <rect
                x={width - 8}
                y={minY - 12}
                width={16}
                height={24}
                rx={4}
                fill="#F43F5E"
                className="cursor-ns-resize"
              />
              <text
                x={width + 12}
                y={minY + 5}
                fill="#F43F5E"
                fontSize="12"
                fontFamily="monospace"
              >
                MIN ${minThreshold.toLocaleString()}
              </text>
            </g>

            {/* Current balance indicator */}
            <g>
              <line
                x1={0}
                y1={balanceY}
                x2={padding - 2}
                y2={balanceY}
                stroke={status.color}
                strokeWidth={3}
              />
              <polygon
                points={`${padding - 2},${balanceY - 6} ${padding - 2},${balanceY + 6} ${padding + 6},${balanceY}`}
                fill={status.color}
              />
            </g>
          </svg>

          {/* Zone labels */}
          <div
            className="absolute text-xs text-amber-400/60 font-medium"
            style={{ right: 8, top: maxY / 2 + 20 }}
          >
            OVERFLOW
          </div>
          <div
            className="absolute text-xs text-emerald-400/60 font-medium"
            style={{ right: 8, top: (maxY + minY) / 2 + 20 }}
          >
            HEALTHY
          </div>
          <div
            className="absolute text-xs text-rose-400/60 font-medium"
            style={{ right: 8, top: (minY + height) / 2 + 10 }}
          >
            CRITICAL
          </div>
        </div>

        {/* Stats Panel */}
        <div className="flex flex-col gap-4 min-w-[200px]">
          {/* Current Balance */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Current Balance</div>
            <div className="text-3xl font-bold font-mono" style={{ color: status.color }}>
              ${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div
              className="text-sm mt-2 px-2 py-1 rounded-full inline-block"
              style={{ backgroundColor: `${status.color}20`, color: status.color }}
            >
              {status.label}
            </div>
          </div>

          {/* Flow Rates */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-sm text-slate-400 mb-3">Flow Rates</div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-slate-300">Inflow</span>
                </div>
                <span className="font-mono text-blue-400">+${inflowRate}/hr</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-500" />
                  <span className="text-slate-300">Outflow</span>
                </div>
                <span className="font-mono text-pink-400">-${outflowRate}/hr</span>
              </div>

              <div className="border-t border-slate-600 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Net Flow</span>
                  <span
                    className={`font-mono font-bold ${
                      inflowRate - outflowRate >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {inflowRate - outflowRate >= 0 ? '+' : ''}${inflowRate - outflowRate}/hr
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Thresholds */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-sm text-slate-400 mb-3">Thresholds</div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-rose-400">Minimum</span>
                  <span className="font-mono text-rose-400">${minThreshold.toLocaleString()}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Drag the red line to adjust
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-amber-400">Maximum</span>
                  <span className="font-mono text-amber-400">${maxThreshold.toLocaleString()}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Drag the yellow line to adjust
                </div>
              </div>
            </div>
          </div>

          {/* Progress to thresholds */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-sm text-slate-400 mb-3">Progress</div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">To Minimum</span>
                  <span className="text-slate-400">
                    {Math.min(100, (balance / minThreshold) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, (balance / minThreshold) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">To Maximum</span>
                  <span className="text-slate-400">
                    {Math.min(100, (balance / maxThreshold) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, (balance / maxThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
