'use client'

import { memo } from 'react'
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react'

export interface AnimatedFlowEdgeData {
  flowRate: number
  isActive: boolean
  color?: string
}

function AnimatedFlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
}: EdgeProps<AnimatedFlowEdgeData>) {
  const { flowRate = 0, isActive = false, color = '#3B82F6' } = (data || {}) as AnimatedFlowEdgeData

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  // Calculate animation speed based on flow rate
  const animationDuration = Math.max(2 - (flowRate / 100), 0.5)

  return (
    <>
      {/* Background path */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: isActive ? color : '#475569',
          strokeWidth: isActive ? 3 : 2,
          strokeOpacity: isActive ? 0.3 : 0.5,
        }}
      />

      {/* Animated dashed overlay when active */}
      {isActive && (
        <path
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeDasharray="8 8"
          style={{
            animation: `flowAnimation ${animationDuration}s linear infinite`,
          }}
        />
      )}

      {/* Flow particles */}
      {isActive && (
        <>
          <circle r="4" fill={color}>
            <animateMotion
              dur={`${animationDuration}s`}
              repeatCount="indefinite"
              path={edgePath}
            />
          </circle>
          <circle r="4" fill={color}>
            <animateMotion
              dur={`${animationDuration}s`}
              repeatCount="indefinite"
              path={edgePath}
              begin={`${animationDuration / 3}s`}
            />
          </circle>
          <circle r="4" fill={color}>
            <animateMotion
              dur={`${animationDuration}s`}
              repeatCount="indefinite"
              path={edgePath}
              begin={`${(animationDuration / 3) * 2}s`}
            />
          </circle>
        </>
      )}

      {/* Flow rate label */}
      {isActive && flowRate > 0 && (
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2 - 10}
          textAnchor="middle"
          className="text-xs fill-slate-400 font-mono"
          style={{ fontSize: '10px' }}
        >
          ${flowRate}/hr
        </text>
      )}
    </>
  )
}

export default memo(AnimatedFlowEdge)
