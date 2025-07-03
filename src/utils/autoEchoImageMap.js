import { echoes } from '../json-data-scripts/getEchoes.js';
import echoSets, { setIconMap } from '../constants/echoSetData.jsx';

export const echoImageMap = {};
for (const echo of echoes) {
    if (!echo.icon || !echo.name) continue;
    echoImageMap[echo.name] = echo.icon;
}

export const setNameImageMap = {};
export const setIdFromName = {};
for (const set of echoSets) {
    const id = set.id;
    const name = set.name;
    const path = setIconMap[id];

    if (name && path) {
        setNameImageMap[name] = path;
        setIdFromName[name] = id;
    }
}

export default { echoImageMap, setNameImageMap };