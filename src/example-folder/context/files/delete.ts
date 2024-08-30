import ocClient from '../../construct.js';

try {
  const result = await ocClient.deleteContext(
    {contextName: "example"}
  )
  if (result.ok) {
    await result.json().then((data: any) => console.log('Context deleted:', data));
  } else {
    console.error('Error deleting context');
  }
} catch (error) {
  console.error('Error deleting context :', error);
}