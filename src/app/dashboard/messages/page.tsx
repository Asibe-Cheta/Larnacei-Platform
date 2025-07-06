'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatPrice } from '@/utils/formatters';
import { formatDate } from '@/utils/formatters';

interface Message {
  id: string;
  content: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    email: string;
  };
  attachments: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>;
}

interface Conversation {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  property: {
    id: string;
    title: string;
    location: string;
    city: string;
    state: string;
    price: number;
    currency: string;
    images: Array<{ url: string }>;
  };
  participants: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      phone: string | null;
    };
  }>;
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    sender: {
      id: string;
      name: string | null;
    };
  }>;
  _count: {
    messages: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    propertyId: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchConversations();
    }
  }, [status, filters]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/conversations?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setConversations(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch messages');
      console.error('Error fetching messages:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSendingMessage(true);

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          messageType: 'TEXT',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewMessage('');
        fetchMessages(selectedConversation.id);
        fetchConversations(); // Refresh conversation list to update unread counts
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'ARCHIVED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    const currentUserId = (session?.user as any)?.id;
    return conversation.participants.find(p => p.user.id !== currentUserId);
  };

  if (status === 'loading') {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="text-center py-10 text-[#7C0302]">You must be signed in to view your messages.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">Communicate with property owners and potential buyers/renters.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange({ status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Conversations</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            >
              <option value="updatedAt">Last Activity</option>
              <option value="createdAt">Created Date</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange({ sortOrder: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
            </div>

            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-red-600 text-sm">{error}</p>
                <button
                  onClick={fetchConversations}
                  className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm text-gray-600">No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {conversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation);
                  const lastMessage = conversation.messages[0];
                  const isSelected = selectedConversation?.id === conversation.id;

                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        isSelected ? 'bg-red-50 border-r-2 border-red-600' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 h-10 w-10">
                          {conversation.property.images[0] ? (
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={conversation.property.images[0].url}
                              alt={conversation.property.title}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.property.title}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {otherParticipant?.user.name || otherParticipant?.user.email}
                          </p>
                          {lastMessage && (
                            <p className="text-xs text-gray-400 truncate mt-1">
                              {lastMessage.sender.name || 'Someone'}: {lastMessage.content}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(conversation.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border h-96 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10">
                      {selectedConversation.property.images[0] ? (
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={selectedConversation.property.images[0].url}
                          alt={selectedConversation.property.title}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedConversation.property.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.property.city}, {selectedConversation.property.state}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(selectedConversation.property.price, selectedConversation.property.currency)}
                      </p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedConversation.status)}`}>
                      {selectedConversation.status}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-gray-600">No messages yet</p>
                      <p className="text-sm text-gray-500">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.sender.id === (session?.user as any)?.id;

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwnMessage
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="text-sm font-medium mb-1">
                              {message.sender.name || message.sender.email}
                            </div>
                            <div className="text-sm">{message.content}</div>
                            <div className={`text-xs mt-1 ${isOwnMessage ? 'text-red-100' : 'text-gray-500'}`}>
                              {formatDate(message.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      disabled={sendingMessage}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingMessage ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        'Send'
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to start messaging.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 