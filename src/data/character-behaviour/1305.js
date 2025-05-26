export function applyYaoLogic({
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

    if (tab === 'resonanceLiberation') {
        if (name.includes('pivot')) {
            skillMeta.skillType = 'basic';
        } else if (name.includes('divergence')) {
            skillMeta.skillType = 'skill';
        }
    } else if (tab === 'forteCircuit') {
        skillMeta.skillType = 'ultimate';
    } else if (tab === 'outroSkill') {
        skillMeta.multiplier = 237.63/100;
    }

    const inherent1Stacks = characterState?.activeStates?.inherent1 ?? 0;
    const inherent1 = Math.min(inherent1Stacks * 5, 20);

    if (!mergedBuffs.__changliInherent1) {
        mergedBuffs.electro = (mergedBuffs.electro ?? 0) + inherent1;
        mergedBuffs.__changliInherent1 = true;
    }

    if (name.includes('law of reigns')) {
        characterState.activeStates.__incandescenceValue = skillMeta.multiplier;
    }
    if (name === 'prodigy of protégés: convolution matrices dmg') {
        const base = characterState?.activeStates?.incandescence ?? 0;
        skillMeta.multiplier = base * 0.08;
        skillMeta.visible = isActiveSequence(1);
    }

    if (isActiveSequence(2) && isToggleActive(2) && !mergedBuffs.__yaoS2) {
        mergedBuffs.critRate = (mergedBuffs.critRate ?? 0) + 30;
        mergedBuffs.__yaoS2 = true;
    }

    if (['divergence dmg', 'decipher dmg', 'law of reigns dmg']
        .some(n => name.includes(n)) || (tab === 'resonanceSkill' && name.includes('skill dmg'))
    && isToggleActive(3) && isActiveSequence(3)) {
        skillMeta.skillDmgBonus = (skillMeta.skillDmgBonus ?? 0) + 63;
    }

    if (isActiveSequence(4) && isToggleActive(4) && !mergedBuffs.__yaoS4) {
        mergedBuffs.electro = (mergedBuffs.electro ?? 0) + 25;
        mergedBuffs.__yaoS4 = true;
    }

    if (isActiveSequence(5)) {
        if (name.includes('chain rule')) {
            skillMeta.multiplier *= 3.22;
        } else if (name.includes('cogitation model')) {
            skillMeta.multiplier *= 2;
        }
    }

    if (isActiveSequence(6) && name.includes('law of reigns')) {
        skillMeta.multiplier *= 1.76;
    }

    return {mergedBuffs, combatState, skillMeta};
}

export const yaoMultipliers = {
    outroSkill: [
        {
            name: "Chain Rule",
            scaling: { atk: 1 }
        }
    ],
    resonanceSkill: [
        {
            name: "Prodigy of Protégés: Convolution Matrices DMG",
            scaling: { atk: 1 }
        }
    ]
};
