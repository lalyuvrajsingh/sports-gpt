import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import config from '../config';

/**
 * Initializes the Pinecone client for vector storage
 * This is used for semantic search and knowledge retrieval
 */
export const initPinecone = async () => {
  try {
    const pinecone = new Pinecone({
      apiKey: config.pinecone.apiKey,
      environment: config.pinecone.environment,
    });

    // Get or create the index 
    const indexName = config.pinecone.indexName;
    
    const indexes = await pinecone.listIndexes();
    
    if (!indexes.some(index => index.name === indexName)) {
      console.log(`Creating Pinecone index ${indexName}...`);
      await pinecone.createIndex({
        name: indexName,
        dimension: 1536, // OpenAI embeddings dimension
        metric: 'cosine',
      });
      
      // Wait for index to be initialized
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
    
    const index = pinecone.index(indexName);
    
    return index;
  } catch (error) {
    console.error('Error initializing Pinecone:', error);
    throw error;
  }
};

/**
 * Creates a vector store for storing and retrieving sports knowledge
 */
export const createVectorStore = async () => {
  try {
    const index = await initPinecone();
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.openai.apiKey,
      modelName: 'text-embedding-3-small',
    });

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: 'sports-knowledge',
    });

    return vectorStore;
  } catch (error) {
    console.error('Error creating vector store:', error);
    throw error;
  }
};

/**
 * Similarity search in the vector store
 * @param query The user query to search for
 * @param k The number of results to return
 */
export const similaritySearch = async (query: string, k: number = 5) => {
  try {
    const vectorStore = await createVectorStore();
    const results = await vectorStore.similaritySearch(query, k);
    return results;
  } catch (error) {
    console.error('Error in similarity search:', error);
    throw error;
  }
}; 