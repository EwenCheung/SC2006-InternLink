import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const portFilePath = path.join(__dirname, '..', '..', 'port.json');

export const writePortToFile = (port) => {
  try {
    fs.writeFileSync(portFilePath, JSON.stringify({ backendPort: port }));
  } catch (error) {
    console.error('Error writing port to file:', error);
  }
};

export const readPortFromFile = () => {
  try {
    if (fs.existsSync(portFilePath)) {
      const data = fs.readFileSync(portFilePath);
      return JSON.parse(data).backendPort;
    }
  } catch (error) {
    console.error('Error reading port from file:', error);
  }
  return null;
};
