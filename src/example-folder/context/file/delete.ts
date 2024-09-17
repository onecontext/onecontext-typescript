import ocClient from '../../construct.js';

try {
  const result = await ocClient.deleteFile(
    {
      fileId: "exampleFileId"
    }
  )
  if (result.ok) {
    await result.json().then((data: any) => console.log('Deleting file:', data));
  } else {
    console.error('Error deleting file');
  }
} catch (error) {
  console.error('Error deleting file:', error);
}