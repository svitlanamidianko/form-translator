// Translation History Component - Collapsible history list
// This component shows/hides based on the history button state

import { HistoryComponentProps } from '@/types';
import HistoryItem from './HistoryItem';

interface ExtendedHistoryComponentProps extends HistoryComponentProps {
  formOptions?: Record<string, string>;
  isLoadingHistory?: boolean;
  onRefreshHistory?: () => void;
}

export default function TranslationHistory({ 
  isOpen, 
  historyItems,
  formOptions = {},
  isLoadingHistory = false
}: ExtendedHistoryComponentProps) {
  // Don't render anything if not open - similar to conditional rendering in Python templates
  if (!isOpen) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">

      {/* History list - full page scrolling */}
      <div className="space-y-0">
        {isLoadingHistory ? (
          // Loading state - like showing a spinner in Python
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-500">loading translation history...</p>
          </div>
        ) : historyItems.length === 0 ? (
          // Empty state - like showing a placeholder in Python when list is empty
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13,3A9,9 0 0,0 4,12H1L4.89,15.89L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3Z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">no translations yet</h3>
            <p className="text-gray-500 max-w-sm">
              start translating to see your history appear here. all your translations will be saved automatically.
            </p>
          </div>
        ) : (
          // History items - similar to iterating over a list in Python
          <div className="space-y-4">
            {historyItems.map((item, index) => (
              <HistoryItem
                key={`${item.id}-${index}`}
                item={item}
                formOptions={formOptions}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}