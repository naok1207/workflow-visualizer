interface ProgressBarProps {
  percentage: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export default function ProgressBar({ 
  percentage, 
  color = '#3B82F6',
  height = 6,
  showLabel = false 
}: ProgressBarProps) {
  return (
    <div className="relative">
      <div 
        className="w-full bg-gray-200 rounded-full overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {showLabel && (
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-gray-700">
          {percentage}%
        </span>
      )}
    </div>
  );
}