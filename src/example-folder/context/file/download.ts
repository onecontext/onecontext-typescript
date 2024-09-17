import ocClient from '../../construct.js';

try {
  const result = await ocClient.getDownloadUrl({fileId: "46f64b74-0bbd-4360-a77a-80a1f918abad"})
  if (result.ok) {
    await result.json().then((data: any) => console.log(`Download URL:`, data));
  } else {
    console.error('Error fetching download url');
  }
} catch (error) {
  console.error('Error fetching context list:', error);
}