import ocClient from '../../../construct.js';

try {
  const res = await ocClient.uploadFiles({
    files: [{path: "/Users/rossmurphy/embedding_example/embedpdf/attention_is_all_you_need.pdf"}],
    contextName: "ross",
    metadataJson: {name: "ross"},
    stream: false,
    maxChunkSize: 400
  });

  if (res.ok) {
    await res.json().then((data: any) => console.log('File(s) successfully uploaded:', data));
  } else {
    console.error('Error uploading files.');
  }
} catch (error) {
  console.error('Error fetching context list:', error);
}