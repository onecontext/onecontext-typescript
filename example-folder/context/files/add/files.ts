import ocClient from '../../../../construct.js';

try {
  ocClient.uploadFiles({
    files: [{path: "/Users/rossmurphy/embedding_example/embedpdf/attention_is_all_you_need.pdf"}],
    contextName: "notwework",
    stream: false,
    maxChunkSize: 400
  }).then((res: any) => {
    if (res.ok) {
      res.json().then((data: any) => console.log('File uploaded:', data));
    } else {
      console.error('Error uploading files.');
      console.log(res)
      console.error(res.error)
    }
  })

} catch (error) {
  console.error('Error fetching context list:', error);
}