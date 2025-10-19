"use client";
// Header Component - Clean separation of the app header
// This is like creating a separate header.py module in Python

import InfoModal from '@/components/InfoModal';

interface HeaderProps {
  title?: string;
  onInfoClick?: () => void;
  onCloseInfoModal?: () => void;
  isInfoModalOpen?: boolean;
}

export default function Header({ title = "Translator", onInfoClick, onCloseInfoModal, isInfoModalOpen = false }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src="/translate-logo.png" 
            alt="Translate Logo" 
            className="h-8 w-auto"
          />
          <h1 
            className="text-xl font-normal text-gray-800" 
            style={{ fontFamily: 'Roboto, sans-serif', fontSize: '28px', color: '#5f6368' }}
          >
            {title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button 
              onClick={onInfoClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={isInfoModalOpen ? "Close info menu" : "Open info menu"}
            >
              {isInfoModalOpen ? (
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z" />
                </svg>
              )}
            </button>
            {isInfoModalOpen && (
              <div className="absolute right-0 top-full mt-4 z-50 sm:right-0 right-[-5vw] pointer-events-auto">
                <InfoModal isOpen={true} onClose={onCloseInfoModal ?? (() => {})} />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
