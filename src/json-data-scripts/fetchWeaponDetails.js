import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const weaponListUrl = 'https://api.hakush.in/ww/data/weapon.json';
const weaponDetailBase = 'https://api.hakush.in/ww/data/en/weapon/';

const outputPath = path.resolve(__dirname, '../data/weaponDetails.json');

async function fetchWeaponDetails() {
    try {
        console.log('Fetching weapon list...');
        const listResponse = await fetch(weaponListUrl);
        if (!listResponse.ok) throw new Error(`Failed to fetch weapon list: ${listResponse.status}`);
        const weaponMap = await listResponse.json();

        const weaponIds = Object.keys(weaponMap);
        const weaponDetails = [];

        console.log(`Fetching details for ${weaponIds.length} weapons...`);

        for (const id of weaponIds) {
            try {
                const res = await fetch(`${weaponDetailBase}${id}.json`);
                if (!res.ok) throw new Error(`Failed to fetch weapon ${id}: ${res.status}`);
                const detail = await res.json();

                detail.icon = `https://api.hakush.in/ww/UI/UIResources/Common/Image/IconWeapon/T_IconWeapon${id}_UI.webp`;

                weaponDetails.push(detail);
                console.log(`${id} loaded`);
            } catch (err) {
                console.warn(`Skipped ${id}: ${err.message}`);
            }
        }

        await fs.writeFile(outputPath, JSON.stringify(weaponDetails, null, 2));
        console.log(`Done! Saved ${weaponDetails.length} entries to weaponDetails.json`);
    } catch (err) {
        console.error('Fatal error:', err.message);
    }
}

fetchWeaponDetails();