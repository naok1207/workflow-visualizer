import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function Header() {
  const currentDate = format(new Date(), 'yyyy年MM月dd日(E)', { locale: ja });

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">
            ワークフロー可視化システム
          </h1>
          <span className="text-sm text-gray-500">
            Claude Code用タスク管理
          </span>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-sm text-gray-600">
            {currentDate}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">接続中</span>
          </div>
        </div>
      </div>
    </header>
  );
}