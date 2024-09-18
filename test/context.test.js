import {OneContextClient} from "./../dist/index.js"
import {describe, expect, test, beforeAll, afterAll} from '@jest/globals';
import * as dotenv from 'dotenv';
import {fileURLToPath} from 'url';
import path from 'path';
import fs from 'fs/promises';
import {z} from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({path: envPath});

const API_KEY = process.env.ONECONTEXT_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = process.env.BASE_URL;

// Check if required environment variables are set
if (!API_KEY || !OPENAI_API_KEY) {
  console.error('Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

console.log({BASE_URL})

const ocClient = new OneContextClient({apiKey: API_KEY, openAiKey: OPENAI_API_KEY, baseUrl: BASE_URL});


async function consumeResponse(response) {
  await response.text();
}

describe('Context Operations', () => {
  const testContextName1 = 'jest-test-context-files';
  const testContextName2 = 'jest-test-context-directory';
  const testFilesDir = path.join(__dirname, 'files');
  let contextCreated1 = false;
  let contextCreated2 = false;

  beforeAll(async () => {
    const files = await fs.readdir(testFilesDir);
    if (files.length === 0) {
      throw new Error('No test files found in the files directory');
    }
  });

  afterAll(async () => {
    // Cleanup contexts if they were created
    if (contextCreated1) {
      const deleteResponse = await ocClient.deleteContext({contextName: testContextName1});
      await consumeResponse(deleteResponse);
    }
    if (contextCreated2) {
      const deleteResponse = await ocClient.deleteContext({contextName: testContextName2});
      await consumeResponse(deleteResponse);
    }

  });

  describe('uploadFiles method', () => {
    test('should create a context, upload files, and search', async () => {
      // Create context
      const createResult = await ocClient.createContext({contextName: testContextName1});
      expect(createResult.ok).toBe(true);
      const createData = await createResult.json();
      expect(createData).toBeDefined();
      contextCreated1 = true;

      try {
        // Prepare file paths
        const files = await fs.readdir(testFilesDir);
        const validFiles = files.filter(file => file.endsWith('.pdf') || file.endsWith('.docx'));
        const filePaths = validFiles.map(file => ({
          path: path.join(testFilesDir, file)
        }));

        // Upload files
        const uploadResult = await ocClient.uploadFiles({
          contextName: testContextName1,
          stream: false,
          files: filePaths,
          metadataJson: {
            "testString": "string",
            "testArray": ["testArrayElement1", "testArrayElement2"],
            "testInt": 123,
            "testBool": true,
            "testFloat": 1.4
          },
          maxChunkSize: 500, // 500B chunk size as per your previous modification
        });

        expect(uploadResult.ok).toBe(true);
        const uploadData = await uploadResult.json();
        expect(uploadData).toBeDefined();

        // Wait for processing
        await waitForProcessing(testContextName1);

        // Perform search
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds before trying to search

        await performSearchNoMeta(testContextName1);
        await performSearchWithMeta(testContextName1);
        await performSearchWithMetaExtendedWithRedundantOr(testContextName1);
        await performGetChunksNoMeta(testContextName1);
        await performGetChunksWithMeta(testContextName1);
        await performGetChunksWithMetaNoResults(testContextName1);
      } finally {

      }
    }, 240000); // 4 minute total timeout 
  });

  describe('uploadDirectory method', () => {
    test('should create a context, upload directory, and search', async () => {
      // Create context
      const createResult = await ocClient.createContext({contextName: testContextName2});
      expect(createResult.ok).toBe(true);
      const createData = await createResult.json();
      expect(createData).toBeDefined();
      contextCreated2 = true;

      // Upload directory
      const uploadResult = await ocClient.uploadDirectory({
        contextName: testContextName2,
        directory: testFilesDir,
        metadataJson: {
          "testString": "string",
          "testArray": ["testArrayElement1", "testArrayElement2"],
          "testInt": 123,
          "testBool": true,
          "testFloat": 1.4
        },
        maxChunkSize: 500, // 500 character chunk size
      });
      expect(uploadResult.ok).toBe(true);
      const uploadData = await uploadResult.json();
      expect(uploadData).toBeDefined();


      // Wait for processing
      await waitForProcessing(testContextName2);

      // Perform search
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds before trying to search

      await performSearchNoMeta(testContextName2);
      await performSearchWithMeta(testContextName2);
      await performSearchWithMetaExtendedWithRedundantOr(testContextName2);
      await performGetChunksNoMeta(testContextName2);
      await performGetChunksWithMeta(testContextName2);
      await performGetChunksWithMetaNoResults(testContextName2);

    }, 300000); // 5 minute total timeout 
  });
});

async function waitForProcessing(contextName) {
  let allFilesProcessed = false;
  let attempts = 0;
  const maxAttempts = 6; // 
  const waitTime = 20000; // 15 seconds

  while (!allFilesProcessed && attempts < maxAttempts) {
    const listResult = await ocClient.listFiles({contextName: contextName});
    expect(listResult.ok).toBe(true);
    const listData = await listResult.json();
    expect(listData).toBeDefined();

    allFilesProcessed = listData.files.every(file => file.status === 'COMPLETED');

    if (!allFilesProcessed) {
      await new Promise(resolve => setTimeout(resolve, waitTime)); // Wait for waitTime seconds before checking again
      attempts++;
    }
  }

  if (!allFilesProcessed) {
    throw new Error(`File processing timed out for context ${contextName}`);
  }
}

async function performSearchNoMeta(contextName) {
  const searchResult = await ocClient.contextSearch({
    query: "test content",
    contextName: contextName,
    topK: 20,
    semanticWeight: 0.5,
    fullTextWeight: 0.5,
    rrfK: 10,
    includeEmbedding: false
  });
  expect(searchResult.ok).toBe(true);
  const searchData = await searchResult.json();
  console.log({searchData})
  expect(searchData).toBeDefined();
  expect(searchData.length).toBeGreaterThan(0);
}

async function performSearchWithMeta(contextName) {
  const searchResult = await ocClient.contextSearch({
    query: "test content",
    contextName: contextName,
    topK: 20,
    semanticWeight: 0.5,
    fullTextWeight: 0.5,
    rrfK: 10,
    includeEmbedding: false,
    metadataFilters: {
      $and: [{
        "testString": {"$eq": "string"},
      }, {
        "testArray": {"$contains": "testArrayElement1"},
      }, {
        "testInt": {"$eq": 123},
      }, {
        "testBool": {"$eq": true},
      }, {
        "testFloat": {"$eq": 1.4}
      }]
    }
  });
  expect(searchResult.ok).toBe(true);
  const searchData = await searchResult.json();
  console.log({searchData})
  expect(searchData).toBeDefined();
  expect(searchData.length).toBeGreaterThan(0);
}

async function performSearchWithMetaExtendedWithRedundantOr(contextName) {
  const searchResult = await ocClient.contextSearch({
    query: "test content",
    contextName: contextName,
    topK: 20,
    semanticWeight: 0.5,
    fullTextWeight: 0.5,
    rrfK: 10,
    includeEmbedding: false,
    metadataFilters: {
      $or: [{
        $and: [{
          "testString": {"$eq": "string"},
        }, {
          "testArray": {"$contains": "testArrayElement1"},
        }, {
          "testInt": {"$eq": 123},
        }, {
          "testBool": {"$eq": true},
        }, {
          "testFloat": {"$eq": 1.4}
        }]
      }, {
        "testString": {"$eq": "mrmagoo"},
      }]
    }
  });
  expect(searchResult.ok).toBe(true);
  const searchData = await searchResult.json();
  console.log({searchData})
  expect(searchData).toBeDefined();
  expect(searchData.length).toBeGreaterThan(0);
}

async function performGetChunksWithMeta(contextName) {
  const searchResult = await ocClient.contextGet({
    contextName: contextName,
    limit: 20,
    includeEmbedding: false,
    metadataFilters: {
      $or: [{
        $and: [{
          "testString": {"$eq": "string"},
        }, {
          "testArray": {"$contains": "testArrayElement1"},
        }, {
          "testInt": {"$eq": 123},
        }, {
          "testBool": {"$eq": true},
        }, {
          "testFloat": {"$eq": 1.4}
        }]
      }, {
        "testString": {"$eq": "mrmagoo"},
      }]
    }
  });
  expect(searchResult.ok).toBe(true);
  const searchData = await searchResult.json();
  console.log({searchData})
  expect(searchData).toBeDefined();
  expect(searchData.length).toBeGreaterThan(0);
}

async function performGetChunksWithMetaNoResults(contextName) {
  // this function should return an empty list
  const searchResult = await ocClient.contextGet({
    contextName: contextName,
    limit: 20,
    includeEmbedding: false,
    metadataFilters: {
      $and: [{
        "testString": {"$eq": "notWhatWeWant"},
      }, {
        "testArray": {"$contains": "notWhatWeWant"},
      }, {
        "testInt": {"$eq": 456},
      }, {
        "testBool": {"$eq": false},
      }, {
        "testFloat": {"$eq": 4.1}
      }]
    }
  });
  expect(searchResult.ok).toBe(true);
  const searchData = await searchResult.json();
  console.log({searchData})
  expect(searchData).toBeDefined();
  expect(searchData.length).toBe(0);
}

async function performGetChunksNoMeta(contextName) {
  const searchResult = await ocClient.contextGet({
    contextName: contextName,
    limit: 20,
    includeEmbedding: false,
  });
  expect(searchResult.ok).toBe(true);
  const searchData = await searchResult.json();
  console.log({searchData})
  expect(searchData).toBeDefined();
  expect(searchData.length).toBeGreaterThan(0);
}
