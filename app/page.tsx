'use client';

import ChatUI from './components/ChatUI';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-medium tracking-tight bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
              Sports GPT
            </h1>
            <nav className="flex gap-6 text-sm font-light">
              <a href="#" className="text-zinc-400 hover:text-zinc-100 transition-colors">About</a>
              <a href="#" className="text-zinc-400 hover:text-zinc-100 transition-colors">Documentation</a>
              <a href="#" className="text-zinc-400 hover:text-zinc-100 transition-colors">GitHub</a>
            </nav>
          </div>
          <p className="text-zinc-400 mt-3 font-light tracking-wide">
            Your AI assistant for cricket statistics and real-time updates
          </p>
        </div>
      </header>

      {/* Chat Interface */}
      <ChatUI />

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-xl py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-3">Powered by</h3>
              <ul className="space-y-2 text-sm text-zinc-400 font-light">
                <li>OpenAI</li>
                <li>Perplexity Sonar API</li>
                <li>Sports Data Providers</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-3">Resources</h3>
              <ul className="space-y-2 text-sm text-zinc-400 font-light">
                <li>API Documentation</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-3">Connect</h3>
              <ul className="space-y-2 text-sm text-zinc-400 font-light">
                <li>Twitter</li>
                <li>GitHub</li>
                <li>Discord</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
            <p className="text-sm text-zinc-400 font-light">
              © 2025 Sports GPT. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
