// Content Tabs Component - Interactive tabs with interest tracking
// Text tab works normally, Images/Websites track user interest via API

import { useState } from 'react';
import { trackContentTypeInterest } from '@/services/api';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ContentTabsProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export default function ContentTabs({ activeTab = 'text', onTabChange }: ContentTabsProps) {
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  
  const tabs: Tab[] = [
    {
      id: 'text',
      label: 'text',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z" />
        </svg>
      ),
    },
    {
      id: 'images',
      label: 'images',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
        </svg>
      ),
    },
    {
      id: 'websites',
      label: 'websites',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
        </svg>
      ),
    },
  ];

  const handleTabClick = async (tabId: string) => {
    // For text tab, handle normally
    if (tabId === 'text') {
      if (onTabChange) {
        onTabChange(tabId);
      }
      return;
    }

    // For images and websites, track interest
    if (tabId === 'images' || tabId === 'websites') {
      try {
        await trackContentTypeInterest(tabId);
        console.log(`📊 Tracked interest in ${tabId}`);
        
        // Show user feedback
        setFeedbackMessage(`thanks for your curiosity in ${tabId};) maybe one day🌱`);
        setTimeout(() => setFeedbackMessage(''), 3000);
        
      } catch (error) {
        console.error(`Failed to track interest in ${tabId}:`, error);
        setFeedbackMessage(`thanks for your curiosity in ${tabId};) maybe one day🌱`);
        setTimeout(() => setFeedbackMessage(''), 3000);
      }
    }
  };

  return (
    <div className="bg-white py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:items-center">
          {/* Tabs Row */}
          <div className="flex gap-2 items-center overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  px-3 sm:px-4 py-2 text-sm font-medium rounded-lg flex items-center space-x-2 transition-colors whitespace-nowrap flex-shrink-0
                  ${activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100'
                    : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }
                `}
              >
                <div className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-600'}>
                  {tab.icon}
                </div>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          
          {/* Feedback message - Better mobile handling */}
          {feedbackMessage && (
            <div className="flex-shrink-0 px-2">
              <span className="text-sm text-gray-500 break-words sm:whitespace-nowrap">
                {feedbackMessage}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
