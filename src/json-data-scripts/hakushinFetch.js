import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hakushinFilePath = path.resolve(__dirname, '../data/characters.json');

async function run() {
    try {
        const fileContents = await fs.readFile(hakushinFilePath, 'utf-8');
        const data = JSON.parse(fileContents);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error(`Failed to load hakushin data from ${hakushinFilePath}:`, error.message);
        return [];
    }
}