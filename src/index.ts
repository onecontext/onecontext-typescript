import fetch, {RequestInit, Response} from 'node-fetch';
import FormData from 'form-data';
import {promises as fs} from 'fs';
import { createReadStream } from 'fs';
import * as path from "path";
import * as inputTypes from "./types/inputs.js";
import {Readable} from "stream";

export * from './utils.js';

export class OneContextClient {
  private apiKey: string;
  private baseUrl: string;
  private openAiKey?: string;

  /**
   * Creates an instance of OneContextClient.
   * @private
   * @param apiKey - The API key for authentication.
   * @param openAiKey - Optional OpenAI API key.
   * @param baseUrl - The base URL for the OneContext API.
   */
  constructor(apiKey: string, openAiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.openAiKey = openAiKey;
    this.baseUrl = baseUrl || "https://app.onecontext.ai/api/v2/";
  }

  /**
   * Makes a request to the OneContext API.
   * @private
   * @param endpoint - The API endpoint to request.
   * @param options - Additional options for the request.
   * @returns The response from the API.
   */
  private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = new URL(endpoint, this.baseUrl).toString();
    // Create a new headers object
    const headers = new Headers({...options.headers});

    // Add the API key
    headers.set("API-KEY", this.apiKey);

    // Add the OpenAI API key if it exists
    if (this.openAiKey) {

      // Note, you do not have to pass in the headers each time if you do not want to!
      // Alternatively, you can store your key with us (in an encrypted format) on our backend.
      // Simply visit https://app.onecontext.ai/settings/account and add your key there.

      // This will add a little overhead to each of your requests (as we need to fetch, and decrypt the key on each
      // request, but, can be preferable in certain scenarios). 
      headers.set("OPENAI-API-KEY", this.openAiKey);
    }

    // Create the final options object
    const finalOptions: RequestInit = {
      ...options,
      headers,
    };


