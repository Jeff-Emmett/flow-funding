'use client'

import { useCallback, useState, useEffect } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import SourceNode from './nodes/SourceNode'
import RecipientNode from './nodes/RecipientNode'
import ThresholdGate from './nodes/ThresholdGate'
import AnimatedFlowEdge from './edges/AnimatedFlowEdge'

const nodeTypes = {
  source: SourceNode,
  recipient: RecipientNode,
  threshold: ThresholdGate,
}

const edgeTypes = {
  animated: AnimatedFlowEdge,
}

// Demo initial nodes
const initialNodes: Node[] = [
  {
    id: 'treasury',
    type: 'source',
    position: { x: 50, y: 200 },
    data: {
      label: 'Community Treasury',
      balance: 50000,
      flowRate: 100,
      isActive: true,
    },
  },
  {
    id: 'gate1',
    type: 'threshold',
    position: { x: 300, y: 100 },
    data: {
      threshold: 5000,
      currentValue: 8000,
      label: 'Project Gate',
    },
  },
  {
    id: 'gate2',
    type: 'threshold',
    position: { x: 300, y: 300 },
    data: {
      threshold: 10000,
      currentValue: 7500,
      label: 'Research Gate',
    },
  },
  {
    id: 'project-a',
    type: 'recipient',
    position: { x: 550, y: 50 },
    data: {
      label: 'Project Alpha',
      received: 12340,
      incomingRate: 85,
      threshold: 15000,
      isReceiving: true,
    },
  },
  {
    id: 'project-b',
    type: 'recipient',
    position: { x: 550, y: 200 },
    data: {
      label: 'Project Beta',
      received: 8200,
      incomingRate: 50,
      threshold: 20000,
      isReceiving: true,
    },
  },
  {
    id: 'project-c',
    type: 'recipient',
    position: { x: 550, y: 350 },
    data: {
      label: 'Research Fund',
      received: 3100,
      incomingRate: 0,
      threshold: 10000,
      isReceiving: false,
    },
  },
]

const initialEdges: Edge[] = [
  {
    id: 'e-treasury-gate1',
    source: 'treasury',
    target: 'gate1',
    type: 'animated',
    data: { flowRate: 100, isActive: true, color: '#3B82F6' },
  },
  {
    id: 'e-treasury-gate2',
    source: 'treasury',
    target: 'gate2',
    type: 'animated',
    data: { flowRate: 75, isActive: true, color: '#3B82F6' },
  },
  {
    id: 'e-gate1-projecta',
    source: 'gate1',
    target: 'project-a',
    type: 'animated',
    data: { flowRate: 85, isActive: true, color: '#10B981' },
  },
  {
    id: 'e-gate1-projectb',
    source: 'gate1',
    target: 'project-b',
    type: 'animated',
    data: { flowRate: 50, isActive: true, color: '#10B981' },
  },
  {
    id: 'e-gate2-projectc',
    source: 'gate2',
    target: 'project-c',
    type: 'animated',
    data: { flowRate: 0, isActive: false, color: '#F43F5E' },
  },
]

export default function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'animated',
      data: { flowRate: 50, isActive: true, color: '#8B5CF6' },
    }, eds)),
    [setEdges]
  )

  // Simulate flow updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.type === 'recipient' && node.data.isReceiving) {
            const hourlyRate = node.data.incomingRate / 3600 // per second
            return {
              ...node,
              data: {
                ...node.data,
                received: node.data.received + hourlyRate,
              },
            }
          }
          if (node.type === 'source' && node.data.isActive) {
            const hourlyRate = node.data.flowRate / 3600
            return {
              ...node,
              data: {
                ...node.data,
                balance: Math.max(0, node.data.balance - hourlyRate),
              },
            }
          }
          return node
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [setNodes])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-slate-950"
      >
        <Controls className="bg-slate-800 border-slate-700" />
        <MiniMap
          className="bg-slate-800 border-slate-700"
          nodeColor={(node) => {
            switch (node.type) {
              case 'source':
                return '#3B82F6'
              case 'recipient':
                return '#8B5CF6'
              case 'threshold':
                return '#F59E0B'
              default:
                return '#64748B'
            }
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1E293B" />
      </ReactFlow>

      {/* Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur border-t border-slate-700 px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-slate-400">Total Flowing:</span>
              <span className="text-white font-mono">$175/hr</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Active Flows:</span>
              <span className="text-emerald-400 font-mono">4</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Blocked:</span>
              <span className="text-rose-400 font-mono">1</span>
            </div>
          </div>
          <div className="text-slate-500 text-xs">
            Drag nodes to rearrange • Click to inspect • Connect nodes to create flows
          </div>
        </div>
      </div>
    </div>
  )
}
