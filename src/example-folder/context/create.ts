import ocClient from "../construct.js";

try {
  const result = await ocClient.createContext({ contextName: "example" });
  if (result.ok) {
    await result
      .json()
      .then((data: any) => console.log("Context created:", data));
  } else {
    console.error("Error creating context.");
    await result.json().then((data: any) => console.log("error", data));
  }
} catch (error) {
  console.error("Error creating context.", error);
}

