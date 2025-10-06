'use client';

import { useState, useRef, useEffect } from 'react';
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
    } catch (error: any) {
      console.error('Failed to submit feedback:', error);
      setSubmitStatus('error');
      setErrorMessage(error.response?.data?.error || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className="bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] w-[90vw] max-w-md max-h-[80vh] overflow-y-auto"
    >

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* About Section */}
        <div>
          <div className="text-sm text-gray-600 space-y-2 leading-relaxed">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              hi internet friend 🌻,
            </h3>
            <p>
              welcome to Form Translator - a tool for translating between Ontological Forms.
              <br />
              <br />
              #thesis: we believe that the same Fuzzy and Ineffable is wrapped into different vocabularies - each belonging to certain tribe's world. 
              however, in essense, different tribes often point to the same Fuzzy and Ineffable, they just dress it into different "ontological clothes." 
            </p>
            <br />
            <p>
              that is, i can say one thing in infinite ways, each appealing to certain audiences.
            </p>
            <br />
            <p>
              thank you for directing your attention to my philosophical art project.<a href="https://github.com/svitlanamidianko/form-translator"> it is <span className="underline">open-source</span> if you want to co-create:)  </a>
          
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-500"
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
        </div>
      </div>
    </div>
  );
}
