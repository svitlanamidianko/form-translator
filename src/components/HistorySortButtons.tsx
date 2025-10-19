// History Sort Buttons Component
// Provides sorting options for the translation history

interface HistorySortButtonsProps {
  currentSortMode: 'most_starred' | 'recent_first';
  onSortModeChange: (sortMode: 'most_starred' | 'recent_first') => void;
}

export default function HistorySortButtons({ 
  currentSortMode, 
  onSortModeChange 
}: HistorySortButtonsProps) {
  return (
    <div className="flex gap-2 items-center">
      {/* Most Starred Button */}
      <button
        onClick={() => onSortModeChange('most_starred')}
        className={`
          px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex-shrink-0
          ${currentSortMode === 'most_starred'
            ? 'text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100'
            : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
          }
        `}
      >
        most starred first
      </button>
      
      {/* Recent First Button */}
      <button
        onClick={() => onSortModeChange('recent_first')}
        className={`
          px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex-shrink-0
          ${currentSortMode === 'recent_first'
            ? 'text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100'
            : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
          }
        `}
      >
        most recent first 
      </button>
    </div>
  );
}
