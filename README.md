# CricketGPT - AI-Powered Cricket Research

A Next.js application that provides comprehensive cricket information and analysis using AI research capabilities.

## Features

- AI-powered cricket research using Perplexity's Sonar API
- Real-time progress indicators for research tasks
- Comprehensive information about cricket players, tournaments, and statistics
- Clean, modern UI with light and dark mode support
- Mobile-responsive design

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd sports-gpt
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn
   ```

3. Configure environment variables
   Create a `.env.local` file in the root directory with the following variables:
   ```
   PERPLEXITY_API_KEY=your_api_key_here
   ```

4. Run the development server
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## Deployment

### Deploying to Vercel

The easiest way to deploy this application is using Vercel:

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```
3. Run the deployment command from the project root:
   ```
   vercel
   ```
4. Follow the prompts to complete deployment

Alternatively, you can connect your GitHub repository to Vercel for automatic deployments.

### Environment Variables for Production

Make sure to configure these environment variables in your Vercel project settings:

- `PERPLEXITY_API_KEY`: Your Perplexity API key for production research capabilities

## Mock Mode

The application includes a mock mode that automatically activates when the Perplexity API key is not configured. This allows for testing and demonstration without requiring actual API credentials.

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
