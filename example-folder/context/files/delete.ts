import ocClient from '../../../construct.js';

try {
  const result = await ocClient.deleteContext(
    {contextName: "contextName"}
  )
  if (result.ok) {
    await result.json().then((data) => console.log('Context deleted:', data));
  } else {
    console.error('Error deleting context');
  }
} catch (error) {
  console.error('Error deleting context :', error);
}