import { TaskType } from '../types/task';

export const TASK_TYPE_INFO: Record<TaskType, {
  label: string;
  description: string;
  color: string;
  icon: string;
}> = {
  'feature-planning': {
    label: '新機能企画',
    description: '新しい機能の企画・設計を行うタスク',
    color: '#3B82F6', // blue
    icon: '💡',
  },
  'issue-resolution': {
    label: 'Issue解決',
    description: 'バグ修正やIssueの解決を行うタスク',
    color: '#EF4444', // red
    icon: '🐛',
  },
  'documentation': {
    label: 'ドキュメント更新',
    description: 'ドキュメントの作成・更新を行うタスク',
    color: '#10B981', // green
    icon: '📝',
  },
  'research': {
    label: '調査・研究',
    description: '技術調査や研究を行うタスク',
    color: '#F59E0B', // amber
    icon: '🔍',
  },
  'refactoring': {
    label: 'リファクタリング',
    description: 'コードの改善・最適化を行うタスク',
    color: '#8B5CF6', // purple
    icon: '🔧',
  },
  'custom': {
    label: 'カスタム',
    description: 'ユーザー定義のカスタムタスク',
    color: '#6B7280', // gray
    icon: '⚡',
  },
};