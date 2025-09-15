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
      {/* Header - similar to Google Translate */}
      <header className="border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FT</span>
            </div>
            <h1 className="text-xl font-medium text-gray-700">Form Translate</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v5a1 1 0 102 0V5z" />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Content Type Tabs */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button className="py-4 px-2 border-b-2 border-blue-500 text-blue-600 font-medium text-sm flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
              </svg>
              <span>Text</span>
            </button>
            <button className="py-4 px-2 text-gray-500 hover:text-gray-700 font-medium text-sm flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
              </svg>
              <span>Images</span>
            </button>
            <button className="py-4 px-2 text-gray-500 hover:text-gray-700 font-medium text-sm flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
              </svg>
              <span>Documents</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Translation Interface */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Form Type Selectors */}
        <div className="flex items-center justify-between mb-6">
          {/* Source Form Dropdown */}
          <div className="relative">
            <select 
              value={sourceForm}
              onChange={(e) => setSourceForm(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(FORM_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Swap Button */}
          <button 
            onClick={handleSwapForms}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l4-4-4-4m6 8l4-4-4-4" />
            </svg>
          </button>

          {/* Target Form Dropdown */}
          <div className="relative">
            <select 
              value={targetForm}
              onChange={(e) => setTargetForm(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(FORM_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Translation Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input Panel */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-2 bg-gray-50">
              <span className="text-sm font-medium text-gray-700">
                {FORM_TYPES[sourceForm as keyof typeof FORM_TYPES]}
              </span>
            </div>
            <div className="p-4">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to transform..."
                className="w-full h-32 resize-none border-none outline-none text-gray-900 text-lg"
                onInput={handleTranslate}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <button className="p-1 rounded hover:bg-gray-100">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12H6a1 1 0 01-1-1V9a1 1 0 011-1h3.382l1.447-1.724A1 1 0 0112 6h0a1 1 0 01.829.44L14.236 8H15a1 1 0 011 1v6a1 1 0 01-1 1h-.764l-1.407 1.56A1 1 0 0112 18h0a1 1 0 01-.171-.015z" />
                    </svg>
                  </button>
                </div>
                <span className="text-xs text-gray-500">{inputText.length} / 5,000</span>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
            <div className="border-b border-gray-200 px-4 py-2 bg-gray-100">
              <span className="text-sm font-medium text-gray-700">
                {FORM_TYPES[targetForm as keyof typeof FORM_TYPES]}
              </span>
            </div>
            <div className="p-4">
              <div className="w-full h-32 text-gray-900 text-lg">
                {isTranslating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-gray-500">Transforming...</span>
                  </div>
                ) : (
                  outputText || <span className="text-gray-400">Translation</span>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <button className="p-1 rounded hover:bg-gray-100">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12H6a1 1 0 01-1-1V9a1 1 0 011-1h3.382l1.447-1.724A1 1 0 0112 6h0a1 1 0 01.829.44L14.236 8H15a1 1 0 011 1v6a1 1 0 01-1 1h-.764l-1.407 1.56A1 1 0 0112 18h0a1 1 0 01-.171-.015z" />
                    </svg>
                  </button>
                  <button className="p-1 rounded hover:bg-gray-100">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-center space-x-8 mt-8">
          <button className="flex flex-col items-center space-y-1 p-3 rounded-lg hover:bg-gray-100">
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
              </svg>
            </div>
            <span className="text-xs text-gray-600">History</span>
          </button>
          
          <button className="flex flex-col items-center space-y-1 p-3 rounded-lg hover:bg-gray-100">
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-xs text-gray-600">Saved</span>
          </button>
        </div>
      </div>
    </div>
  );
}
