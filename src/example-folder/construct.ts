import {OneContextClient} from "./../index.js"
import * as dotenv from 'dotenv';
import {fileURLToPath} from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '..', '.env');
dotenv.config({path: envPath});

const API_KEY = process.env.ONECONTEXT_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = process.env.BASE_URL;

// Check if required environment variables are set
if (!API_KEY || !OPENAI_API_KEY) {
  console.error('Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

const ocClient = new OneContextClient({apiKey: API_KEY, openAiKey: OPENAI_API_KEY, baseUrl: BASE_URL!});

export default ocClient;
