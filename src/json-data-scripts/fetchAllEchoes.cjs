const fs = require('fs');
const path = require('path');
const axios = require('axios');

const INDEX_URL = 'https://api.hakush.in/ww/data/echo.json';
const ECHO_BASE_URL = 'https://api.hakush.in/ww/data/en/echo';

async function fetchEchoIndex() {
    const { data } = await axios.get(INDEX_URL);
    return data;
}

async function fetchEchoDetails(echoId) {
    const { data } = await axios.get(`${ECHO_BASE_URL}/${echoId}.json`);
    return data;
}

async function fetchAllEchoes() {
    const index = await fetchEchoIndex();
    const echoList = Array.isArray(index) ? index : Object.keys(index);

    const allEchoes = [];

    for (let id of echoList) {
        try {
            const echoData = await fetchEchoDetails(id);
            allEchoes.push({ id, ...echoData });
            console.log(`Fetched echo ${id}`);
        } catch (error) {
            console.warn(`Failed to fetch ${id}: ${error.message}`);
        }
    }

    fs.writeFileSync(
        path.join(__dirname, 'echoes.json'),
        JSON.stringify(allEchoes, null, 2)
    );
    console.log('All echoes saved to echoes.json');
}

fetchAllEchoes().catch(console.error);