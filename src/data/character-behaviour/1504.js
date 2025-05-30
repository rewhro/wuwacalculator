export function applyLumiLogic({
                               mergedBuffs,
                               combatState,
                               skillMeta,
                               characterState,
                               isActiveSequence = () => false,
                               isToggleActive = () => false,
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
        if (name.includes('energized')) {
            skillMeta.skillType = 'skill';
        } else {
            skillMeta.skillType = 'basic';
        }
    }

    if (isToggleActiveLocal('inherent1') && !mergedBuffs.__lumiInherent1) {
        mergedBuffs.electro = (mergedBuffs.electro ?? 0) + 10;
        mergedBuffs.__lumiInherent1 = true;
    }

    if (isToggleActiveLocal('inherent2') && !mergedBuffs.__lumiInherent2) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 10;
        mergedBuffs.__lumiInherent2 = true;
    }

    if (isActiveSequence(2) && name.includes('energized')) {
        skillMeta.skillDefIgnore = (skillMeta.skillDefIgnore ?? 0) + 20;
    }

    if (isActiveSequence(3) && tab === 'resonanceLiberation') {
        skillMeta.skillDmgBonus = (skillMeta.skillDmgBonus ?? 0) + 30;
    }

    if (isActiveSequence(4) && !mergedBuffs.__lumiS4) {
        mergedBuffs.basicAtk = (mergedBuffs.basicAtk ?? 0) + 30;
        mergedBuffs.__lumiS4 = true;
    }

    if (isActiveSequence(5) && isToggleActive(5) && name.includes('laser')) {
        skillMeta.multiplier *= 2;
    }

    if (isActiveSequence(6) && isToggleActive(6) && !mergedBuffs.__lumiS6) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 20;
        mergedBuffs.__lumiS6 = true;
    }

    return {mergedBuffs, combatState, skillMeta};
}

export function lumiBuffsLogic({
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

    if (state.escorting) {
        mergedBuffs.damageTypeAmplify.skill = (mergedBuffs.damageTypeAmplify.skill ?? 0) + 38;
    }

    if (state.rating) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 20;
    }

    return { mergedBuffs };
}