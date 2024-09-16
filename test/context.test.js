import {OneContextClient} from "./../dist/index.js"
import {describe, expect, test, beforeAll, afterAll} from '@jest/globals';
import * as dotenv from 'dotenv';
import {fileURLToPath} from 'url';
import path from 'path';
import fs from 'fs/promises';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({path: envPath});

const API_KEY = process.env.API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = process.env.BASE_URL;

// Check if required environment variables are set
if (!API_KEY || !OPENAI_API_KEY) {
  console.error('Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

const ocClient = new OneContextClient(API_KEY, OPENAI_API_KEY, BASE_URL);


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
          maxChunkSize: 500, // 500B chunk size as per your previous modification
        });

        expect(uploadResult.ok).toBe(true);
        const uploadData = await uploadResult.json();
        expect(uploadData).toBeDefined();

        // Wait for processing
        await waitForProcessing(testContextName1);

        // Perform search
        await performSearch(testContextName1);
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
        maxChunkSize: 500, // 500B chunk size as per your modification
      });
      expect(uploadResult.ok).toBe(true);
      const uploadData = await uploadResult.json();
      expect(uploadData).toBeDefined();


      // Wait for processing
      await waitForProcessing(testContextName2);

      // Perform search
      await performSearch(testContextName2);
    }, 240000); // 4 minute total timeout 
  });
});

async function waitForProcessing(contextName) {
  let allFilesProcessed = false;
  let attempts = 0;
  const maxAttempts = 5; // 5*15 seconds total wait time 

  while (!allFilesProcessed && attempts < maxAttempts) {
    const listResult = await ocClient.listFiles({contextName: contextName});
    expect(listResult.ok).toBe(true);
    const listData = await listResult.json();
    expect(listData).toBeDefined();

    allFilesProcessed = listData.files.every(file => file.status === 'COMPLETED');

    if (!allFilesProcessed) {
      await new Promise(resolve => setTimeout(resolve, 15000)); // Wait for 15 seconds before checking again
      attempts++;
    }
  }

  if (!allFilesProcessed) {
    throw new Error(`File processing timed out for context ${contextName}`);
  }
}

async function performSearch(contextName) {
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds before trying to search
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
  const results = searchData.data;
  expect(results).toBeDefined();
  expect(results.length).toBeGreaterThan(0);
}