import ocClient from '../construct.js';

try {
  const result = await ocClient.contextSearch(
    {
      "query": "is handled in a safe and secure manner. and has taken several steps to ensure a customer ",
      "contextName": "ross",
      "metadataFilters": {$and : [{age: {$eq: 30}}, {name: {$contains: "ross"}}]},
      "topK": 5,
      "semanticWeight": 0.5,
      "fullTextWeight": 0.5,
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