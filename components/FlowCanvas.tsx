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
import OutcomeNode from './nodes/OutcomeNode'
import type { FlowNode, FlowEdge, FunnelNodeData, OutcomeNodeData } from '@/lib/types'

const nodeTypes = {
  funnel: FunnelNode,
  outcome: OutcomeNode,
}

// Colors for allocations
const SPENDING_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#6366f1']
const OVERFLOW_COLORS = ['#f59e0b', '#ef4444', '#f97316', '#eab308', '#dc2626', '#ea580c']

const initialNodes: FlowNode[] = [
  // Main Treasury Funnel
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
      // Overflow goes SIDEWAYS to other funnels
      overflowAllocations: [
        { targetId: 'public-goods', percentage: 40, color: OVERFLOW_COLORS[0] },
        { targetId: 'research', percentage: 35, color: OVERFLOW_COLORS[1] },
        { targetId: 'emergency', percentage: 25, color: OVERFLOW_COLORS[2] },
      ],
      // Spending goes DOWN to outcomes
      spendingAllocations: [
        { targetId: 'treasury-ops', percentage: 60, color: SPENDING_COLORS[0] },
        { targetId: 'treasury-audit', percentage: 40, color: SPENDING_COLORS[1] },
      ],
    } as FunnelNodeData,
  },
  // Sub-funnels (receive overflow from Treasury)
  {
    id: 'public-goods',
    type: 'funnel',
    position: { x: 50, y: 300 },
    data: {
      label: 'Public Goods',
      currentValue: 45000,
      minThreshold: 15000,
      maxThreshold: 50000,
      maxCapacity: 70000,
      inflowRate: 400,
      overflowAllocations: [],
      spendingAllocations: [
        { targetId: 'pg-infra', percentage: 50, color: SPENDING_COLORS[0] },
        { targetId: 'pg-education', percentage: 30, color: SPENDING_COLORS[1] },
        { targetId: 'pg-tooling', percentage: 20, color: SPENDING_COLORS[2] },
      ],
    } as FunnelNodeData,
  },
  {
    id: 'research',
    type: 'funnel',
    position: { x: 400, y: 300 },
    data: {
      label: 'Research',
      currentValue: 28000,
      minThreshold: 20000,
      maxThreshold: 45000,
      maxCapacity: 60000,
      inflowRate: 350,
      overflowAllocations: [],
      spendingAllocations: [
        { targetId: 'research-grants', percentage: 70, color: SPENDING_COLORS[0] },
        { targetId: 'research-papers', percentage: 30, color: SPENDING_COLORS[1] },
      ],
    } as FunnelNodeData,
  },
  {
    id: 'emergency',
    type: 'funnel',
    position: { x: 750, y: 300 },
    data: {
      label: 'Emergency Fund',
      currentValue: 12000,
      minThreshold: 25000,
      maxThreshold: 60000,
      maxCapacity: 80000,
      inflowRate: 250,
      overflowAllocations: [],
      spendingAllocations: [
        { targetId: 'emergency-response', percentage: 100, color: SPENDING_COLORS[0] },
      ],
    } as FunnelNodeData,
  },
  // Outcome nodes (receive spending from funnels)
  {
    id: 'treasury-ops',
    type: 'outcome',
    position: { x: 350, y: 600 },
    data: {
      label: 'Treasury Operations',
      description: 'Day-to-day treasury management and reporting',
      fundingReceived: 15000,
      fundingTarget: 25000,
      status: 'in-progress',
    } as OutcomeNodeData,
  },
  {
    id: 'treasury-audit',
    type: 'outcome',
    position: { x: 550, y: 600 },
    data: {
      label: 'Annual Audit',
      description: 'Third-party financial audit and compliance',
      fundingReceived: 8000,
      fundingTarget: 15000,
      status: 'in-progress',
    } as OutcomeNodeData,
  },
  {
    id: 'pg-infra',
    type: 'outcome',
    position: { x: -50, y: 600 },
    data: {
      label: 'Infrastructure',
      description: 'Core infrastructure development and maintenance',
      fundingReceived: 22000,
      fundingTarget: 30000,
      status: 'in-progress',
    } as OutcomeNodeData,
  },
  {
    id: 'pg-education',
    type: 'outcome',
    position: { x: 100, y: 700 },
    data: {
      label: 'Education Programs',
      description: 'Developer education and onboarding materials',
      fundingReceived: 12000,
      fundingTarget: 20000,
      status: 'in-progress',
    } as OutcomeNodeData,
  },
  {
    id: 'pg-tooling',
    type: 'outcome',
    position: { x: 250, y: 600 },
    data: {
      label: 'Dev Tooling',
      description: 'Open-source developer tools and SDKs',
      fundingReceived: 5000,
      fundingTarget: 15000,
      status: 'not-started',
    } as OutcomeNodeData,
  },
  {
    id: 'research-grants',
    type: 'outcome',
    position: { x: 400, y: 600 },
    data: {
      label: 'Research Grants',
      description: 'Academic research grants for protocol improvements',
      fundingReceived: 18000,
      fundingTarget: 25000,
      status: 'in-progress',
    } as OutcomeNodeData,
  },
  {
    id: 'research-papers',
    type: 'outcome',
    position: { x: 500, y: 700 },
    data: {
      label: 'Published Papers',
      description: 'Peer-reviewed research publications',
      fundingReceived: 8000,
      fundingTarget: 10000,
      status: 'in-progress',
    } as OutcomeNodeData,
  },
  {
    id: 'emergency-response',
    type: 'outcome',
    position: { x: 750, y: 600 },
    data: {
      label: 'Emergency Response',
      description: 'Rapid response fund for critical issues',
      fundingReceived: 5000,
      fundingTarget: 50000,
      status: 'not-started',
    } as OutcomeNodeData,
  },
]

