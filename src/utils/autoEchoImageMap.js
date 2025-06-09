import { echoes } from '../json-data-scripts/getEchoes.js';
import { setIconMap } from '../constants/echoSetData.jsx';

// === Echo Image Map ===
export const echoImageMap = {};
for (const echo of echoes) {
    if (!echo.icon || !echo.name) continue;
    echoImageMap[echo.name] = echo.icon;
}

// === Set Image Map (auto-derived from filenames) ===
export const setNameImageMap = {};
for (const [id, path] of Object.entries(setIconMap)) {
    const filename = path.split('/').pop().replace(/\.[^.]+$/, ''); // 'frostyResolve'
    const name = filename
        .replace(/[-_]/g, ' ')                     // 'frosty Resolve'
        .replace(/([a-z])([A-Z])/g, '$1 $2')       // 'frosty Resolve'
        .replace(/\b\w/g, char => char.toUpperCase()) // 'Frosty Resolve'
        .trim();

    setNameImageMap[name] = path;
}

export default { echoImageMap, setNameImageMap };