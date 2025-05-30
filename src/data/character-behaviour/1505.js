export function applySkLogic({
                               mergedBuffs,
                               combatState,
                               skillMeta,
                               characterState,
                               isActiveSequence = () => false,
                               isToggleActive = () => false,
                                 characterLevel = 1
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
        if (name.includes('deduction')) {
            skillMeta.skillType = 'heavy';
        } else {
            skillMeta.skillType = 'basic';
        }
    }

    if (name.includes('discernment')) {
        skillMeta.skillType = 'ultimate';
        skillMeta.critRateBonus = 9999999;
    }

    if (name === 'life entwined: healing') {
        skillMeta.multiplier = 0.5;
        skillMeta.visible = characterLevel >= 50;
    }

    if (isToggleActiveLocal('inherent2') && !mergedBuffs.__skInherent2) {
        mergedBuffs.energyRegen = (mergedBuffs.energyRegen ?? 0) + 10;
        mergedBuffs.__skInherent2 = true;
    }

    const energyRegen = (mergedBuffs.energyRegen ?? 0) + 100;

    if (characterState?.activeStates?.innerS && !mergedBuffs.__innerS) {
        const critBonus = Math.min(energyRegen * 0.05, 12.5);
        mergedBuffs.critRate = (mergedBuffs.critRate ?? 0) + critBonus;
        mergedBuffs.__innerS = true;
    }

    if (characterState?.activeStates?.supernal && !mergedBuffs.__supernal) {
        const critDmgBonus = Math.min(energyRegen * 0.1, 25);
        mergedBuffs.critDmg = (mergedBuffs.critDmg ?? 0) + critDmgBonus;
        mergedBuffs.__supernal = true;
    }

    if (characterState?.activeStates?.butterfly && !mergedBuffs.__butterfly) {
        mergedBuffs.elementDmgAmplify.spectro = (mergedBuffs.elementDmgAmplify.spectro ?? 0) + 15;
        mergedBuffs.__butterfly = true;
    }

    if (isActiveSequence(2) && characterState?.activeStates?.supernal && !mergedBuffs.__skS2) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 40;
        mergedBuffs.__skS2 = true;
    }

    if (isActiveSequence(4) && isToggleActive(4) && !mergedBuffs.__skS4) {
        mergedBuffs.healingBonus = (mergedBuffs.healingBonus ?? 0) + 70;
        mergedBuffs.__skS4 = true;
    }

    if (isActiveSequence(6) && name.includes('discernment dmg')) {
        skillMeta.multiplier *= 1.42;
        skillMeta.critDmgBonus = (skillMeta.critDmgBonus ?? 0) + 500;
    }

    return {mergedBuffs, combatState, skillMeta};
}

export const skMultipliers = {
    normalAttack: [
        {
            name: "Life Entwined: Healing",
            scaling: { hp: 1 },
            healing: true
        }
    ],
    resonanceLiberation: [
        {
            name: "Healing",
            scaling: { hp: 1 },
            healing: true
        }
    ],
    introSkill: [
        {
            name: "Enlightenment Healing",
            scaling: { hp: 1 },
            healing: true
        },
        {
            name: "Discernment Healing",
            scaling: { hp: 1 },
            healing: true
        },
        {
            name: "Discernment DMG",
            scaling: { hp: 1 }
        }
    ],
    resonanceSkill: [
        {
            name: "Healing",
            scaling: { hp: 1 },
            healing: true
        }
    ]
};

export function SKBuffsLogic({
                                    mergedBuffs, characterState, activeCharacter
                                }) {
    const state = characterState?.activeStates ?? {};
    const critRate = state.innerEnergy * 0.05;

    if (state.inner) {
        mergedBuffs.critRate = (mergedBuffs.critRate ?? 0) + critRate;
    }

    if (state.supernal) {
        mergedBuffs.critDmg = (mergedBuffs.critDmg ?? 0) + critRate * 2;
    }

    const elementMap = {
        1: 'glacio',
        2: 'fusion',
        3: 'electro',
        4: 'aero',
        5: 'spectro',
        6: 'havoc'
    };
    const element = elementMap?.[activeCharacter?.attribute];

    if (state.butterfly) {
        mergedBuffs.elementDmgAmplify[element] = (mergedBuffs.elementDmgAmplify[element] ?? 0) + 15;
    }

    if (state.nightsGift) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 40;
    }

    return { mergedBuffs };
}