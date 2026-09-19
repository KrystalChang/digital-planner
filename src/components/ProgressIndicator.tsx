import React from 'react';
import { formatBlockProgress } from '../utils/dateUtils';
import { CheckCircle2 } from 'lucide-react';

interface ProgressIndicatorProps {
  completed: number;
  total: number;
  label?: string;
  showDetails?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  completed,
  total,
  label = 'Today',
  showDetails = true
}) => {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const blockString = formatBlockProgress(completed, total, 10);

  return (
    <div
      id="planner-progress-indicator"
      className="pt-3 pb-1 border-t border-[#e8e0d4] mt-2 font-mono"
    >
      <div className="flex items-center justify-between text-xs text-[#5c5348] mb-1.5">
        <div className="flex items-center gap-2">
          <span className="font-serif font-semibold text-[13px] tracking-wide text-[#383129]">
            {label}
          </span>
          <span className="text-[13px] tracking-widest text-[#7a6e60] select-none">
            {blockString}
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-sans font-medium text-[12px] text-[#4d4439]">
          <span>
            {completed} of {total}
          </span>
          <span className="text-[#968a7a]">({percent}%)</span>
        </div>
      </div>

      {showDetails && (
        <div className="w-full bg-[#ede6da] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#6b5847] h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
};
