# Official OneContext TypeScript SDK

This is the official Node.js SDK for the OneContext platform. Use this SDK to connect your Node backend applications,
and Node CLI tools, to OneContext's platform.

## What is OneContext?

OneContext is a platform that enables software engineers to compose and deploy custom RAG pipelines on SOTA
infrastructure, without all the faff.

You just create a context, and add files to it. You can then query your context using vector search, hybrid search, the
works, and OneContext takes care of all the infra behind the scenes (SSL certs, DNS, Kubernetes cluster, embedding
models, GPUs, autoscaling, load balancing, etc).

## Three things to know

The three primitives OneContext exposes are `Context`, `File`, and `Chunk`. In a nutshell, you add a `File` to a
`Context`, and OneContext creates `Chunks` (little parts of the file, with embeddings attached) for you. 

## Sounds great. How do I get started?

### Get the SDK from npm

```bash
npm install @onecontext/node-sdk
```

### Quickstart

#### API Key

Access to the OneContext platform is via an API key. If you already have one, great, pop it in an .env file in the root
of your project, or export it from the command line as an environment variable.

If you've misplaced your API key, you can rotate your existing one [here](https://app.onecontext.ai/settings).

#### Pop your API key in an .env file in the root of the repo (i.e. in the same directory as the package.json)

```zsh
touch .env
```

Add your API key to this .env file like so:

```dotenv
ONECONTEXT_API_KEY=your_api_key_here
```

#### Play around

