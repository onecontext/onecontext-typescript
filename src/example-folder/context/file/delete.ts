import ocClient from '../../construct.js';

try {
  const result = await ocClient.deleteFile(
    {
      fileId: "46f64b74-0bbd-4360-a77a-80a1f918abad"
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