import * as fs from "fs";
import {Readable} from "stream";
import {z} from "zod";


/**
 * Schema for OpenAI API parameters.
 */
export const OpenAISchema = z.object({
  model: z.string().default("gpt-3.5-turbo").optional(),
});

/**
 * Schema for setting the OpenAI API key.
 */
export const SetOpenAIKeySchema = z.object({
  openAIApiKey: z.string().refine((val: any) => val.trim() !== '', {message: "OpenAI API key cannot be empty"}),
});

/**
 * Schema for deleting files from a context.
 */
export const DeleteFileSchema = z.object({
  fileId: z.string().refine((val: any) => val.length > 0, {message: "File id cannot be empty"}),
});

/**
 * Schema for listing files in a context.
 */
export const ListFilesSchema = z.object({
  contextName: z.string(),
  skip: z.number().default(0).optional(),
  limit: z.number().default(10).optional(),
  sort: z.string().default("date_created").optional(),
  metadataFilters: z.object({}).default({}).optional(),
});

/**
 * Schema for a file that's a readable stream
 */
export const ContentFileSchema = z.object({
  name: z.string().optional().transform((val, ctx) => {
    if (val && !val.endsWith(".txt")) {
      ctx.addIssue({code: z.ZodIssueCode.custom, message: "'name' must end with .txt"});
    }
    return val;
  }),
  content: z.string().nullable(),
  readable: z.instanceof(Readable).optional(),
}).transform(data => {
  if (!data.readable && data.content) {
    const readable = new Readable();
    readable.push(data.content);
    readable.push(null);
    return {...data, readable};
  }
  return data;
});

/**
 * Schema for a file that's a path (gets converted to a readable stream)
 */
export const PathFileSchema = z.object({
  path: z.string().refine((val) => val.trim() !== '', {message: "Path cannot be empty"}),
  readable: z.instanceof(Readable).optional(),
}).transform((data, ctx) => {
  if (typeof data.path === 'string' && data.path.trim() !== '' && !data.readable) {
    try {
      const readable = fs.createReadStream(data.path);
      return {...data, readable};
    } catch (error) {
      ctx.addIssue({code: z.ZodIssueCode.custom, message: "Error creating Readable stream"});
    }
  }
  return data;
});

/**
 * Schema for creating a context
 */
export const ContextCreateSchema = z.object({
  contextName: z.string().refine((val) => val.trim() !== '', {message: "Name for your context cannot be empty"}),
});

/**
 * Schema for deleting a context
 */
export const ContextDeleteSchema = z.object({
  contextName: z.string().refine((val) => val.trim() !== '', {message: "Name of the context to delete cannot be empty"}),
});

/**
 * Schema for listing the contexts you have
 */
export const ListContext = z.object({});

/**
 * Schema for filtering a context, and defining the parameters for said filter
 */
export const ContextGet = z.object({
  contextName: z.string(),
  metadataFilters: z.object({}).default({}).optional(),
  limit: z.union([z.number().refine((val) => val > 0, {message: "Limit must be greater than 0"}), z.null()]),
  includeEmbedding: z.boolean().default(false).optional()
})

/**
 * Schema for searching through a context, and defining the parameters for said search
 */
export const ContextSearch = z.object({
  query: z.string().refine((val) => val.trim() !== '', {message: "The query cannot be empty. If you want to just retrieve chunks without a query, try the ContextGet method!"}),
  contextName: z.string(),
  // TODO - add stricter type for this (it's on the backend, move it over here')
  metadataFilters: z.object({}).default({}).optional(),
  topK: z.union([z.number().refine((val) => val > 0, {message: "Top k must be greater than 0"}), z.null()]),
  semanticWeight: z.number().refine((val) => val >= 0 && val <= 1, {message: "Semantic weight must be between 0 and 1"}).default(0.5).optional(),
  fullTextWeight: z.number().refine((val) => val >= 0 && val <= 1, {message: "Full text weight must be between 0 and 1"}).default(0.5).optional(),
  rrfK: z.number().refine((val) => val > 0, {message: "rrfK must be greater than 0"}).default(60).optional(),
  includeEmbedding: z.boolean().default(false).optional()
})

/**
 * Schema for a Union type of both file types
 */
export const FileSchema: z.ZodType = z.union([ContentFileSchema, PathFileSchema]);

/**
 * Schema for uploading files to a context
 */
export const UploadFilesSchema = z.object({
  files: z.array(FileSchema),
  stream: z.boolean().default(false).optional(),
  contextName: z.string().refine((val) => val.trim() !== '', {message: "Context name cannot be empty"}),
  metadataJson: z.object({}).optional(),
  maxChunkSize: z.number().refine((val) => val > 0, {message: "Max chunk size must be greater than 0"}).default(600).optional()
});

/**
 * Schema for requesting a download url 
 */
export const DownloadUrlRequestSchema = z.object({
  fileId: z.string(),
});

/**
 * Schema for uploading an entire directory of files to a context
 */
export const UploadDirectorySchema = z.object({
  directory: z.string().refine((val) => val.endsWith("/"), {message: "Directory must end with /"}),
  contextName: z.string().refine((val) => val.trim() !== '', {message: "Knowledge Base name cannot be empty"}),
  metadataJson: z.object({}).optional(),
  maxChunkSize: z.number().refine((val) => val > 0, {message: "Max chunk size must be greater than 0"}).default(600).optional()
});


export type ContentFile = z.infer<typeof ContentFileSchema>;
export type PathFile = z.infer<typeof PathFileSchema>;
export type ContextCreateType = z.infer<typeof ContextCreateSchema>
export type ContextDeleteType = z.infer<typeof ContextDeleteSchema>
export type ContextGetType = z.infer<typeof ContextGet>
export type ContextSearchType = z.infer<typeof ContextSearch>
export type ListFilesType = z.infer<typeof ListFilesSchema>
export type DeleteFileType = z.infer<typeof DeleteFileSchema>
export type UploadFilesType = z.infer<typeof UploadFilesSchema>
export type UploadDirectoryType = z.infer<typeof UploadDirectorySchema>
export type SetOpenAIApiKeyType = z.infer<typeof SetOpenAIKeySchema>
export type DownloadUrlType = z.infer<typeof DownloadUrlRequestSchema>
