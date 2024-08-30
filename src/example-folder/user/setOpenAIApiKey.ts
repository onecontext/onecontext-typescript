import ocClient from '../construct.js';

try {
  ocClient.setOpenAIApiKey({
    openAIApiKey: "your-openai-api-key"
  }).then((res: any) => {
    if (res.ok) {
      res.json().then((data: any) => console.log('OpenAI Key Correctly Set:', data));
    } else {
      console.error('Error setting key.');
    }
  })

} catch (error) {
  console.error('Error setting key:', error);
}