// Generate edges from node allocations
function generateEdges(nodes: FlowNode[]): FlowEdge[] {
  const edges: FlowEdge[] = []

  nodes.forEach((node) => {
    if (node.type !== 'funnel') return
    const data = node.data as FunnelNodeData

    // OVERFLOW edges - go SIDEWAYS to other funnels
    data.overflowAllocations?.forEach((alloc, idx) => {
      const strokeWidth = 2 + (alloc.percentage / 100) * 8
      const isLeftSide = idx % 2 === 0

      edges.push({
        id: `overflow-${node.id}-${alloc.targetId}`,
        source: node.id,
        target: alloc.targetId,
        sourceHandle: isLeftSide ? 'overflow-left' : 'overflow-right',
        targetHandle: isLeftSide ? 'inflow-right' : 'inflow-left',
        animated: true,
        style: {
          stroke: alloc.color,
          strokeWidth,
          opacity: 0.8,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: alloc.color,
          width: 12 + alloc.percentage / 10,
          height: 12 + alloc.percentage / 10,
        },
        data: {
          allocation: alloc.percentage,
          color: alloc.color,
          edgeType: 'overflow' as const,
        },
        type: 'smoothstep',
      })
    })

    // SPENDING edges - go DOWN to outcomes
    data.spendingAllocations?.forEach((alloc) => {
      const strokeWidth = 2 + (alloc.percentage / 100) * 8

      edges.push({
        id: `spending-${node.id}-${alloc.targetId}`,
        source: node.id,
        target: alloc.targetId,
        animated: true,
        style: {
          stroke: alloc.color,
          strokeWidth,
          opacity: 0.9,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: alloc.color,
          width: 12 + alloc.percentage / 10,
          height: 12 + alloc.percentage / 10,
        },
        data: {
          allocation: alloc.percentage,
          color: alloc.color,
          edgeType: 'spending' as const,
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

  // Simulation effect - update funnel values and outcome funding
  useEffect(() => {
    if (!isSimulating) return

    const interval = setInterval(() => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.type === 'funnel') {
            const data = node.data as FunnelNodeData
            const change = (Math.random() - 0.45) * 300
            return {
              ...node,
              data: {
                ...data,
                currentValue: Math.max(0, Math.min(data.maxCapacity * 1.1, data.currentValue + change)),
              },
            }
          } else if (node.type === 'outcome') {
            const data = node.data as OutcomeNodeData
            const change = Math.random() * 100
            const newReceived = Math.min(data.fundingTarget * 1.1, data.fundingReceived + change)
            return {
              ...node,
              data: {
                ...data,
                fundingReceived: newReceived,
                status: newReceived >= data.fundingTarget ? 'completed' : data.status === 'not-started' && newReceived > 0 ? 'in-progress' : data.status,
              },
            }
          }
          return node
        })
      )
    }, 500)

    return () => clearInterval(interval)
  }, [isSimulating, setNodes])

  // Regenerate edges when nodes change
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
          <p className="text-sm text-slate-500 mt-1">Overflow → Funnels (sideways) • Spending → Outcomes (down)</p>
          <p className="text-xs text-slate-400 mt-1">Double-click funnels to edit • Drag thresholds to adjust</p>
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
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Flow Types</div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-amber-500 rounded" />
              <span className="text-slate-600">Overflow → Other Funnels</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-blue-500 rounded" />
              <span className="text-slate-600">Spending → Outcomes</span>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-3 pt-3">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Funnel Status</div>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-200 border border-amber-400" />
                <span>Overflow (above MAX)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-200 border border-emerald-400" />
                <span>Healthy (MIN to MAX)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-200 border border-red-400" />
                <span>Critical (below MIN)</span>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
