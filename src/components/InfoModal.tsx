'use client';

import { useState, useRef } from 'react';
import { submitFeedback } from '@/services/api';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    
    try {
      const response = await submitFeedback(feedback.trim());
      console.log('Feedback submitted successfully:', response);
      setFeedback('');
      setSubmitStatus('success');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
    } catch (error: unknown) {
      console.error('Failed to submit feedback:', error);
      setSubmitStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit feedback. Please try again.';
      setErrorMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className="bg-white text-gray-900 border border-gray-200 rounded-lg shadow-xl z-[9999] w-[90vw] max-w-md max-h-[80vh] overflow-y-auto"
    >

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* About Section */}
        <div>
          <div className="text-sm text-gray-700 space-y-2 leading-relaxed">
            <h3 className="text-sm font-medium text-gray-800 mb-3">
              hi internet friend 🌻,
            </h3>
            <p>
              welcome to Form Translator - a tool for translating between Ontological Forms.
              <br />
              <br />
              #thesis: we believe that the same Fuzzy and Ineffable is wrapped into different vocabularies - each belonging to certain tribe&apos;s world. 
              however, in essence, different tribes often point to the same Fuzzy and Ineffable, they just dress it into different &quot;ontological clothes.&quot; 
   

              that is, i can communitcate and point to one thing in infinite ways, each appealing to certain audiences.
            </p>
            <br />
            <p>
              thank you for directing your attention to my philosophical art project.
              <br />
              <br />
              <a href="https://www.notion.so/svitlanamm/form-translator-prompt-and-philosophical-meta-stuff-29095a10886f805da6f6c37047343e79?source=copy_link" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">notion with philosophy</a> | <span className="underline"><a href="https://github.com/svitlanamidianko/form-translator">github with code</a></span>.
          
              <br />
              </p> <br /><p>
              huggingly 💛,
              <br/> 
              svitlana.me:)
            </p>
          </div>
        </div>

        {/* Feedback Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">feedback box: what do you see?</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="blurb coooby dooby doo | feedback, pokes, bugs, random existential contemplations are welcome | challenge me and help me grow <3 | this will stay anonymous unless you choose leave yr email | what is the difference between Form and Frame?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-300"
                rows={4}
              />
            </div>
            
            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
                ✓ yummy tummy thank you
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                ✗ {errorMessage}
              </div>
            )}
            
            <button
              type="submit"
              disabled={!feedback.trim() || isSubmitting}
              className="bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'submitting...' : 'submit'}
            </button>
          </form>
          
          {/* Google Attribution */}
          <div className="mt-4 text-[10px] text-gray-400 text-left">
            thank you google and <a href="https://svitlanamm.notion.site/Metaphors-we-live-by-ad0624d602d7491994f4500fd580c7b6?source=copy_link" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">metaphors we live by</a> for inspiring this art project, which is not intended for profit.
          </div>
        </div>
      </div>
    </div>
  );
}
