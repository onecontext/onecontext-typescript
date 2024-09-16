import ocClient from '../../construct.js';

try {
  const result = await ocClient.listFiles({contextName: "ross"})
  if (result.ok) {
    await result.json().then((data: any) => console.log(`Files for context:`, data));
  } else {
    console.error('Error fetching context list');
  }
} catch (error) {
  console.error('Error fetching context list:', error);
}