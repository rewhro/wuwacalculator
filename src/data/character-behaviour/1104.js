export function applyLingyangLogic({
                                       mergedBuffs,
                                       combatState,
                                       skillMeta,
                                       characterState,
                                       isActiveSequence = () => false,
                                       isToggleActive = () => false
                                   }) {
    skillMeta = {
        name: skillMeta?.name ?? '',
        skillType: skillMeta?.skillType ?? 'basic',
        multiplier: skillMeta?.multiplier ?? 1,
        amplify: skillMeta?.amplify ?? 0,
        ...skillMeta
    };

    const name = skillMeta.name?.toLowerCase();

    // ✅ Reassign skillType based on name
    if (name.includes('glorious plunge damage')) {
        skillMeta.skillType = 'heavy';
    } else if (
        ['feral gyrate stage 1 dmg', 'feral gyrate stage 2 dmg', 'stormy kicks damage', 'tail strike damage']
            .some(n => name.includes(n))
    ) {
        skillMeta.skillType = 'basic';
    } else if (name.includes('mountain roamer damage')) {
        skillMeta.skillType = 'skill';
    }

    // ✅ Lion's Vigor passive
    if (characterState?.activeStates?.lionsVigor && !mergedBuffs.__lingyangVigorApplied) {
        mergedBuffs.glacio = (mergedBuffs.glacio ?? 0) + 50;
        mergedBuffs.__lingyangVigorApplied = true;
    }


    // ✅ Inherent 1: +50% Intro Skill DMG
    if (
        isToggleActive('inherent1') &&
        skillMeta.skillType === 'intro'
    ) {
        skillMeta.skillDmgBonus = (skillMeta.skillDmgBonus ?? 0) + 50;
    }


    // inherent 2
    if (name === 'mountain roamer damage' && !skillMeta.__inherent2Applied && isToggleActive('inherent2')) {
        skillMeta.multiplier = (skillMeta.multiplier ?? 0) * 2.5;
        skillMeta.__inherent2Applied = true;
    }

    // sequence 3
    if (isToggleActive(3) && isActiveSequence(3)) {
        if (!mergedBuffs.__lingyangs3) {
            mergedBuffs.basicAtk = (mergedBuffs.basicAtk ?? 0) + 20;
            mergedBuffs.resonanceSkill = (mergedBuffs.resonanceSkill ?? 0) + 10;
            mergedBuffs.__lingyangs3 = true;
        }
    } else {
        mergedBuffs.__lingyangs3 = false;
    }

    // sequence 5
    if (name === 'skill dmg' && !skillMeta.__lingyangs5 && isToggleActive(5) && isActiveSequence(5) && skillMeta.tab === 'resonanceLiberation') {
        skillMeta.multiplier = (skillMeta.multiplier ?? 0) + 2;
        skillMeta.__lingyangs5 = true;
    }

    // sequence 6
    if (
        skillMeta.tab === 'forteCircuit' &&
        isToggleActive(6) &&
        isActiveSequence(6) &&
        skillMeta.skillType === 'basic'
    ) {
        skillMeta.skillDmgBonus = (skillMeta.skillDmgBonus ?? 0) + 100;
        console.log(`[Lingyang S6] Applied +100 skillDmgBonus → ${skillMeta.name}`, skillMeta.skillDmgBonus);
    }
    return { mergedBuffs, combatState, skillMeta };
}




    export const lingYangMultipliers = {
     outroSkill: [
        {
            name: "Frosty Marks",
            multiplier: "587.94%",
            scaling: { atk: 1 }

        }
    ]
};
