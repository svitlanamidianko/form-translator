// Custom Hook for Clipboard Operations
// This eliminates the duplicate clipboard logic across components
// Like creating a reusable utility function in Python

import { useState } from 'react';

interface UseClipboardReturn {
  copyToClipboard: (text: string) => Promise<boolean>;
  showCopiedMessage: boolean;
  isSupported: boolean;
}

export function useClipboard(duration: number = 2000): UseClipboardReturn {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  
  // Check if clipboard API is supported
  const isSupported = typeof navigator !== 'undefined' && 'clipboard' in navigator;

  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (!text || !text.trim()) {
      console.warn('Cannot copy empty text to clipboard');
      return false;
    }

    try {
      // Try modern clipboard API first
      if (isSupported) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          throw new Error('Fallback copy command failed');
        }
      }

      // Show success message
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), duration);
      
      console.log('Text copied to clipboard successfully');
      return true;
      
    } catch (error) {
      console.error('Failed to copy text to clipboard:', error);
      return false;
    }
  };

  return {
    copyToClipboard,
    showCopiedMessage,
    isSupported,
  };
}
