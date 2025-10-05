// Header Component - Clean separation of the app header
// This is like creating a separate header.py module in Python

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "Translate" }: HeaderProps) {
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
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
