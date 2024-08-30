import {OneContextClient} from "@onecontext/ts-sdk-v2"
import * as dotenv from 'dotenv';
import {fileURLToPath} from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '.env');
dotenv.config({path: envPath});

const API_KEY = process.env.API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Check if required environment variables are set
if (!API_KEY || !OPENAI_API_KEY) {
  console.error('Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

const ocClient = new OneContextClient(API_KEY, OPENAI_API_KEY);

export default ocClient;
