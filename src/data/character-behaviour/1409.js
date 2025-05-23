export function applyCartethyiaLogic({
                                     mergedBuffs,
                                     combatState,
                                     skillMeta,
                                     characterState,
                                     isActiveSequence = () => false,
                                     isToggleActive = () => false
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

    if (tab === 'normalAttack' || tab === 'resonanceSkill' || tab === 'introSkill') {
        skillMeta.skillType = ['basic', 'aeroErosion'];
    } else if (tab === 'forteCircuit') {
        skillMeta.skillType = ['basic'];
        if (name === 'sword to answer waves\' call dmg') {
            skillMeta.skillType = ['skill'];
        } else if (tab === 'forteCircuit' && name.includes('heavy attack')) {
            skillMeta.skillType = ['heavy'];
        }
    }

    if (!characterState?.activeStates?.manifestActive) {
        if (name === 'resonance liberation damage' && !mergedBuffs.__ultBuff1) {
            skillMeta.skillDmgBonus = (skillMeta.skillDmgBonus ?? 0) + 60;
            mergedBuffs.__ultBuff1 = true;
        }
    } else {
        if (!mergedBuffs.__manifestActive) {
            mergedBuffs.aero = (mergedBuffs.aero ?? 0) + 60;
            mergedBuffs.__manifestActive = true;
        }
    }

    if (!mergedBuffs.__ultBuff2 && name === 'resonance liberation damage') {
        skillMeta.amplify = (skillMeta.amplify ?? 0) + Math.min(combatState.aeroErosion * 20, 100);
        mergedBuffs.__ultBuff2 = true;
    }


    if (characterState?.activeStates?.divinity && characterState?.activeStates?.manifestActive && !mergedBuffs.__divinity) {
        mergedBuffs.damageTypeAmplify.aeroErosion = (mergedBuffs.damageTypeAmplify.aeroErosion ?? 0) + 50;
        mergedBuffs.__divinity = true;
    }

    // inherent 1
    if (!mergedBuffs.__cartethyiaInherent1) {
        mergedBuffs.elementDmgAmplify.aero = (mergedBuffs.elementDmgAmplify.aero ?? 0) + Math.min(combatState.aeroErosion * 10, 60);
        mergedBuffs.__cartethyiaInherent1 = true;
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

    if (isActiveSequence(3) && name === 'resonance liberation damage') {
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

    if (isActiveSequence(6)) {
        if (!mergedBuffs.__cartethyiaSeq6) {
            console.log(mergedBuffs);
            mergedBuffs.elementDmgReduction = (mergedBuffs.elementDmgReduction ?? 0) + 40;
            mergedBuffs.__cartethyiaSeq6 = true;
        }
    } else {
        mergedBuffs.__cartethyiaSeq6 = false;
    }

    return { mergedBuffs, combatState, skillMeta };
}

// Manual healing skill declarations only
export const cartethyiaMultipliers = {

};
