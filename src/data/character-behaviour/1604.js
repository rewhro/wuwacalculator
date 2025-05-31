export function applyHavocWLogic({
                                       mergedBuffs,
                                       combatState,
                                       skillMeta,
                                       characterState,
                                       isActiveSequence = () => false,
                                       isToggleActive = () => false,
                                       characterLevel = 1,
                                   }) {
    skillMeta = {
        name: skillMeta?.name ?? '',
        skillType: skillMeta?.skillType ?? 'basic',
        multiplier: skillMeta?.multiplier ?? 1,
        amplify: skillMeta?.amplify ?? 0,
        ...skillMeta
    };

    const isToggleActiveLocal = (key) => characterState?.activeStates?.[key] === true;
    const name = skillMeta.name?.toLowerCase();
    const tab = skillMeta.tab ?? '';

    if (tab === 'forteCircuit') {
        skillMeta.skillType = 'basic';
    }

    if (name.includes('heavy') || name.includes('Devastation') || name.includes('thwackblade')) {
        skillMeta.skillType = 'heavy';
    }

    if (name.includes('lifetaker')) {
        skillMeta.skillType = 'skill';
    }

    if (tab === 'outroSkill') {
        skillMeta.multiplier = 143.3/100;
    }

    if (isToggleActiveLocal('inherent1') && !mergedBuffs.__havocWInherent1) {
        mergedBuffs.havoc = (mergedBuffs.havoc ?? 0) + 20;
        mergedBuffs.__havocWInherent1 = true;
    }

    if (isActiveSequence(1) && !mergedBuffs.__havocWS1) {
        mergedBuffs.resonanceSkill = (mergedBuffs.resonanceSkill ?? 0) + 30;
        mergedBuffs.__havocWS1 = true;
    }

    if (isActiveSequence(4) && !mergedBuffs.__havocWS4 && isToggleActive(4)) {
        mergedBuffs.enemyResShred = (mergedBuffs.enemyResShred ?? 0) + 10;
        mergedBuffs.__havocWS4 = true;
    }

    if (isActiveSequence(5) && tab === 'forteCircuit' && name.includes('5')) {
        skillMeta.multiplier *= 1.5;
    }

    if (isToggleActive(6) && isActiveSequence(6) && !mergedBuffs.__havocWS6) {
        mergedBuffs.critRate = (mergedBuffs.critRate ?? 0) + 25;
        mergedBuffs.__havocWS6 = true;
    }

    return {mergedBuffs, combatState, skillMeta};
}

export const havocWMultipliers = {
    outroSkill: [
        {
            name: "Soundweaver",
            scaling: { atk: 1 },
        }
    ]
};

export function havocWBuffsLogic({
                                       mergedBuffs, characterState, activeCharacter
                                   }) {
    const state = characterState?.activeStates ?? {};
    const elementMap = {
        1: 'glacio',
        2: 'fusion',
        3: 'electro',
        4: 'aero',
        5: 'spectro',
        6: 'havoc'
    };
    const element = elementMap?.[activeCharacter?.attribute];

    if (state.annihilated && element === 'havoc') {
        mergedBuffs.enemyResShred = (mergedBuffs.enemyResShred ?? 0) + 10;
    }

    return { mergedBuffs };
}