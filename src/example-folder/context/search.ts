import ocClient from '../construct.js';

try {
  const result = await ocClient.contextSearch(
    {
      "query": "send important updates",
      "contextName": "ross",
      // "metadataFilters": {$and : [{age: {$eq: 30}}, {name: {$contains: "ross"}}]},
      "topK": 1,
      "semanticWeight": 0.3,
      "fullTextWeight": 0.7,
      "rrfK": 50,
      "includeEmbedding": false
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