import ocClient from '../construct.js';

try {
  const result = await ocClient.contextSearch(
    {
      "query": "this is a test of the system. sending important updates and doing important testing things.",
      "contextName": "ross",
      // "metadataFilters": {$and : [{age: {$eq: 99}}, {name: {$contains: "ross"}}]},
      "topK": 5,
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