    return await fetch(url, finalOptions);
  }

  /**
   * Checks if the file is a ContentFile.
   * @private
   * @param file - The file to check.
   * @returns True if the file is a ContentFile, false otherwise.
   */
  private isContentFile(file: any): file is inputTypes.ContentFile {
    return 'readable' in file && 'name' in file;
  }

  /**
   * Checks if the file is a PathFile.
   * @private
   * @param file - The file to check.
   * @returns True if the file is a PathFile, false otherwise.
   */
  private isPathFile(file: any): file is inputTypes.PathFile {
    return 'readable' in file && 'path' in file;
  }

  /**
   * Creates a new context.
   * @param args - The arguments for creating a context.
   * @returns The response from the API.
   * @example
   * try {
   *   const ocClient = new OneContextClient(BASE_URL, API_KEY);
   *   const result = await ocClient.createContext({contextName: "contextName"})
   *   if (result.ok) {
   *     await result.json().then((data) => console.log('Context created:', data));
   *   } else {
   *     console.error('Error creating context.');
   *   }
   * } catch (error) {
   *   console.error('Error creating context.', error);
   * }
   */
  async createContext(args: inputTypes.ContextCreateType): Promise<Response> {
    return this.request('context/create', {
      method: 'POST',
      body: JSON.stringify(args),
    });
  }

  /**
   * Deletes a context.
   * @param args - The arguments for deleting a context.
   * @returns The response from the API.
   * @example
   * try {
   *   const ocClient = new OneContextClient(BASE_URL, API_KEY);
   *   const result = await ocClient.deleteContext(
   *     {
   *       contextName: "contextName"
   *     }
   *   )
   *   if (result.ok) {
   *     await result.json().then((data) => console.log('Context deleted:', data));
   *   } else {
   *     console.error('Error deleting context');
   *   }
   * } catch (error) {
   *   console.error('Error deleting context :', error);
   * }
   *
   */
  async deleteContext(args: inputTypes.ContextDeleteType): Promise<Response> {
    return this.request(`context/delete/${args.contextName}`, {
      method: 'DELETE',
    });
  }

  /**
   * Lists all contexts.
   * @returns The response from the API containing the list of contexts.
   * @example
   * try {
   *   const ocClient = new OneContextClient(BASE_URL, API_KEY);
   *   const result = await ocClient.listFiles({contextName: "contextName"})
   *   if (result.ok) {
   *     await result.json().then((data) => console.log(`Contexts for you user:`, data));
   *   } else {
   *     console.error('Error fetching list of contexts');
   *   }
   * } catch (error) {
   *   console.error('Error fetching list of contexts', error);
   * }
   *
   */
  async contextList(): Promise<Response> {
    return this.request('context', {
      method: 'GET',
    });
  }

  /**
   * Searches within a context.
   * @param args - The arguments for searching a context.
   * @returns The response from the API containing the search results.
   * @example
   * try {
   *   const ocClient = new OneContextClient(BASE_URL, API_KEY);
   *   const result = await ocClient.contextSearch(
   *     {
   *       "query": "An example query you can use to search through all the data in your context",
   *       "contextName": "contextName",
   *       "topK": 20,
   *       "semanticWeight": 0.5,
   *       "fullTextWeight": 0.5,
   *       "rrfK": 55,
   *       "includeEmbedding": false
   *     }
   *   )
   *   if (result.ok) {
   *     await result.json().then((data) => console.log('Search results:', data));
   *   } else {
   *     console.error('Error searching context.');
   *   }
   * } catch (error) {
   *   console.error('Error searching context.', error);
   * }
   */
  async contextSearch(args: inputTypes.ContextSearchType): Promise<Response> {
    return this.request('context/get/search', {
      method: 'POST',
      body: JSON.stringify(args),
      headers: {
        "Content-Type": "application/json"
      },
    });
  }
  
  /**
   * Filters within a context.
   * @param args - The arguments for filtering chunks in a context.
   * @returns The response from the API containing the filter results.
   * @example
   * try {
   *   const ocClient = new OneContextClient(BASE_URL, API_KEY);
   *   const result = await ocClient.contextFilter(
   *     {
   *       "contextName": "contextName",
   *       "topK": 20,
   *       "metadataJson": {},
   *       "includeEmbedding": false
   *     }
   *   )
   *   if (result.ok) {
   *     await result.json().then((data) => console.log('Filter results:', data));
   *   } else {
   *     console.error('Error searching context.');
   *   }
   * } catch (error) {
   *   console.error('Error searching context.', error);
   * }
   */
  async contextGet(args: inputTypes.ContextGetType): Promise<Response> {
    return this.request('context/get', {
      method: 'POST',
      body: JSON.stringify(args),
      headers: {
        "Content-Type": "application/json"
      },
    });
  }

  /**
   * Deletes files from a context.
   * @param args - The arguments for deleting a file.
   * @returns The response from the API.
   */
  async deleteFile(args: inputTypes.DeleteFileType): Promise<Response> {
    const renamedArgs = {
      fileId: args.fileId,
      contextName: args.contextName,
    };
    return this.request('context/file', {
      method: 'DELETE',
      body: JSON.stringify(renamedArgs),
    });
  }

  /**
   * Lists files in a context.
   * @param args - The arguments for listing files.
   * @returns The response from the API containing the list of files.
   */
  async listFiles(args: inputTypes.ListFilesType): Promise<Response> {
    return this.request('context/file', {
      method: 'POST',
      body: JSON.stringify(args),
    });
  }
  
  private async * fileGenerator(directory: string) {
    async function* walkDirectory(dir: string): AsyncGenerator<{ path: string, name: string }> {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          yield* walkDirectory(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if ([".txt", ".pdf", ".docx", ".doc"].includes(ext)) {
            yield { path: fullPath, name: path.relative(directory, fullPath) };
          }
        }
      }
    }

    for await (const file of walkDirectory(directory)) {
      const stream = createReadStream(file.path);
      yield { stream, name: file.name };
    }
  }


  /**
   * Uploads a directory of files to a context.
   * @param args - The arguments for uploading a directory.
   * @returns The response from the API.
   * @example
   * @example
   * try {
   *  const ocClient = new OneContextClient(BASE_URL, API_KEY);
   *  ocClient.uploadDirectory({
   *    directory: "/Path/to/User/Directory",
   *    contextName: "contextName",
   *    maxChunkSize: 400
   *  }).then((res) => {
   *    if (res.ok) {
   *      res.json().then((data) => console.log('Directory uploaded:', data));
   *    } else {
   *      console.error('Error uploading directory.');
   *    }
   *  })
   *} catch (error) {
   *  console.error('Error uploading directory:', error);
   *}
   */
  async uploadDirectory(args: inputTypes.UploadDirectoryType): Promise<Response> {
    const formData = new FormData();

    for await (const { stream, name } of this.fileGenerator(args.directory)) {
      formData.append('files', stream, name);
    }

    formData.append('context_name', args.contextName);
    formData.append('max_chunk_size', args.maxChunkSize);

    if (args.metadataJson) {
      formData.append('metadata_json', JSON.stringify(args.metadataJson));
    }

    return this.request('jobs/files/add', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });
  }

  /**
   * Uploads files to a context.
   * @param args - The arguments for uploading files.
   * @returns The response from the API.
   * @example
   * try {
   *   const ocClient = new OneContextClient(BASE_URL, API_KEY);
   *   ocClient.uploadFiles({
   *     files: [{path: "path/to/file1.pdf"}, {path: "path/to/file2.pdf"}],
   *     contextName: "contextName",
   *     stream: false,
   *     maxChunkSize: 400
   *   }).then((res: any) => {
   *     if (res.ok) {
   *       res.json().then((data: any) => console.log('File uploaded:', data));
   *     } else {
   *       console.error('Error uploading files.');
   *     }
   *   })
   *
   * } catch (error) {
   *   console.error('Error uploading files:', error);
   * }
   */
  async uploadFiles(args: inputTypes.UploadFilesType): Promise<Response> {
    const formData = new FormData();

    for (const file of args.files) {
      if (args.stream) {
        if (!file || !('readable' in file) || !(file.readable instanceof Readable)) {
          console.error('Invalid file object for stream mode:', file);
          throw new Error('Invalid file object for stream mode');
        }
        const f = file as inputTypes.ContentFile;
        formData.append('files', f.readable, {
          filename: f.name || 'unnamed_file',
          contentType: 'text/plain',
        });
      } else {
        if (!file || !('path' in file) || typeof file.path !== 'string') {
          console.error('Invalid file object for non-stream mode:', file);
          throw new Error('Invalid file object for non-stream mode');
        }
        const f = file as inputTypes.PathFile;
        try {
          // Check if the file exists
          await fs.access(f.path);
          const filename = path.basename(f.path);
          const fileStream = await fs.readFile(f.path);
          formData.append('files', fileStream, filename);
        } catch (error) {
          console.error(`File does not exist or is not accessible: ${f.path}`);
          throw new Error(`File does not exist or is not accessible: ${f.path}`);
        }
      }
    }

    formData.append('context_name', args.contextName);
    formData.append('maxChunkSize', args.maxChunkSize);

    if (args.metadataJson) {
      formData.append('metadata_json', JSON.stringify(args.metadataJson));
    }

    return this.request('jobs/files/add', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });
  }

  /**
   * Sets an encrypted version of your OpenAI Key on your User Account on our servers.
   * Note, you do not have to do this if you do not want to, or, if you do not want to use OpenAI at all.
   *
   * In fact, if you do use OpenAI, you will get faster responses from our servers if you instantiate
   * your OneContext client with the OpenAI key instead of setting it with us. This way, you'll pass it to us
   * (in encrypted form) in the headers of each request you make. Reach out if this is unclear.
   *
   * @param args - The arguments for setting the OpenAI Key
   * @returns The response from the API.
   * @example
   * try {
   *   const ocClient = new OneContextClient(BASE_URL, API_KEY);
   *   ocClient.setOpenAIApiKey({
   *     openAIApiKey: "your-openai-key"
   *   }).then((res: any) => {
   *     if (res.ok) {
   *       res.json().then((data) => console.log('OpenAI Key Correctly Set:', data));
   *     } else {
   *       console.error('Error setting key.');
   *     }
   *   })
   *
   * } catch (error) {
   *   console.error('Error setting key:', error);
   * }
   */
  async setOpenAIApiKey(args: inputTypes.SetOpenAIApiKeyType): Promise<Response> {
    return this.request('user/updateUserMeta', {
      method: 'POST',
      body: JSON.stringify(args),
    });
  }

}