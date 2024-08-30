import ocClient from '../../construct.js';

try {
  const result = await ocClient.contextList()
  if (result.ok) {
    await result.json().then((data) => console.log('Context list:', data));
  } else {
    console.error('Error fetching context list');
  }
} catch (error) {
  console.error('Error fetching context list:', error);
}