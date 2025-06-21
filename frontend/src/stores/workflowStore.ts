import { create } from 'zustand';
import { Node, Edge, Connection, addEdge } from 'reactflow';
import { Workflow, WorkflowStep } from '@workflow-visualizer/shared';

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  selectedWorkflow: Workflow | null;
  
  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  loadWorkflow: (workflow: Workflow) => void;
  updateStepStatus: (stepId: string, status: WorkflowStep['status']) => void;
  clearWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedWorkflow: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({
      nodes: changes.reduce((acc: Node[], change: any) => {
        if (change.type === 'position' && change.dragging) {
          const node = acc.find((n) => n.id === change.id);
          if (node) {
            node.position = change.position;
          }
        }
        return acc;
      }, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: changes.reduce((acc: Edge[], change: any) => {
        return acc;
      }, get().edges),
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  loadWorkflow: (workflow) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // タスクノードを作成
    nodes.push({
      id: `task-${workflow.task_id}`,
      type: 'taskNode',
      position: { x: 400, y: 50 },
      data: {
        taskId: workflow.task_id,
        workflowName: workflow.name,
        status: workflow.status,
      },
    });

    // ステップノードを作成
    workflow.steps.forEach((step, index) => {
      const nodeId = `step-${step.step_id}`;
      nodes.push({
        id: nodeId,
        type: 'stepNode',
        position: { x: 200 + (index % 3) * 250, y: 200 + Math.floor(index / 3) * 150 },
        data: {
          step,
          isCurrent: workflow.current_step_id === step.step_id,
        },
      });

      // タスクノードからの最初のステップへのエッジ
      if (index === 0) {
        edges.push({
          id: `e-task-${step.step_id}`,
          source: `task-${workflow.task_id}`,
          target: nodeId,
          type: 'smoothstep',
        });
      }

      // ステップ間のエッジ
      if (index > 0) {
        edges.push({
          id: `e-${workflow.steps[index - 1].step_id}-${step.step_id}`,
          source: `step-${workflow.steps[index - 1].step_id}`,
          target: nodeId,
          type: 'smoothstep',
          animated: workflow.current_step_id === workflow.steps[index - 1].step_id,
        });
      }
    });

    set({
      nodes,
      edges,
      selectedWorkflow: workflow,
    });
  },

  updateStepStatus: (stepId, status) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === `step-${stepId}`) {
          return {
            ...node,
            data: {
              ...node.data,
              step: {
                ...node.data.step,
                status,
              },
            },
          };
        }
        return node;
      }),
    }));
  },

  clearWorkflow: () => {
    set({
      nodes: [],
      edges: [],
      selectedWorkflow: null,
    });
  },
}));