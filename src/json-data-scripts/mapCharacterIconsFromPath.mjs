import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const charactersPath = path.resolve(__dirname, '../data/characters.json');
const outputPath = path.resolve(__dirname, '../data/characters-mapped.json');

async function loadCharacters() {
    console.log(`Reading file: ${charactersPath}`);
    try {
        const data = await fs.readFile(charactersPath, 'utf-8');
        const json = JSON.parse(data);

        let characters = [];
        if (Array.isArray(json)) {
            characters = json;
        } else if (Array.isArray(json.characters)) {
            characters = json.characters;
        } else if (Array.isArray(json.data)) {
            characters = json.data;
        } else {
            console.error('Could not detect array inside json file. Exiting.');
            process.exit(1);
        }

        console.log(`Found ${characters.length} characters.`);
        return characters;
    } catch (err) {
        console.error(`Failed to read or parse file:`, err);
        process.exit(1);
    }
}

function extractIconIdFromPath(iconPath) {
    const match = iconPath.match(/IconRoleHead256_(\d+)_UI/);
    return match ? parseInt(match[1], 10) : null;
}

function mapIconsToCharacters(characters) {
    console.log(`🔧 Mapping icons for ${characters.length} characters...`);
    return characters.map(char => {
        let iconPath = char.icon ?? char.Icon ?? '';
        if (!iconPath || iconPath.startsWith('http')) return char;

        const iconId = extractIconIdFromPath(iconPath);
        if (!iconId) {
            console.warn(`Could not extract icon id from: ${iconPath}`);
            return char;
        }

        const newIconUrl = `https://api.hakush.in/ww/UI/UIResources/Common/Image/IconRoleHead256/T_IconRoleHead256_${iconId}_UI.webp`;

        char.icon = newIconUrl;
        char.Icon = newIconUrl;

        return char;
    });
}

async function run() {
    const characters = await loadCharacters();

    if (!characters.length) {
        console.warn('No characters found. Exiting.');
        process.exit(0);
    }

    const updated = mapIconsToCharacters(characters);
    await fs.writeFile(outputPath, JSON.stringify(updated, null, 2), 'utf-8');
    console.log(`Saved mapped file to: ${outputPath}`);
}

run().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});