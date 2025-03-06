import { useChat } from 'ai/react';
import { useState } from 'react';

export default function ChatUI() {
  const [loading, setLoading] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, error } = useChat({
    api: '/api/chat',
    streamProtocol: 'text',
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await handleSubmit(e);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-5xl mx-auto w-full p-4">
      <div className="flex-1 overflow-y-auto mb-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800">
        {messages.length === 0 && (
          <div className="text-center space-y-6 py-12">
            <h2 className="text-3xl font-medium tracking-tight text-zinc-100">Welcome to Sports GPT</h2>
            <p className="text-lg text-zinc-300 font-light">Get real-time cricket information, statistics, and analysis. Try asking:</p>
            <div className="space-y-3 text-zinc-400 font-light max-w-2xl mx-auto">
              <div className="p-4 rounded-2xl bg-zinc-800/50 backdrop-blur-sm hover:bg-zinc-800/70 transition-colors cursor-pointer">
                • Who is the highest run scorer in IPL history?
              </div>
              <div className="p-4 rounded-2xl bg-zinc-800/50 backdrop-blur-sm hover:bg-zinc-800/70 transition-colors cursor-pointer">
                • How many wickets has Jasprit Bumrah taken in the last IPL season?
              </div>
              <div className="p-4 rounded-2xl bg-zinc-800/50 backdrop-blur-sm hover:bg-zinc-800/70 transition-colors cursor-pointer">
                • Which team has won the most Cricket World Cups?
              </div>
              <div className="p-4 rounded-2xl bg-zinc-800/50 backdrop-blur-sm hover:bg-zinc-800/70 transition-colors cursor-pointer">
                • Give me live cricket match scores
              </div>
            </div>
          </div>
        )}
        
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`rounded-2xl px-6 py-4 max-w-[85%] backdrop-blur-sm ${
                message.role === 'user'
                  ? 'bg-blue-600/90 text-white'
                  : 'bg-zinc-800/90 text-zinc-100'
              }`}
            >
              <div className="text-sm mb-1.5 opacity-80 font-medium tracking-wide">
                {message.role === 'user' ? 'You' : 'Sports GPT'}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed font-light">{message.content}</div>
            </div>
          </div>
        ))}
        
        {/* Error display */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 my-4">
            <p className="font-medium">Error: {error.message || 'An error occurred'}</p>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="relative">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about cricket stats, matches, and players..."
          className="w-full rounded-2xl bg-zinc-800/90 backdrop-blur-sm border border-zinc-700 px-6 py-4 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all font-light"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className={`absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-xl bg-blue-600/90 text-white font-medium tracking-wide backdrop-blur-sm ${
            loading || !input.trim()
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 transition-all'
          }`}
        >
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
} 