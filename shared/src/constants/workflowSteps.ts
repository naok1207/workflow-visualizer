import { TaskType } from '../types/task';

export interface WorkflowStepTemplate {
  id: string;
  name: string;
  description: string;
  order: number;
}

export const DEFAULT_WORKFLOWS: Record<TaskType, WorkflowStepTemplate[]> = {
  'feature-planning': [
    {
      id: 'research',
      name: 'リサーチ',
      description: '既存実装の調査、技術選定',
      order: 1,
    },
    {
      id: 'ideation',
      name: 'アイデア整理',
      description: '実装方針の検討、設計',
      order: 2,
    },
    {
      id: 'proposal',
      name: '提案書作成',
      description: '機能仕様書の作成',
      order: 3,
    },
    {
      id: 'issue-creation',
      name: 'Issue作成',
      description: 'GitHub Issueの作成',
      order: 4,
    },
  ],
  'issue-resolution': [
    {
      id: 'analysis',
      name: '問題分析',
      description: '問題の原因調査、影響範囲確認',
      order: 1,
    },
    {
      id: 'design',
      name: '設計',
      description: '解決方法の設計、実装方針決定',
      order: 2,
    },
    {
      id: 'implementation',
      name: '実装',
      description: 'コードの実装、修正',
      order: 3,
    },
    {
      id: 'testing',
      name: 'テスト',
      description: 'ユニットテスト、動作確認',
      order: 4,
    },
    {
      id: 'pr-creation',
      name: 'PR作成',
      description: 'Pull Requestの作成',
      order: 5,
    },
    {
      id: 'review',
      name: 'レビュー',
      description: 'コードレビュー、フィードバック対応',
      order: 6,
    },
  ],
  'documentation': [
    {
      id: 'research',
      name: '調査',
      description: '既存ドキュメントの確認、情報収集',
      order: 1,
    },
    {
      id: 'writing',
      name: '執筆',
      description: 'ドキュメントの作成、更新',
      order: 2,
    },
    {
      id: 'review',
      name: 'レビュー',
      description: '内容確認、校正',
      order: 3,
    },
    {
      id: 'publish',
      name: '公開',
      description: 'ドキュメントの公開、配布',
      order: 4,
    },
  ],
  'research': [
    {
      id: 'gathering',
      name: '情報収集',
      description: '関連情報の収集、調査',
      order: 1,
    },
    {
      id: 'analysis',
      name: '分析',
      description: '収集した情報の分析、評価',
      order: 2,
    },
    {
      id: 'report',
      name: 'レポート作成',
      description: '調査結果のまとめ、レポート作成',
      order: 3,
    },
  ],
  'refactoring': [
    {
      id: 'analysis',
      name: '現状分析',
      description: 'コードの問題点分析、改善点の洗い出し',
      order: 1,
    },
    {
      id: 'design',
      name: '設計',
      description: 'リファクタリング方針の決定',
      order: 2,
    },
    {
      id: 'implementation',
      name: '実装',
      description: 'コードの改善、最適化',
      order: 3,
    },
    {
      id: 'testing',
      name: 'テスト',
      description: '動作確認、回帰テスト',
      order: 4,
    },
    {
      id: 'measurement',
      name: '性能測定',
      description: 'パフォーマンス改善の確認',
      order: 5,
    },
  ],
  'custom': [
    {
      id: 'step1',
      name: 'ステップ1',
      description: 'カスタムステップ1',
      order: 1,
    },
    {
      id: 'step2',
      name: 'ステップ2',
      description: 'カスタムステップ2',
      order: 2,
    },
    {
      id: 'step3',
      name: 'ステップ3',
      description: 'カスタムステップ3',
      order: 3,
    },
  ],
};