import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import config from '../config';
import { GroqEmbeddings } from '../embeddings/groq-embeddings';

// Set the dimension for sports-gpt-index
const SPORTS_INDEX_DIMENSION = 3072;

/**
 * Initializes the Pinecone client for vector storage
 * This is used for semantic search and knowledge retrieval
 */
export const initPinecone = async () => {
  try {
    // Initialize Pinecone client
    const pinecone = new Pinecone({
      apiKey: config.pinecone.apiKey,
      environment: config.pinecone.environment,
    });

    const indexName = config.pinecone.indexName;
    
    // List all indexes to check if our index exists
    const indexList = await pinecone.listIndexes();
    console.log("Available indexes:", indexList);
    
    let indexExists = false;
    let currentDimension = SPORTS_INDEX_DIMENSION; // Default dimension for new index
    
    if (indexList && Array.isArray(indexList)) {
      const existingIndex = indexList.find(idx => idx.name === indexName);
      if (existingIndex) {
        indexExists = true;
        currentDimension = existingIndex.dimension;
        console.log(`Found index ${indexName} with dimension ${currentDimension}`);
      }
    } else if (indexList && typeof indexList === 'object' && indexList.indexes) {
      // Handle case where listIndexes returns object with indexes property
      const existingIndex = indexList.indexes.find(idx => idx.name === indexName);
      if (existingIndex) {
        indexExists = true;
        currentDimension = existingIndex.dimension;
        console.log(`Found index ${indexName} with dimension ${currentDimension}`);
      }
    }
    
    if (indexExists) {
      console.log(`Using existing Pinecone index ${indexName} with dimension ${currentDimension}`);
    } else {
      // Index doesn't exist, create it
      console.log(`Creating Pinecone index ${indexName} with dimension ${SPORTS_INDEX_DIMENSION}...`);
      
      try {
        // Create index with starter spec (free tier)
        await pinecone.createIndex({
          name: indexName,
          dimension: SPORTS_INDEX_DIMENSION, // Dimension matching our embeddings
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });
        
        // Wait for index to be initialized
        console.log('Waiting for index to be ready...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        console.log(`Pinecone index ${indexName} created successfully`);
      } catch (createError) {
        // If index was created concurrently or already exists
        if (createError.name === 'PineconeConflictError') {
          console.log('Index was created concurrently, using existing index');
        } else {
          throw createError;
        }
      }
    }
    
    // Get the index without using potentially deprecated methods
    const index = pinecone.index(indexName);
    return index;
  } catch (error) {
    console.error('Error initializing Pinecone:', error);
    throw error;
  }
};

/**
 * Creates a vector store for storing and retrieving sports knowledge
 * Using Groq for embeddings generation
 */
export const createVectorStore = async () => {
  try {
    const index = await initPinecone();
    
    // Initialize custom Groq embeddings
    const embeddings = new GroqEmbeddings();

    // Create vector store
    return await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: 'sports',
    });
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