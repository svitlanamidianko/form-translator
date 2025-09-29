// History Item Component - Individual translation history record
// Similar to TranslationPanel but optimized for read-only historical data

import { useState, useEffect } from 'react';
import { TranslationHistoryItem } from '@/types';
import { starService } from '@/services/starService';

interface HistoryItemProps {
  item: TranslationHistoryItem;
  formOptions: Record<string, string>;
}

export default function HistoryItem({ item, formOptions }: HistoryItemProps) {
  // State to track if this item is starred (personal state)
  const [isStarred, setIsStarred] = useState(false);
  // State to track global star count (from all users)
  const [globalStarCount, setGlobalStarCount] = useState(item.starCount || 0);
  // State to track if we're currently updating the star
  const [isUpdating, setIsUpdating] = useState(false);

  // Load star status and global count when component mounts
  useEffect(() => {
    // Set personal star status immediately (from browser storage)
    setIsStarred(starService.isStarred(item.id));
    
    // Only load global star count if we don't already have it from history API
    if (item.starCount === undefined) {
      const loadGlobalCount = async () => {
        try {
          const count = await starService.getGlobalStarCount(item.id);
          setGlobalStarCount(count);
        } catch (error) {
          console.error('Failed to load global star count:', error);
          // Fallback to local count
          setGlobalStarCount(starService.getLocalStarCount(item.id));
        }
      };
      
      loadGlobalCount();
    }
  }, [item.id]);

  // Handle star click - toggle star status with OPTIMISTIC UPDATES
  const handleStarClick = async () => {
    if (isUpdating) return; // Prevent double-clicks
    
    // OPTIMISTIC UPDATE: Immediately flip the star state for instant feedback
    const newStarState = !isStarred;
    const optimisticCount = newStarState ? globalStarCount + 1 : globalStarCount - 1;
    
    setIsStarred(newStarState);
    setGlobalStarCount(optimisticCount);
    setIsUpdating(true); // Still track updating for error handling, but don't show spinner
    
    try {
      const result = await starService.toggleStar(item.id);
      // Update with actual server response (in case our optimistic guess was wrong)
      setIsStarred(result.isStarred);
      setGlobalStarCount(result.globalCount);
      
      // Star updated successfully
    } catch (error) {
      console.error('Failed to update star:', error);
      // ROLLBACK: Revert to previous state if API call failed
      setIsStarred(!newStarState);
      setGlobalStarCount(globalStarCount);
      // Also sync with local storage state
      setIsStarred(starService.isStarred(item.id));
    } finally {
      setIsUpdating(false);
    }
  };

  // Format the timestamp - comprehensive relative time formatting
  // Like Python's humanize library but custom-built
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Convert to different time units
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    // Return appropriate verbal time format
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ago`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else if (weeks > 0) {
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (seconds > 30) {
      return 'less than a minute ago';
    } else {
      return 'just now';
    }
  };

  // Get form display names (just the name, not description), fallback to the form key if not found
  const getFormName = (formKey: string) => {
    const fullFormName = formOptions[formKey] || formKey;
    // Extract just the form name (everything before " - ")
    return fullFormName.split(' - ')[0];
  };

  return (
    <div className="mb-24 last:mb-0">
      {/* Single gray container for both source and target */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        
        {/* Source and Target side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16">
          
          {/* Source (Input) Section - Left Side */}
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600">
                {getFormName(item.sourceForm)}
              </span>
            </div>
            <div className="text-xl text-gray-900 leading-relaxed font-inter">
              {item.sourceText || <span className="text-gray-400">No source text</span>}
            </div>
          </div>

          {/* Target (Output) Section - Right Side */}
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600">
                {getFormName(item.targetForm)}
              </span>
            </div>
            <div className="text-xl text-gray-900 leading-relaxed font-inter">
              {item.targetText || <span className="text-gray-400">No translation</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Star rating and timestamp */}
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="flex items-center space-x-1">
          {/* Clickable star - filled if starred, outline if not */}
          <button 
            onClick={handleStarClick}
            className="p-1 rounded-full transition-colors hover:bg-gray-100 cursor-pointer"
            title={isStarred ? "Remove from favorites" : "Add to favorites"}
          >
            {isStarred ? (
              // Filled star (starred by current user)
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            ) : (
              // Outline star (not starred by current user)
              <svg className="w-4 h-4 text-gray-400 hover:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            )}
          </button>
          <span className="text-sm text-gray-500 font-medium">
            {globalStarCount}
          </span>
        </div>
        <span className="text-sm text-gray-500 font-medium">
          {formatTimestamp(item.timestamp)}
        </span>
      </div>
    </div>
  );
}

