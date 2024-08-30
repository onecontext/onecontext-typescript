import ocClient from '../../construct.js';

try {
  const result = await ocClient.contextSearch(
    {
      "query": "An example query you can use to search through all the data in your context",
      "contextName": "notwework",
      "topK": 2,
      "semanticWeight": 0.5,
      "fullTextWeight": 0.5,
      "rrfK": 10,
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