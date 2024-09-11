import ocClient from "../construct.js";

try {
  const result = await ocClient.contextSearch({
    query:
      "An example query you can use to search through all the data in your context",
    contextName: "counsel",
    topK: 2,
    semanticWeight: 0.5,
    fullTextWeight: 0.5,
    rrfK: 50,
    includeEmbedding: false,
  });
  if (result.ok) {
    await result
      .json()
      .then((data: any) => console.log("Search results:", data));
  } else {
    console.error("Error searching context.");
  }
} catch (error) {
  console.error("Error searching context.", error);
}

