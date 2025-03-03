import ChatUI from '@/src/components/ChatUI';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-gray-100">
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center text-blue-700">Sports GPT</h1>
          <p className="text-xl text-center text-gray-600 mt-2">
            Your AI assistant for cricket statistics and real-time updates
          </p>
        </header>
        
        <ChatUI />
        
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Powered by OpenAI, Perplexity Sonar API, and sports data providers</p>
          <p className="mt-1">© 2025 Sports GPT. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
