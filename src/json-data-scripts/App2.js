// scripts/testFetchHakushin.js
import { fetchCharacters } from './wutheringFetch.js';

async function run() {
    const characters = await fetchCharacters();
    console.log('Fetched characters:', characters);
}

run();