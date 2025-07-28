import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.resolve(__dirname, '../src/data/weapons.json');

const weaponApiUrl = 'https://api.hakush.in/ww/data/weapon.json';

async function fetchAndSaveWeapons() {
    try {
        console.log('Fetching weapon data from Hakushin...');
        const response = await fetch(weaponApiUrl);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);

        const weaponRaw = await response.json();

        if (typeof weaponRaw !== 'object' || Array.isArray(weaponRaw)) {
            throw new Error('Unexpected weapon data format: expected object');
        }

        const weapons = Object.entries(weaponRaw).map(([id, weapon]) => ({
            id,
            name: weapon.en,
            description: weapon.desc,
            icon: `https://api.hakush.in/ww${weapon.icon}.webp`,
            rank: weapon.rank,
            type: weapon.type
        }));

        await fs.writeFile(outputPath, JSON.stringify(weapons, null, 2));
        console.log(`Saved ${weapons.length} weapons to weapons.json`);
    } catch (err) {
        console.error('Error fetching weapon data:', err.message);
    }
}

fetchAndSaveWeapons();