'use client';

import { useState } from 'react';
import { formatDate } from '@/utils/formatters';
import ResponseModal from './ResponseModal';

interface InquiryDetailModalProps {
  inquiry: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function InquiryDetailModal({ inquiry, isOpen, onClose }: InquiryDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'messages'>('details');
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !inquiry) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800';
      case 'RESPONDED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      case 'SPAM': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInquiryTypeLabel = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleSendResponse = async (message: string) => {
    setIsSending(true);
    try {
      const response = await fetch(`/api/inquiries/${inquiry.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to send response');
      }

      // Refresh the inquiry data or close the modal
      window.location.reload();
    } catch (error) {
      console.error('Error sending response:', error);
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Inquiry Details</h2>
            <p className="text-sm text-gray-500">
              {inquiry.property?.title} • {formatDate(inquiry.createdAt)}
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

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'details'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'messages'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Messages
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Status</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inquiry.status)}`}>
                  {inquiry.status.replace('_', ' ')}
                </span>
              </div>

              {/* Property Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Property Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Title:</span>
                    <span className="text-sm font-medium">{inquiry.property?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="text-sm font-medium">{inquiry.property?.city}, {inquiry.property?.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Price:</span>
                    <span className="text-sm font-medium">
                      {inquiry.property?.currency} {inquiry.property?.price?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inquirer Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Inquirer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm font-medium">{inquiry.inquirerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium">{inquiry.inquirerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="text-sm font-medium">{inquiry.inquirerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Preferred Contact:</span>
                    <span className="text-sm font-medium">{inquiry.preferredContactMethod}</span>
                  </div>
                </div>
              </div>

              {/* Inquiry Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Inquiry Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="text-sm font-medium">{getInquiryTypeLabel(inquiry.inquiryType)}</span>
                  </div>
                  {inquiry.intendedUse && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Intended Use:</span>
                      <span className="text-sm font-medium">{inquiry.intendedUse}</span>
                    </div>
                  )}
                  {inquiry.budget && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Budget:</span>
                      <span className="text-sm font-medium">{inquiry.budget.toLocaleString()}</span>
                    </div>
                  )}
                  {inquiry.timeframe && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Timeframe:</span>
                      <span className="text-sm font-medium">{inquiry.timeframe}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Financing Needed:</span>
                    <span className="text-sm font-medium">{inquiry.financingNeeded ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Request Viewing:</span>
                    <span className="text-sm font-medium">{inquiry.requestViewing ? 'Yes' : 'No'}</span>
                  </div>
                  {inquiry.viewingDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Viewing Date:</span>
                      <span className="text-sm font-medium">{inquiry.viewingDate}</span>
                    </div>
                  )}
                  {inquiry.viewingTime && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Viewing Time:</span>
                      <span className="text-sm font-medium">{inquiry.viewingTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Message</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{inquiry.message}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiry.conversation?.messages?.length > 0 ? (
                inquiry.conversation.messages.map((message: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {message.senderId === inquiry.property?.ownerId ? 'You' : inquiry.inquirerName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{message.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-gray-500">No messages yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => setIsResponseModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Respond
          </button>
        </div>
      </div>

      {/* Response Modal */}
      <ResponseModal
        inquiry={inquiry}
        isOpen={isResponseModalOpen}
        onClose={() => setIsResponseModalOpen(false)}
        onSend={handleSendResponse}
      />
    </div>
  );
} 