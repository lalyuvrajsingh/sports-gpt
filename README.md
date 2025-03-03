# Sports GPT

A specialized, cricket-focused AI assistant that provides real-time updates, in-depth analysis, and comprehensive statistics for cricket matches, players, and tournaments.

## Features

- **Real-time Cricket Data**: Access live match scores, player statistics, and tournament information
- **In-depth Analysis**: Get detailed insights and statistics about players and matches
- **Advanced Query Capabilities**: Ask specific questions about cricket stats like "Total number of last overs bowled by Jasprit in IPL"
- **Semantic Search**: Retrieves relevant information from the knowledge base
- **Web Research**: Uses Perplexity Sonar API to fetch the latest cricket information

## Architecture

Sports GPT is built with a modern tech stack:

- **Frontend**: Next.js with Vercel AI SDK and React
- **LLM**: OpenAI (GPT-4)
- **Vector Database**: Pinecone for knowledge retrieval
- **Agent Framework**: LangChain and LangGraph for orchestrating complex queries
- **Research API**: Perplexity Sonar API for real-time web research
- **Sports Data**: Integration with cricket data providers

The application follows an agent-based architecture where different tools and APIs are coordinated to provide comprehensive answers to user queries.

## Getting Started

### Prerequisites

- Node.js 18.18.0 or later
- OpenAI API key
- Pinecone account and API key
- Perplexity API key
- Sports API key (such as CricInfo API)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sports-gpt.git
   cd sports-gpt
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add the following variables:
   ```
   # OpenAI API Key
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Perplexity API Key
   PERPLEXITY_API_KEY=your_perplexity_api_key_here
   
   # Pinecone Configuration
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_ENVIRONMENT=your_pinecone_environment_here
   PINECONE_INDEX_NAME=sports-gpt-index
   
   # Sports API Keys
   SPORTS_API_KEY=your_sports_api_key_here
   SPORTS_API_HOST=your_sports_api_host_here
   
   # Optional: Set this to control the model used
   OPENAI_MODEL=gpt-4o
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Type your cricket-related question in the chat input
2. The AI will process your query, fetch relevant data, and provide a comprehensive answer
3. You can ask follow-up questions to get more specific information

Example queries:
- "Who has scored the most centuries in ODI cricket?"
- "What are Jasprit Bumrah's bowling stats in the last IPL season?"
- "Show me live cricket match scores"
- "How many times has India won the Cricket World Cup?"

## Project Structure

```
sports-gpt/
├── app/                  # Next.js App Router
│   ├── api/              # API routes
│   │   └── chat/         # Chat API endpoint
│   └── page.tsx          # Main page component
├── src/
│   ├── components/       # React components
│   │   └── ChatUI.tsx    # Chat interface component
│   └── lib/             # Application logic
│       ├── agents/       # LangGraph agents
│       ├── api/          # API client implementations
│       ├── tools/        # LangChain tools
│       └── vector-store/ # Pinecone vector store setup
├── public/               # Static assets
├── .env.local            # Environment variables (create this)
└── package.json          # Project dependencies
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for the GPT models
- Vercel for the AI SDK
- LangChain and LangGraph for the agent framework
- Pinecone for vector database
- Perplexity for the Sonar API
- Various sports data providers for cricket statistics
