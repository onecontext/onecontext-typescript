import ocClient from "../../../construct.js";

try {
  const res = await ocClient.uploadFiles({
    files: [{ path: "/Users/serge/Downloads/Youssef_Bonnaire_CV.pdf" }],
    contextName: "cs_papers",
    stream: false,
    maxChunkSize: 400,
  });

  if (res.ok) {
    await res
      .json()
      .then((data: any) => console.log("File(s) successfully uploaded:", data));
  } else {
    await res
      .json()
      .then((data: any) => console.log("error", JSON.stringify(data, null, 2)));
  }
} catch (error) {
  console.error("Error uploading files", error);
}

