'use client'

import { useCallback, useState, useEffect } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import FunnelNode from './nodes/FunnelNode'
import type { FlowNode, FlowEdge, FunnelNodeData } from '@/lib/types'

const nodeTypes = {
  funnel: FunnelNode,
}

// Color palette for allocations
const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']

const initialNodes: FlowNode[] = [
  {
    id: 'treasury',
    type: 'funnel',
    position: { x: 400, y: 0 },
    data: {
      label: 'Treasury',
      currentValue: 85000,
      minThreshold: 20000,
      maxThreshold: 70000,
      maxCapacity: 100000,
      inflowRate: 1000,
      outflowAllocations: [
        { targetId: 'public-goods', percentage: 40, color: COLORS[0] },
        { targetId: 'research', percentage: 35, color: COLORS[1] },
        { targetId: 'emergency', percentage: 25, color: COLORS[2] },
      ],
    },
  },
  {
    id: 'public-goods',
    type: 'funnel',
    position: { x: 100, y: 350 },
    data: {
      label: 'Public Goods',
      currentValue: 45000,
      minThreshold: 15000,
      maxThreshold: 50000,
      maxCapacity: 70000,
      inflowRate: 400,
      outflowAllocations: [
        { targetId: 'project-alpha', percentage: 60, color: COLORS[0] },
        { targetId: 'project-beta', percentage: 40, color: COLORS[1] },
      ],
    },
  },
  {
    id: 'research',
    type: 'funnel',
    position: { x: 400, y: 350 },
    data: {
      label: 'Research',
      currentValue: 28000,
      minThreshold: 20000,
      maxThreshold: 45000,
      maxCapacity: 60000,
      inflowRate: 350,
      outflowAllocations: [
        { targetId: 'project-gamma', percentage: 70, color: COLORS[0] },
        { targetId: 'project-beta', percentage: 30, color: COLORS[1] },
      ],
    },
  },
  {
    id: 'emergency',
    type: 'funnel',
    position: { x: 700, y: 350 },
    data: {
      label: 'Emergency',
      currentValue: 12000,
      minThreshold: 25000,
      maxThreshold: 60000,
      maxCapacity: 80000,
      inflowRate: 250,
      outflowAllocations: [
        { targetId: 'reserve', percentage: 100, color: COLORS[0] },
      ],
    },
  },
  {
    id: 'project-alpha',
    type: 'funnel',
    position: { x: 0, y: 700 },
    data: {
      label: 'Project Alpha',
      currentValue: 18000,
      minThreshold: 10000,
      maxThreshold: 30000,
      maxCapacity: 40000,
      inflowRate: 240,
      outflowAllocations: [],
    },
  },
  {
    id: 'project-beta',
    type: 'funnel',
    position: { x: 300, y: 700 },
    data: {
      label: 'Project Beta',
      currentValue: 22000,
      minThreshold: 15000,
      maxThreshold: 35000,
      maxCapacity: 45000,
      inflowRate: 265,
      outflowAllocations: [],
    },
  },
  {
    id: 'project-gamma',
    type: 'funnel',
    position: { x: 600, y: 700 },
    data: {
      label: 'Project Gamma',
      currentValue: 8000,
      minThreshold: 12000,
      maxThreshold: 28000,
      maxCapacity: 35000,
      inflowRate: 245,
      outflowAllocations: [],
    },
  },
  {
    id: 'reserve',
    type: 'funnel',
    position: { x: 900, y: 700 },
    data: {
      label: 'Reserve',
      currentValue: 5000,
      minThreshold: 20000,
      maxThreshold: 50000,
      maxCapacity: 60000,
      inflowRate: 250,
      outflowAllocations: [],
    },
  },
]

// Generate edges from node allocations with proportional thickness
function generateEdges(nodes: FlowNode[]): FlowEdge[] {
  const edges: FlowEdge[] = []
  const maxAllocation = 100 // Max percentage for scaling

  nodes.forEach((node) => {
    const data = node.data as FunnelNodeData
    data.outflowAllocations.forEach((alloc) => {
      // Calculate stroke width: min 2px, max 12px based on percentage
      const strokeWidth = 2 + (alloc.percentage / maxAllocation) * 10

      edges.push({
        id: `e-${node.id}-${alloc.targetId}`,
        source: node.id,
        target: alloc.targetId,
        animated: true,
        style: {
          stroke: alloc.color,
          strokeWidth,
          opacity: 0.8,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: alloc.color,
          width: 15 + alloc.percentage / 10,
          height: 15 + alloc.percentage / 10,
        },
        data: {
          allocation: alloc.percentage,
          color: alloc.color,
        },
      })
    })
  })

  return edges
}

export default function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(generateEdges(initialNodes))
  const [isSimulating, setIsSimulating] = useState(true)

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#64748b', strokeWidth: 4 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
          },
          eds
        )
      ),
    [setEdges]
  )

  // Simulation effect
  useEffect(() => {
    if (!isSimulating) return

    const interval = setInterval(() => {
      setNodes((nds) =>
        nds.map((node) => {
          const data = node.data as FunnelNodeData
          // Random walk for demo
          const change = (Math.random() - 0.45) * 300
          return {
            ...node,
            data: {
              ...data,
              currentValue: Math.max(0, Math.min(data.maxCapacity * 1.1, data.currentValue + change)),
            },
          }
        })
      )
    }, 500)

    return () => clearInterval(interval)
  }, [isSimulating, setNodes])

  // Regenerate edges when nodes change (to update proportions if needed)
  useEffect(() => {
    setEdges(generateEdges(nodes))
  }, [nodes, setEdges])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        className="bg-slate-50"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
        <Controls className="bg-white border border-slate-200 rounded-lg shadow-sm" />

        {/* Title Panel */}
        <Panel position="top-left" className="bg-white rounded-lg shadow-lg border border-slate-200 p-4 m-4">
          <h1 className="text-xl font-bold text-slate-800">Threshold-Based Flow Funding</h1>
          <p className="text-sm text-slate-500 mt-1">Drag min/max handles • Line thickness = allocation %</p>
        </Panel>

        {/* Simulation Toggle */}
        <Panel position="top-right" className="m-4">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-4 py-2 rounded-lg font-medium shadow-sm transition-all ${
              isSimulating
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {isSimulating ? '⏸ Pause' : '▶ Start'}
          </button>
        </Panel>

        {/* Legend */}
        <Panel position="bottom-left" className="bg-white rounded-lg shadow-lg border border-slate-200 p-4 m-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Funnel Zones</div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-200 border border-amber-400" />
              <span className="text-slate-600">Overflow (above MAX)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-200 border border-emerald-400" />
              <span className="text-slate-600">Healthy (MIN to MAX)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-200 border border-red-400" />
              <span className="text-slate-600">Critical (below MIN)</span>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-3 pt-3">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Flow Lines</div>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-blue-500 rounded" />
                <span>Thin = small allocation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-3 bg-blue-500 rounded" />
                <span>Thick = large allocation</span>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
