import ocClient from '../../../construct.js';
import fs from 'fs';
import path from "path"

let filePathArray: Array<string> = [];

const pathArray = async ({ directoryPath, numFiles }: { directoryPath: string, numFiles: number }): Promise<string[]> => {
  try {
    const files = await fs.promises.readdir(directoryPath);
    return files.slice(0, numFiles).map(file => path.join(directoryPath, file));
  } catch (err) {
    console.error('Unable to scan directory:', err);
    return [];
  }
};

try {
  const directoryPath = "/Users/rossmurphy/GitHub/ctxc/context_eval/data/txt/";
  const filePathArray = await pathArray({ directoryPath, numFiles: 1000 });
  const res = await ocClient.uploadFiles({
    files: filePathArray.map((path: string) => ({ path })),
    contextName: "dummy",
    stream: false,
    maxChunkSize: 200
  });

  if (res.ok) {
    await res.json().then((data: any) => console.log('File(s) successfully uploaded:', data));
  } else {
    console.error('Error uploading files.');
  }
} catch (error) {
  console.error('Error uploading files:', error);
}
