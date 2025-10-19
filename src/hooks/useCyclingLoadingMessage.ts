// Custom hook for cycling loading messages
// This is like creating a timer-based service in Python that cycles through messages

import { useState, useEffect } from 'react';

interface CyclingLoadingMessageProps {
  isActive: boolean;
  messages: string[];
  intervalMs?: number;
}

export function useCyclingLoadingMessage({ 
  isActive, 
  messages, 
  intervalMs = 2000 // 2 seconds default
}: CyclingLoadingMessageProps): string {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (!isActive || messages.length === 0) {
      return;
    }

    // Set up the cycling interval
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => 
        (prevIndex + 1) % messages.length
      );
    }, intervalMs);

    // Clean up the interval when component unmounts or isActive changes
    return () => clearInterval(interval);
  }, [isActive, messages.length, intervalMs]);

  // Reset to first message when cycling starts
  useEffect(() => {
    if (isActive) {
      setCurrentMessageIndex(0);
    }
  }, [isActive]);

  return messages[currentMessageIndex] || messages[0] || '';
}
