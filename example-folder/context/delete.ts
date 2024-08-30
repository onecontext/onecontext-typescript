import ocClient from '../../construct.js';

try {
  const result = await ocClient.deleteContext({contextName: 'testingtesting'})
  if (result.ok) {
    await result.json().then((data) => console.log('Deleted context:', data));
  } else {
    console.error('Error deleting context.');
  }
} catch (error) {
  console.error('Error deleting context:', error);
}