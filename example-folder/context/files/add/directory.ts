import ocClient from '../../../../construct.js';

try {
  ocClient.uploadDirectory({
    directory: "/Users/rossmurphy/embedding_example/embedpdf/",
    contextName: "notwework",
  }).then((res: any) => {
    if (res.ok) {
      res.json().then((data: any) => console.log('Directory uploaded:', data));
    } else {
      console.error('Error uploading directory.');
      console.log(res)
      console.error(res.error)
    }
  })
} catch (error) {
  console.error('Error fetching context list:', error);
}