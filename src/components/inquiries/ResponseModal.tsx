'use client';

import { useState } from 'react';

interface ResponseModalProps {
  inquiry: any;
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string) => Promise<void>;
}

export default function ResponseModal({ inquiry, isOpen, onClose, onSend }: ResponseModalProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setIsSending(true);
    setError('');

    try {
      await onSend(message);
      setMessage('');
      onClose();
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen || !inquiry) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Respond to Inquiry</h2>
            <p className="text-sm text-gray-500">
              {inquiry.property?.title} • {inquiry.inquirerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Original Message */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Original Message:</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">{inquiry.message}</p>
            </div>
          </div>

          {/* Response */}
          <div>
            <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
              Your Response:
            </label>
            <textarea
              id="response"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your response here..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSending}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || !message.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : 'Send Response'}
          </button>
        </div>
      </div>
    </div>
  );
}
