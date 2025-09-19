// History Item Component - Individual translation history record
// Similar to TranslationPanel but optimized for read-only historical data

import { TranslationHistoryItem } from '@/types';

interface HistoryItemProps {
  item: TranslationHistoryItem;
  formOptions: Record<string, string>;
}

export default function HistoryItem({ item, formOptions }: HistoryItemProps) {
  // Format the timestamp - similar to Python's datetime.strftime()
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Get form display names, fallback to the form key if not found
  const getFormName = (formKey: string) => {
    return formOptions[formKey] || formKey;
  };

  return (
    <div className="mb-12 lg:mb-20 last:mb-0">
      {/* Header with timestamp */}
      <div className="mb-3 flex justify-end">
        <span className="text-xs text-gray-500 font-medium">
          {formatTimestamp(item.timestamp)}
        </span>
      </div>

      {/* Translation content - stacked on mobile, side-by-side on desktop */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-3 lg:gap-4">
        
        {/* Source (Input) Section */}
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700">
              {getFormName(item.sourceForm)}
            </span>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 min-h-[80px]">
            <p className="text-base text-gray-900 leading-relaxed">
              {item.sourceText || <span className="text-gray-400 italic">No source text</span>}
            </p>
          </div>
        </div>

        {/* Target (Output) Section */}
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700">
              {getFormName(item.targetForm)}
            </span>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 min-h-[80px]">
            <p className="text-base text-gray-900 leading-relaxed">
              {item.targetText || <span className="text-gray-400 italic">No translation</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
