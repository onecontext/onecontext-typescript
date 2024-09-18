import ocClient from '../../../construct.js';

try {
  const res = await ocClient.uploadDirectory({
    directory: "/Users/rossmurphy/embedding_example/embedpdf/",
    contextName: "example",
    maxChunkSize: 400
  })
  if (res.ok) {
    res.json().then((data: any) => console.log('Directory uploaded:', data));
  } else {
    console.error('Error uploading directory.');
    console.log(res)
  }
} catch (error) {
  console.error('Error fetching context list:', error);
}
