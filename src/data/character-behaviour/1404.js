export function applyJiyanLogic({
                               mergedBuffs,
                               combatState,
                               skillMeta,
                               characterState,
                               isActiveSequence = () => false,
                               isToggleActive = () => false,
                           }) {
    skillMeta = {
        ...skillMeta,

        name: skillMeta?.name ?? '',
        skillType: Array.isArray(skillMeta?.skillType)
            ? [...skillMeta.skillType]
            : skillMeta?.skillType
                ? [skillMeta.skillType]
                : [],
        multiplier: skillMeta?.multiplier ?? 1,
        amplify: skillMeta?.amplify ?? 0
    };

    const isToggleActiveLocal = (key) => characterState?.activeStates?.[key] === true;
    const name = skillMeta.name?.toLowerCase();
    const tab = skillMeta.tab ?? '';

    if (tab === 'forteCircuit' || tab === 'resonanceLiberation') {
        skillMeta.skillType = 'heavy';
    } else if (tab === 'outroSkill') {
        skillMeta.skillType = ['outro', 'coord'];
        skillMeta.multiplier = 313.40/100;
    }

    if (characterState?.activeStates?.war && tab === 'resonanceSkill') {
        skillMeta.skillDmgBonus = (skillMeta.skillDmgBonus ?? 0) + 20;
    }

    if (isToggleActiveLocal('inherent1') && !mergedBuffs.__jiyanInherent1) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 10;
        mergedBuffs.__jiyanInherent1 = true;
    }

    if (isToggleActiveLocal('inherent2') && !mergedBuffs.__jiyanInherent2) {
        mergedBuffs.critDmg = (mergedBuffs.critDmg ?? 0) + 12;
        mergedBuffs.__jiyanInherent2 = true;
    }

    if (isToggleActive(2) && isActiveSequence(2) && !mergedBuffs.__jiyanS2) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 28;
        mergedBuffs.__jiyanS2 = true;
    }

    if (isToggleActive(3) && isActiveSequence(3) && !mergedBuffs.__jiyanS3) {
        mergedBuffs.critRate = (mergedBuffs.critRate ?? 0) + 16;
        mergedBuffs.critDmg = (mergedBuffs.critDmg ?? 0) + 32;
        mergedBuffs.__jiyanS3 = true;
    }

    if (isToggleActive(4) && isActiveSequence(4) && !mergedBuffs.__jiyanS4) {
        mergedBuffs.heavyAtk = (mergedBuffs.heavyAtk ?? 0) + 25;
        mergedBuffs.__jiyanS4 = true;
    }

    const seq5Value = characterState?.toggles?.['5_value'] ?? 0;
    if (isActiveSequence(5)) {
        if (tab === 'outroSkill') {
            skillMeta.multiplier += 1.2;
        }
        if (seq5Value > 0 && !mergedBuffs.__jiyanS5) {
            mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + (seq5Value * 3);
            mergedBuffs.__jiyanS5 = true;
        }
    }

    const seq6Value = characterState?.toggles?.['6_value'] ?? 0;
    if (isActiveSequence(6) && seq6Value > 0 && tab === 'forteCircuit') {
        skillMeta.multiplier *= (1 + (seq6Value * 1.2));
    }

    return {mergedBuffs, combatState, skillMeta};
}

export const jiyanMultipliers = {
    outroSkill: [
        {
            name: "Discipline DMG",
            scaling: { atk: 1 }
        }
    ]
};

export function jiyanBuffsLogic({
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

    if (state.prudence) {
        mergedBuffs.heavyAtk = (mergedBuffs.heavyAtk ?? 0) + 25;
    }

    return { mergedBuffs };
}