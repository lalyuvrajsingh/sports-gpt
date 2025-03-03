'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';

/**
 * Chat UI component for the Sports GPT interface
 */
export default function ChatUI() {
  // Initialize the chat using Vercel's AI SDK
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
  });

  // Reference to the message container for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto h-[80vh] p-4 bg-white rounded-lg shadow-md">
      {/* Chat header */}
      <div className="border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Sports GPT</h2>
        <p className="text-sm text-gray-600">
          Ask questions about cricket statistics, matches, and players.
        </p>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-auto mb-4 space-y-4 p-4 rounded-lg bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg font-medium">Welcome to Sports GPT!</p>
            <p className="mt-2">
              Get real-time cricket information, statistics, and analysis. Try asking:
            </p>
            <div className="mt-4 space-y-2">
              <p className="bg-blue-50 p-2 rounded">Who is the highest run scorer in IPL history?</p>
              <p className="bg-blue-50 p-2 rounded">How many wickets has Jasprit Bumrah taken in the last IPL season?</p>
              <p className="bg-blue-50 p-2 rounded">Which team has won the most Cricket World Cups?</p>
              <p className="bg-blue-50 p-2 rounded">Give me live cricket match scores</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                message.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-white border border-gray-200'
              } max-w-[80%] ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
            >
              <div className="font-semibold mb-1">
                {message.role === 'user' ? 'You' : 'Sports GPT'}
              </div>
              <div className="text-gray-800 whitespace-pre-wrap">{message.content}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {error && (
        <div className="text-red-500 mb-4 p-2 bg-red-50 rounded-lg">
          Error: {error.message || 'Something went wrong. Please try again.'}
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about cricket stats, matches, or players..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-blue-300 hover:bg-blue-700 transition-colors"
        >
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
}