import ocClient from '../../construct.js';

try {
  const result = await ocClient.createContext({contextName: "testingtesting"})
  if (result.ok) {
    await result.json().then((data) => console.log('Context created:', data));
  } else {
    console.error('Error creating context.');
  }
} catch (error) {
  console.error('Error creating context.', error);
}