For some ready made examples you can just run straight up, clone the [GitHub repo](https://github.com/onecontext/onecontext-typescript), and then open `src/example-folder`.

Or, you can follow the below walk-through step by step.

#### Initialise the OneContext client

```zsh
touch construct.ts
```

Add the below into that file

```ts
import {OneContextClient} from "@onecontext/node-sdk"
import * as dotenv from 'dotenv';
import {fileURLToPath} from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '.env');
dotenv.config({path: envPath});

const API_KEY = process.env.ONECONTEXT_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Check if required environment variables are set
if (!API_KEY) {
  console.error('Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

const ocClient = new OneContextClient({apiKey: ONECONTEXT_API_KEY, openAiKey: OPENAI_API_KEY, baseUrl: BASE_URL});

export default ocClient;
```

Compile that so you can import it easily for the next examples

```zsh
tsc
```

#### Create a Context

A `Context` is where you store your data. You can think of a `Context` as a "File Store", a "Knowledge Base", a "Second
Brain", etc..

```ts
import ocClient from './construct.js';

try {
  const result = await ocClient.createContext({contextName: "contextExample"})
  if (result.ok) {
    await result.json().then((data) => console.log('Context created:', data));
  } else {
    console.error('Error creating context.');
  }
} catch (error) {
  console.error('Error creating context.', error);
}
```

#### Throw a load of files at it

Now you can enrich your context with knowledge. You can make your context an expert in anything, just add files.

If you're on the free plan, you can have just one context, with up to 10 files (of less than 50 pages each). If you're
on the pro plan, you can have up to 5,000 contexts, each with up to 5,000 files.

##### You can add individual files

Just add file paths to the array. It's always better to upload multiple files in this way, rather than making multiple
requests with just one filepath in the array. We can process the jobs much faster (in a batch), and you're far less
likely to hit our rate limits.

You can (optionally) supply a metadataJson argument, to tag your files with metadata. This metadata will also get
applied to every chunk created from your files. This will make it easy to filter chunks and files later on at query
time. For more see [here](#onecontext-structured-query-language).

```ts
import ocClient from './construct.js';

try {
  ocClient.uploadFiles({
    files: [
      {path: "/Users/demoUser/exampleDirectory/attention_is_all_you_need.pdf"},
      {path: "/Users/demoUser/exampleDirectory/AN-other-file.pdf"},
    ],
    contextName: "contextExample",
    metadataJson: {"file_tag" : "reading_group_papers", "date_added": Date.now()},
    stream: false,
    maxChunkSize: 400
  }).then((res: any) => {
    if (res.ok) {
      res.json().then((data: any) => console.log('File uploaded:', data));
    } else {
      console.error('Error uploading files.');
    }
  })

} catch (error) {
  console.error('Error uploading files:', error);
}
```

##### You can also add full directories of files

Again, you can also (optionally) supply a metadataJson argument, to tag your files with metadata. This metadata will also get
applied to every chunk created from your files. This will make it easy to filter chunks and files later on at query
time. For more see [here](#onecontext-structured-query-language).

```ts
import ocClient from './construct.js';

try {
  ocClient.uploadDirectory({
    directory: "/Users/exampleUser/exampleDirectory/",
    contextName: "contextExample",
    metadataJson: {"file_tag" : "invoice", "date_added": Date.now()},
    maxChunkSize: 400
  }).then((res: any) => {
    if (res.ok) {
      res.json().then((data: any) => console.log('Directory uploaded:', data));
    } else {
      console.error('Error uploading directory.');
    }
  })
} catch (error) {
  console.error('Error uploading directory:', error);
}
```

#### List the files in a particular context

```ts
import ocClient from './construct.js';

try {
  const result = await ocClient.listFiles({contextName: "contextName"})
  if (result.ok) {
    await result.json().then((data) => console.log(`Files for context:`, data));
  } else {
    console.error('Error fetching files list');
  }
} catch (error) {
  console.error('Error fetching files list:', error);
}
```

#### List the contexts you have

```ts
import ocClient from './construct.js';

try {
  const result = await ocClient.contextList()
  if (result.ok) {
    await result.json().then((data) => console.log('Context list:', data));
  } else {
    console.error('Error fetching context list');
  }
} catch (error) {
  console.error('Error fetching context list:', error);
}
```

#### Delete any contexts you no longer wish to have

```ts
import ocClient from './construct.js';

try {
  const result = await ocClient.deleteContext({contextName: 'contextExample'})
  if (result.ok) {
    await result.json().then((data) => console.log('Deleted context:', data));
  } else {
    console.error('Error deleting context.');
  }
} catch (error) {
  console.error('Error deleting context:', error);
}
```

#### Search through your context

Use this method to quickly search through your entire context (which can be thousands of files / hundreds of thousands
of pages).

More details on the arguments for this method:

- query: the query that will be embedded and used for the similarity search.
- contextName: the context you wish to execute the search over.
- topK: the number of "chunks" of context that will be retrieved.
- semanticWeight: how much to weight the relevance of the "semantic" similarity of the word. e.g. "Why, sometimes I've
  believed as many as six impossible things before breakfast." would be similar to "The man would routinely assume the
  veracity of ludicrous ideas in the morning", even though the words don't really have a lot in common.
- fullTextWeight: how much to weight the relevance of the similarity of the actual words in the context. e.g. "The King
  is at the palace, with the Queen", would be quite similar to "Knight takes Queen on e4", even though semantically
  these sentences have quite different meanings.
- rrfK: a smoothing parameter which determines how we combine the scores for semantic, and fullText weights. For more
  see [here](https://learn.microsoft.com/en-us/azure/search/hybrid-search-ranking)
- metadataFilters: an optional set of SQL-like conditions you can pass to filter your hybrid search space. For more
  see [here](#onecontext-structured-query-language)
- includeEmbedding: a Boolean value to be set to True or False depending on whether you want to do something with the
  embeddings for each chunk. If you want to do clustering or visualise the results in multidimensional space, choose
  True. If you just want fast context for your language model prompts, choose False.

```ts
import ocClient from '../../construct.js';

try {
  const result = await ocClient.contextSearch(
    {
      "query": "An example query you can use to search through all the data in your context",
      "contextName": "contextExample",
      "topK": 25,
      "semanticWeight": 0.5,
      "fullTextWeight": 0.5,
      "metadataFilters": {$and: [{age: {$eq: 50}}, {name: {$contains: "John Johnson"}}]},
      "rrfK": 60,
      "includeEmbedding": false
    }
  )
  if (result.ok) {
    await result.json().then((data) => console.log('Search results:', data));
  } else {
    console.error('Error searching context.');
  }
} catch (error) {
  console.error('Error searching context.', error);
}
```

#### Return chunks corresponding to filters

Use this method to return chunks from your context (which can be thousands of files / hundreds of thousands
of pages) where the metadata filters align.

More details on the arguments for this method:

- contextName: the context you wish to execute the search over.
- limit: the number of "chunks" of context that will be retrieved.
- metadataFilters: an optional set of SQL-like conditions you can pass to filter your hybrid search space. For more
  see [here](#onecontext-structured-query-language)
- includeEmbedding: a Boolean value to be set to True or False depending on whether you want to do something with the
  embeddings for each chunk. If you want to do clustering or visualise the results in multidimensional space, choose
  True. If you just want fast context for your language model prompts, choose False.

```ts

import ocClient from '../construct.js';

try {
  const result = await ocClient.contextGet(
    {
      "contextName": "ross",
      "metadataFilters": {"$and": [
          {"file_tag": {"$eq": "invoice"}}, 
          {"date_added": {"$lt": 1726740351}}, 
          {"date_added": {"$gt": 1710842749}}
        ]},
      "limit": 10,
      "includeEmbedding": true
    }
  )
  if (result.ok) {
    await result.json().then((data: any) => console.log('Search results:', data));
  } else {
    console.error('Error searching context.');
  }
} catch (error) {
  console.error('Error searching context.', error);
}
```

### OneContext Structured Query Language

OneContext allows you to use a custom "Structured Query Language" to filter
the chunks in your context.

The syntax is based around the application of `operators`. There are _two_
levels of operators. You can interpret the two levels as "aggregators" and
"comparators".

#### Aggregators

The aggregator operators you can use are:

| Key    | Value Description                                                      |
|--------|------------------------------------------------------------------------|
| `$and` | Returns True i.f.f. _all_ of the conditions in this block return True. |
| `$or`  | Returns True if _any_ of the conditions in this block return True.     |

#### Comparators

The comparator operators you can use are:

| Key         | Value Description                                                                  | Value Type                | 
|-------------|------------------------------------------------------------------------------------|---------------------------|
| `$eq`       | Returns True if the value returned from the DB is equal to the supplied value.     | `string,int,float`        | 
| `$gt`       | Returns True if the value returned from the DB is greater than the supplied value. | `int,float`               |
| `$lt`       | Returns True if the value returned from the DB is less than the supplied value.    | `int,float`               |
| `$in`       | Returns True if the value returned from the DB is contained by the supplied array. | `array<string,int,float>` |
| `$contains` | Returns True if the array value returned from the DB contains the supplied value.  | `string,int,float`        |

