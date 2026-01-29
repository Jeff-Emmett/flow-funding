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

import SourceNode from './nodes/SourceNode'
import ThresholdNode from './nodes/ThresholdNode'
import RecipientNode from './nodes/RecipientNode'
import type { FlowNode, FlowEdge, SourceNodeData, ThresholdNodeData, RecipientNodeData } from '@/lib/types'

const nodeTypes = {
  source: SourceNode,
  threshold: ThresholdNode,
  recipient: RecipientNode,
}

// Vertical layout - sources at top, recipients at bottom
const initialNodes: FlowNode[] = [
  // Top row - Source
  {
    id: 'source-1',
    type: 'source',
    position: { x: 350, y: 0 },
    data: {
      label: 'Treasury',
      balance: 100000,
      flowRate: 1000,
    },
  },
  // Middle row - Threshold funnels
  {
    id: 'threshold-1',
    type: 'threshold',
    position: { x: 100, y: 200 },
    data: {
      label: 'Public Goods',
      minThreshold: 15000,
      maxThreshold: 60000,
      currentValue: 72000, // Overflowing
    },
  },
  {
    id: 'threshold-2',
    type: 'threshold',
    position: { x: 400, y: 200 },
    data: {
      label: 'Research',
      minThreshold: 20000,
      maxThreshold: 50000,
      currentValue: 35000, // Healthy
    },
  },
  {
    id: 'threshold-3',
    type: 'threshold',
    position: { x: 700, y: 200 },
    data: {
      label: 'Emergency',
      minThreshold: 30000,
      maxThreshold: 80000,
      currentValue: 18000, // Critical
    },
  },
  // Bottom row - Recipients
  {
    id: 'recipient-1',
    type: 'recipient',
    position: { x: 50, y: 620 },
    data: {
      label: 'Project Alpha',
      received: 24500,
      target: 30000,
    },
  },
  {
    id: 'recipient-2',
    type: 'recipient',
    position: { x: 300, y: 620 },
    data: {
      label: 'Project Beta',
      received: 18000,
      target: 25000,
    },
  },
  {
    id: 'recipient-3',
    type: 'recipient',
    position: { x: 550, y: 620 },
    data: {
      label: 'Research Lab',
      received: 12000,
      target: 40000,
    },
  },
  {
    id: 'recipient-4',
    type: 'recipient',
    position: { x: 800, y: 620 },
    data: {
      label: 'Reserve Fund',
      received: 5000,
      target: 50000,
    },
  },
]

const initialEdges: FlowEdge[] = [
  // Source to thresholds (top to middle)
  {
    id: 'e-source-t1',
    source: 'source-1',
    target: 'threshold-1',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  {
    id: 'e-source-t2',
    source: 'source-1',
    target: 'threshold-2',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  {
    id: 'e-source-t3',
    source: 'source-1',
    target: 'threshold-3',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  // Threshold to recipients (middle to bottom)
  {
    id: 'e-t1-r1',
    source: 'threshold-1',
    target: 'recipient-1',
    animated: true,
    style: { stroke: '#ec4899', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' },
  },
  {
    id: 'e-t1-r2',
    source: 'threshold-1',
    target: 'recipient-2',
    animated: true,
    style: { stroke: '#ec4899', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' },
  },
  {
    id: 'e-t2-r3',
    source: 'threshold-2',
    target: 'recipient-3',
    animated: true,
    style: { stroke: '#ec4899', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' },
  },
  {
    id: 'e-t3-r4',
    source: 'threshold-3',
    target: 'recipient-4',
    animated: true,
    style: { stroke: '#ec4899', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' },
  },
  // Overflow connections (side handles) - from overflowing funnel to neighbors
  {
    id: 'e-overflow-1',
    source: 'threshold-1',
    sourceHandle: 'overflow-right',
    target: 'threshold-2',
    animated: true,
    style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5 5' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
  },
]

export default function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [isSimulating, setIsSimulating] = useState(true)

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#64748b', strokeWidth: 2 },
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
          if (node.type === 'source') {
            const data = node.data as SourceNodeData
            return {
              ...node,
              data: {
                ...data,
                balance: Math.max(0, data.balance - data.flowRate / 3600),
              },
            }
          }
          if (node.type === 'threshold') {
            const data = node.data as ThresholdNodeData
            // Random walk for demo
            const change = (Math.random() - 0.4) * 200
            return {
              ...node,
              data: {
                ...data,
                currentValue: Math.max(0, Math.min(100000, data.currentValue + change)),
              },
            }
          }
          if (node.type === 'recipient') {
            const data = node.data as RecipientNodeData
            if (data.received < data.target) {
              return {
                ...node,
                data: {
                  ...data,
                  received: Math.min(data.target, data.received + Math.random() * 20),
                },
              }
            }
          }
          return node
        })
      )
    }, 500)

    return () => clearInterval(interval)
  }, [isSimulating, setNodes])

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
        defaultEdgeOptions={{
          animated: true,
          style: { strokeWidth: 2 },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
        <Controls className="bg-white border border-slate-200 rounded-lg shadow-sm" />

        {/* Title Panel */}
        <Panel position="top-left" className="bg-white rounded-lg shadow-lg border border-slate-200 p-4 m-4">
          <h1 className="text-xl font-bold text-slate-800">Threshold-Based Flow Funding</h1>
          <p className="text-sm text-slate-500 mt-1">Funds flow top→bottom through funnel thresholds</p>
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
              <div className="w-8 h-0.5 bg-blue-500" />
              <span className="text-slate-600">Inflow (from source)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-pink-500" />
              <span className="text-slate-600">Outflow (to recipients)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-amber-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0, #f59e0b 5px, transparent 5px, transparent 10px)' }} />
              <span className="text-slate-600">Overflow (excess)</span>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-3 pt-3">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Funnel Zones</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
                <span className="text-slate-600">Overflow (above MAX)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
                <span className="text-slate-600">Healthy (MIN to MAX)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-100 border border-red-300" />
                <span className="text-slate-600">Critical (below MIN)</span>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
