import { echoes } from '../json-data-scripts/getEchoes.js';
import { setIconMap } from '../constants/echoSetData.jsx';

export const echoImageMap = {};
for (const echo of echoes) {
    if (!echo.icon || !echo.name) continue;
    echoImageMap[echo.name] = echo.icon;
}

export const setNameImageMap = {};
for (const [id, path] of Object.entries(setIconMap)) {
    const filename = path.split('/').pop().replace(/\.[^.]+$/, '');
    const name = filename
        .replace(/[-_]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, char => char.toUpperCase())
        .trim();

    setNameImageMap[name] = path;
}

export default { echoImageMap, setNameImageMap };