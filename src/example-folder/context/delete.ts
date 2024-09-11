import ocClient from "../construct.js";

try {
  const result = await ocClient.deleteContext({ contextName: "cs_papers" });
  if (result.ok) {
    await result
      .json()
      .then((data: any) => console.log("Deleted context:", data));
  } else {
    await result.json().then((data: any) => console.log("error", data));
  }
} catch (error) {
  console.error("Error deleting context:", error);
}

