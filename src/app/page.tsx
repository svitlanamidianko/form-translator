'use client';

import { useState } from 'react';
// Using inline SVGs instead of Heroicons to avoid installation issues

// These are like Python dictionaries - storing our form types
const FORM_TYPES = {
  'formal': 'Formal/Academic',
  'casual': 'Casual/Conversational', 
  'poetic': 'Poetic/Artistic',
  'technical': 'Technical/Scientific',
  'emotional': 'Emotional/Expressive',
  'abstract': 'Abstract/Philosophical',
  'direct': 'Direct/Blunt',
  'metaphorical': 'Metaphorical/Symbolic'
};

export default function Home() {
  // State is like variables in Python, but React re-renders when they change
  const [sourceForm, setSourceForm] = useState('formal');
  const [targetForm, setTargetForm] = useState('poetic');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleSwapForms = () => {
    // Swap source and target forms
    const temp = sourceForm;
    setSourceForm(targetForm);
    setTargetForm(temp);
    
    // Also swap the text content
    const tempText = inputText;
    setInputText(outputText);
    setOutputText(tempText);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setIsTranslating(true);
    // TODO: This will connect to your backend later
    // For now, just simulate the translation
    setTimeout(() => {
      setOutputText(`[${FORM_TYPES[targetForm as keyof typeof FORM_TYPES]} version of: "${inputText}"]`);
      setIsTranslating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Google Translate Style */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
               src="/translate-logo.png" 
              alt="Translate Logo" 
               className="h-8 w-auto"
            />
            <h1 className="text-xl font-normal text-gray-800" style={{fontFamily: 'Roboto, sans-serif', fontSize: '28px', color: '#5f6368'}}>Translate</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M21,9V7L15,1H5C3.89,1 3,1.89 3,3V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V9M19,9H14V4H5V19H19V9Z" />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Content Type Tabs - Google Translate Style */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex">
            {/* Active Tab - Text */}
            <button className="relative px-6 py-4 text-sm font-medium text-blue-600 bg-white border border-gray-300 border-b-white rounded-t-lg flex items-center space-x-2 -mb-px z-10">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z" />
              </svg>
              <span>Text</span>
            </button>
            
            {/* Inactive Tabs */}
            <button className="px-6 py-4 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
              </svg>
              <span>Images</span>
            </button>
            
            <button className="px-6 py-4 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z" />
              </svg>
              <span>Documents</span>
            </button>
            
            <button className="px-6 py-4 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
              </svg>
              <span>Websites</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Translation Interface */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Translation Panels - Google Translate Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
          
          {/* Left Panel - Input */}
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Language Selection INSIDE the box header */}
            <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 flex items-center space-x-2">
         
              <div className="relative">
                <select 
                  value={sourceForm}
                  onChange={(e) => setSourceForm(e.target.value)}
                  className="appearance-none bg-transparent border-0 text-sm font-medium text-blue-600 hover:text-blue-800 pr-6 cursor-pointer outline-none"
                >
                  {Object.entries(FORM_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <svg className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Input Text Area */}
            <div className="p-4">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to transform..."
                className="w-full h-48 resize-none border-none outline-none text-gray-900 text-base leading-relaxed"
                onInput={handleTranslate}
              />
              <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                </div>
                <span className="text-xs text-gray-500">{inputText.length} / 5,000</span>
              </div>
            </div>
          </div>

          {/* Swap Button - Centered between the two boxes */}
          <div className="hidden lg:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <button 
              onClick={handleSwapForms}
              className="p-3 rounded-full hover:bg-gray-100 transition-colors bg-white border border-gray-300 shadow-sm"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          </div>

          {/* Right Panel - Output */}
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50 shadow-sm">
            {/* Language Selection INSIDE the box header */}
            <div className="border-b border-gray-200 px-4 py-3 bg-gray-100 flex items-center space-x-2">
              <div className="relative">
                <select 
                  value={targetForm}
                  onChange={(e) => setTargetForm(e.target.value)}
                  className="appearance-none bg-transparent border-0 text-sm font-medium text-blue-600 hover:text-blue-800 pr-6 cursor-pointer outline-none"
                >
                  {Object.entries(FORM_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <svg className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Output Text Area */}
            <div className="p-4 bg-gray-50">
              <div className="w-full h-48 text-gray-900 text-base leading-relaxed">
                {isTranslating ? (
                  <div className="flex items-center space-x-2 pt-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    <span className="text-gray-500">Transforming...</span>
                  </div>
                ) : (
                  outputText || <span className="text-gray-400">Translation</span>
                )}
              </div>
              <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Swap Button */}
          <div className="lg:hidden flex justify-center">
            <button 
              onClick={handleSwapForms}
              className="p-3 rounded-full hover:bg-gray-100 transition-colors bg-white border border-gray-300 shadow-sm"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom Actions - Google Translate Style */}
        <div className="flex items-center justify-center space-x-12 mt-12">
          <button className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13,3A9,9 0 0,0 4,12H1L4.89,15.89L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3Z" />
              </svg>
            </div>
            <span className="text-xs text-gray-600 font-medium">History</span>
          </button>
          
          <button className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z" />
              </svg>
            </div>
            <span className="text-xs text-gray-600 font-medium">Saved</span>
          </button>
        </div>
      </div>
    </div>
  );
}
