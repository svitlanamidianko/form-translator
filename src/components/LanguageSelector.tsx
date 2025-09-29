// Language Selector Component - Reusable dropdown for form selection
// This is like creating a reusable widget class in Python

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: Record<string, string>;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  mobileOnly?: boolean; // New prop to show only form name on mobile
}

export default function LanguageSelector({
  value,
  onChange,
  options,
  isLoading = false,
  disabled = false,
  className = "",
  mobileOnly = false,
}: LanguageSelectorProps) {
  // Function to extract just the form name (before the dash)
  const getDisplayLabel = (label: string) => {
    // Always extract just the form name (everything before " - ")
    return label.split(' - ')[0];
  };

  // Get the current selected form name for display
  const currentDisplayLabel = value && options[value] ? getDisplayLabel(options[value]) : '';

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        <span>Loading forms...</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {mobileOnly ? (
        // Mobile: Functional dropdown but show only form names
        <>
          <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || isLoading}
            className="appearance-none bg-transparent border-0 text-sm font-medium text-blue-600 hover:text-blue-800 pr-6 cursor-pointer outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {Object.entries(options).map(([key, label]) => (
              <option key={key} value={key}>
                {getDisplayLabel(label)}
              </option>
            ))}
          </select>
          <svg 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600 pointer-events-none" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </>
      ) : (
        // Desktop: Show full dropdown with descriptions
        <>
          <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || isLoading}
            className="appearance-none bg-transparent border-0 text-sm font-medium text-blue-600 hover:text-blue-800 pr-6 cursor-pointer outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {Object.entries(options).map(([key, label]) => (
              <option key={key} value={key}>
                {getDisplayLabel(label)}
              </option>
            ))}
          </select>
          <svg 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600 pointer-events-none" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </>
      )}
    </div>
  );
}
