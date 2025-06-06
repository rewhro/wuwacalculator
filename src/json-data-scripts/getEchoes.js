import rawEchoes from '../data/echoes.json';
import echoSets from '../constants/echoSetData.jsx';

function formatEchoIconName(name = '') {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[-:]/g, ' ')
        .split(' ')
        .map((word, index) =>
            index === 0
                ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join('') + '.png';
}

function formatDescription(desc = '', params = []) {
    return desc.replace(/\{(\d+)\}/g, (_, i) => {
        const val = params[+i];
        if (typeof val === 'number') {
            return val % 1 === 0 ? val : (val * 100).toFixed(1) + '%';
        }
        return val ?? `{${i}}`;
    });
}

export const echoes = rawEchoes.map(echo => {
    const id = String(echo.Id ?? echo.id);
    const name = echo.Name ?? 'Unknown Echo';
    const intensity = echo.IntensityCode;

    let cost = 4;
    if (intensity === 1) cost = 3;
    else if (intensity === 0) cost = 1;

    // Local icon (based on formatted name)
    const iconFileName = formatEchoIconName(name);
    const localIcon = `/assets/echoes/${iconFileName}`;

    // Inject param values into description
    const descRaw = echo.Skill?.Desc ?? '';
    const paramValues = echo.Skill?.Param ?? [];
    const description = formatDescription(descRaw, paramValues);

    // Extract set IDs from Group keys
    let sets = echo.Group ? Object.keys(echo.Group).map(Number) : [];

    // Optional: Hardcode extra set IDs for specific echoes
    if (id === "6000085") {
        sets.push(1, 2, 3, 4, 5, 6); // Add additional sets
    }

    return {
        id,
        name,
        icon: localIcon,
        cost,
        description,
        rawDesc: descRaw,
        rawParams: paramValues,
        type: echo.Type ?? '',
        place: echo.Place ?? '',
        mainStats: echo.mainStats ?? {},
        subStats: echo.subStats ?? {},
        sets
    };
});