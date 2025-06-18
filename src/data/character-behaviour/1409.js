export function applyCartethyiaLogic({
                                     mergedBuffs,
                                     combatState,
                                     skillMeta,
                                     characterState,
                                     isActiveSequence = () => false,
                                     isToggleActive = () => false,
    characterLevel = 1,
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
    skillMeta.scaling = { atk: 0, hp: 1, def: 0, energyRegen: 0 };

    const name = skillMeta.name?.toLowerCase();
    const tab = skillMeta.tab ?? '';

    if (tab === 'normalAttack') {
        if (name.includes('mid-air')) {
            skillMeta.skillType = ['basic', 'aeroErosion'];
        } else {
            skillMeta.skillType = ['basic'];
        }
    } else if (tab === 'forteCircuit' || tab === 'resonanceSkill') {
        skillMeta.skillType = ['basic'];
        if (name === 'sword to answer waves\' call dmg' || name === 'may tempest break the tides dmg') {
            skillMeta.skillType = ['skill'];
        } else if (name.includes('heavy attack')) {
            skillMeta.skillType = ['heavy'];
        }
    }

    if (characterLevel >= 70 && tab.includes('o')) {
        const stacks = combatState.aeroErosion ?? 0;
        let bonus = 0;

        if (stacks >= 1 && stacks <= 3) {
            bonus = 30;
        } else if (stacks >= 4) {
            bonus = Math.min(10 * stacks, 60);
        }

        skillMeta.skillDmgBonus = (skillMeta.skillDmgBonus ?? 0) + bonus;
        if (isActiveSequence(6)) {
            skillMeta.skillDmgBonus = (skillMeta.skillDmgBonus ?? 0) + 40;
        }
    }

    if (tab === 'resonanceLiberation') {
        skillMeta.amplify = (skillMeta.amplify ?? 0) + Math.min(combatState.aeroErosion * 20, 100);
    }

    if (characterState?.activeStates?.divinity && characterState?.activeStates?.manifestActive && !mergedBuffs.__divinity) {
        mergedBuffs.damageTypeAmplify.aeroErosion = (mergedBuffs.damageTypeAmplify.aeroErosion ?? 0) + 50;
        mergedBuffs.__divinity = true;
    }

    // Sequence 2
    const seq1Value = (characterState?.toggles?.['1_value'] ?? 0) / 30;
    if (isActiveSequence(1) && seq1Value > 0) {
        if (!mergedBuffs.__cartethyiaSeq1) {
            mergedBuffs.critDmg = (mergedBuffs.critDmg ?? 0) + (seq1Value * 20);
            mergedBuffs.__cartethyiaSeq1 = true;
        }
    } else {
        mergedBuffs.__cartethyiaSeq1 = false;
    }

    if (isActiveSequence(2)) {
        if (tab === 'normalAttack' && name !== 'heavy attack dmg' && !name.includes('plunging')) {
            skillMeta.multiplier *= 1.5;
        } else if (tab === 'introSkill') {
            skillMeta.multiplier *= 1.5;
        } else if (tab === 'normalAttack' && name === 'plunging attack') {
            skillMeta.multiplier *= 3;
        }
    }

    if (isActiveSequence(3) && tab === 'resonanceLiberation') {
        skillMeta.multiplier *= 2;
    }

    if (isToggleActive(4) && isActiveSequence(4)) {
        if (!mergedBuffs.__cartethyiaSeq4) {
            mergedBuffs.aero = (mergedBuffs.aero ?? 0) + 20;
            mergedBuffs.__cartethyiaSeq4 = true;
        }
    } else {
        mergedBuffs.__cartethyiaSeq4 = false;
    }
/*
    if (isActiveSequence(6)) {
        if (!mergedBuffs.__cartethyiaSeq6) {
            mergedBuffs.elementDmgReduction = (mergedBuffs.elementDmgReduction ?? 0) + 40;
            mergedBuffs.__cartethyiaSeq6 = true;
        }
    } else {
        mergedBuffs.__cartethyiaSeq6 = false;
    }


 */
    return { mergedBuffs, combatState, skillMeta };
}

// Manual healing skill declarations only
export const cartethyiaMultipliers = {
    resonanceLiberation: [
        {
            name: 'Blade of Howling Squall DMG',
            scaling: { hp: 1 },
            Param: [
                [
                    "6.60%*7",
                    "7.14%*7",
                    "7.68%*7",
                    "8.44%*7",
                    "8.98%*7",
                    "9.61%*7",
                    "10.47%*7",
                    "11.34%*7",
                    "12.20%*7",
                    "13.12%*7",
                    "14.90%*7",
                    "16.03%*7",
                    "17.16%*7",
                    "18.30%*7",
                    "19.43%*7",
                    "20.57%*7",
                    "21.70%*7",
                    "22.84%*7",
                    "23.97%*7",
                    "25.11%*7"
                ]
            ]
        }
    ],
    forteCircuit: [
        {
            name: 'Sword to Answer Waves\' Call DMG',
            scaling: { hp: 1 },
            Param: [
                [
                    "0.94%*4+8.73%",
                    "1.02%*4 + 9.45%",
                    "1.09%*4 + 10.17%",
                    "1.20%*4 + 11.17%",
                    "1.28%*4 + 11.88%",
                    "1.37%*4 + 12.71%",
                    "1.49%*4 + 13.85%",
                    "1.61%*4 + 15.00%",
                    "1.73%*4 + 16.14%",
                    "1.86%*4 + 17.36%",
                    "1.74%*4+16.17%",
                    "1.87%*4+17.40%",
                    "2.00%*4+18.63%",
                    "2.13%*4+19.86%",
                    "2.26%*4+21.10%",
                    "2.40%*4+22.33%",
                    "2.53%*4+23.56%",
                    "2.66%*4+24.79%",
                    "2.79%*4+26.02%",
                    "2.92%*4+27.25%"
                ]
            ]
        },
        {
            name: 'May Tempest Break the Tides DMG',
            scaling: { hp: 1 },
            Param: [
                [
                    "0.94%*2 + 3.54%*3",
                    "1.02%*2 + 3.83%*3",
                    "1.09%*2 + 4.12%*3",
                    "1.20%*2 + 4.52%*3",
                    "1.28%*2 + 4.81%*3",
                    "1.37%*2 + 5.15%*3",
                    "1.49%*2 + 5.61%*3",
                    "1.61%*2 + 6.07%*3",
                    "1.73%*2 + 6.54%*3",
                    "1.86%*2 + 7.03%*3",
                    "1.74%*2+6.55%*3",
                    "1.87%*2+7.05%*3",
                    "2.00%*2+7.54%*3",
                    "2.13%*2+8.04%*3",
                    "2.26%*2+8.54%*3",
                    "2.40%*2+9.04%*3",
                    "2.53%*2+9.54%*3",
                    "2.66%*2+10.04%*3",
                    "2.79%*2+10.54%*3",
                    "2.92%*2+11.03%*3"
                ]
            ]
        }
    ]
};

export function cartBuffsLogic({
                                      mergedBuffs, characterState, activeCharacter, combatState
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

    if (state.wishes) {
        mergedBuffs.healingBonus = (mergedBuffs.healingBonus ?? 0) + 20;
    }

    if (state.sacrifice) {
        mergedBuffs[element] = (mergedBuffs[element] ?? 0) + 20;
    }

    if (state.blessing && (combatState.aeroErosion > 0 || combatState.spectroFrazzle > 0)) {
        mergedBuffs.elementDmgAmplify.aero = (mergedBuffs.elementDmgAmplify.aero ?? 0) + 17.5;
    }


    return { mergedBuffs };
}