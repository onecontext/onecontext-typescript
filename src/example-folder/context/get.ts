import ocClient from '../construct.js';

try {
  const result = await ocClient.contextGet(
    {
      "contextName": "ross",
      "metadataJson": {$and : [{age: {$eq: 30}}, {name: {$contains: "ross"}}]},
      "topK": 5,
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