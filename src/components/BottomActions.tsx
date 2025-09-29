// Bottom Actions Component - Action buttons at the bottom of the page
// Extracted for better organization and reusability

interface ActionButton {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

interface BottomActionsProps {
  onHistoryClick?: () => void;
}

export default function BottomActions({ onHistoryClick }: BottomActionsProps) {
  const actions: ActionButton[] = [
    {
      id: 'history',
      label: 'history',
      icon: (
        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13,3A9,9 0 0,0 4,12H1L4.89,15.89L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3Z" />
        </svg>
      ),
      onClick: onHistoryClick,
    },
  ];

  return (
    <div className="flex items-center justify-center space-x-16 mt-8 py-6 bg-white lg:bg-transparent lg:mt-12">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors bg-white shadow-sm">
            {action.icon}
          </div>
          <span className="text-sm text-gray-600 font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
