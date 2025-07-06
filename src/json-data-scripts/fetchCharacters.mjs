import fetch from 'node-fetch';
import fs from 'fs/promises';

const masterUrl = 'https://api.hakush.in/ww/data/character.json';
const detailUrl = id => `https://api.hakush.in/ww/data/en/character/${id}.json`;

async function buildFullCharacterList() {
    try {
        const res = await fetch(masterUrl);
        const master = await res.json();

        const allCharacters = [];

        for (const id of Object.keys(master)) {
            const url = detailUrl(id);
            try {
                const detailRes = await fetch(url);
                const characterData = await detailRes.json();
                allCharacters.push(characterData);
                console.log(`Added character ${id}`);
            } catch (err) {
                console.warn(`❌ Failed to fetch character ${id}:`, err.message);
            }
        }

        await fs.writeFile('../data/characters-mapped.json', JSON.stringify(allCharacters, null, 2));
        console.log('characters-mapped.generated.json has been saved.');
    } catch (err) {
        console.error('Failed to build character list:', err.message);
    }
}

buildFullCharacterList();