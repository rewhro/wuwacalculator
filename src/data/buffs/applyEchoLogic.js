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

    if (echo.impermanenceHeron && !mergedBuffs.__impermanenceHeron) {
        mergedBuffs[element]= (mergedBuffs[element] ?? 0) + 12;
        mergedBuffs.__impermanenceHeron = false;
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

    return mergedBuffs;
}