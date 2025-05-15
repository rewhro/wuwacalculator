// iconScraper.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, '../data/iconLinks.json');
const baseUrl = 'https://api.hakush.in/ww/UI/UIResources/Common/Image/IconRoleHead256/T_IconRoleHead256_';

async function checkUrl(id) {
    const url = `${baseUrl}${id}_UI.webp`;
    try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
            console.log(`✅ Found: ${url}`);
            return url;
        } else {
            console.warn(`❌ Not found: ${url}`);
            return null;
        }
    } catch (err) {
        console.error(`⚠️ Error fetching ${url}`, err);
        return null;
    }
}

async function run() {
    console.log('🌐 Starting fixed range icon scan...');

    const links = [];

    for (let id = 1; id <= 40; id++) {
        const result = await checkUrl(id);
        if (result) links.push({ id, url: result });
    }

    // Save to file
    fs.writeFileSync(OUTPUT_DIR, JSON.stringify(links, null, 2));
    console.log(`✅ Saved ${links.length} icon links to ${OUTPUT_DIR}`);
}

run();