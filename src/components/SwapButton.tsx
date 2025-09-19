// Swap Button Component - Handles the swap functionality between panels
// Simple, focused component following single responsibility principle

interface SwapButtonProps {
  onSwap: () => void;
  className?: string;
}

export default function SwapButton({ onSwap, className = "" }: SwapButtonProps) {
  return (
    <button 
      onClick={onSwap}
      className={`p-3 rounded-full hover:bg-gray-100 transition-colors bg-white border border-gray-300 shadow-sm ${className}`}
      title="Swap languages"
    >
      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    </button>
  );
}
