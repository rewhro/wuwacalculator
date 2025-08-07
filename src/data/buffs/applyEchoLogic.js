import echoSets, {setIconMap} from "../../constants/echoSetData.jsx";

export function applyEchoLogic({ mergedBuffs, characterState, activeCharacter }) {
    const echo = characterState?.activeStates ?? {};

    const elementMap = {
        1: 'glacio',
        2: 'fusion',
        3: 'electro',
        4: 'aero',
        5: 'spectro',
        6: 'havoc'
    };
    const element = elementMap?.[activeCharacter?.attribute];

    if (echo.rejuvenatingGlow) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 15;
    }

    if (echo.moonlitClouds) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 22.5;
    }

    if (echo.impermanenceHeron) {
        mergedBuffs[element]= (mergedBuffs[element] ?? 0) + 12;
    }

    if (echo.bellBorne) {
        mergedBuffs[element] = (mergedBuffs[element] ?? 0) + 10;
    }

    if (echo.fallacy) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 10;
    }

    if (echo.midnightVeil) {
        mergedBuffs.havoc = (mergedBuffs.havoc ?? 0) + 15;
    }

    if (echo.empyreanAnthem) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 20;
    }

    if (echo.gustsOfWelkin) {
        mergedBuffs.aero = (mergedBuffs.aero ?? 0) + 15;
    }

    if (echo.clawprint) {
        mergedBuffs.fusion = (mergedBuffs.fusion ?? 0) + 15;
    }

    const lawOfHarmonyStack = echo.lawOfHarmony ?? 0;
    mergedBuffs.echoSkill = (mergedBuffs.echoSkill ?? 0) + 8 * lawOfHarmonyStack;

    return mergedBuffs;
}


export function getActiveEchoes(activeStates = {}) {
    const echoKeyToNameMap = {
        rejuvenatingGlow: 'Rejuvenating Glow',
        moonlitClouds: 'Moonlit Clouds',
        impermanenceHeron: 'Impermanence Heron',
        bellBorne: 'Bell-Borne Geochelone',
        fallacy: 'Fallacy of Dawn',
        midnightVeil: 'Midnight Veil',
        empyreanAnthem: 'Empyrean Anthem',
        gustsOfWelkin: 'Gusts of Welkin',
        clawprint: 'Flaming Clawprint',
        lawOfHarmony: 'Law of Harmony',
    };

    const result = [];

    Object.entries(echoKeyToNameMap).forEach(([key, name]) => {
        const value = activeStates[key];
        if (value === true || (typeof value === 'number' && value > 0)) {
            const echoSet = echoSets.find(e => e.name === name);
            if (echoSet) {
                result.push({
                    id: echoSet.id,
                    name: echoSet.name,
                    icon: setIconMap[echoSet.id] || '/assets/echoes/default.webp'
                });
            }
        }
    });

    return result;
}