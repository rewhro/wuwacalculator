export function applyLupaLogic({
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

    // ✅ Pack Hunt (fusion), applied once
    const stacks = characterState?.activeStates?.packHunt ?? 0;
    const packHunt = Math.min(stacks * 6, 18);

    if (!mergedBuffs.__lupaPackHuntApplied) {
        mergedBuffs.fusion = (mergedBuffs.fusion ?? 0) + packHunt;
        mergedBuffs.__lupaPackHuntApplied = true;
    }

    // ✅ Skill type fixes
    if (name.includes('mid-air attack - firestrike dmg')) {
        skillMeta.skillType = 'heavy';
    } else if (['dance with the wolf dmg', 'dance with the wolf - climax dmg'].some(n => name.includes(n))) {
        skillMeta.skillType = 'ultimate';
    } else if (name.includes('set the arena ablaze dmg')) {
        skillMeta.skillType = 'skill';
    }

    // ✅ Inherent 1 toggle
    if (isToggleActiveLocal('inherent1')) {
        if (!mergedBuffs.__lupaInherent1) {
            mergedBuffs.atkPercent += 12;
            mergedBuffs.__lupaInherent1 = true;
        }
    } else {
        mergedBuffs.__lupaInherent1 = false;
    }


    // ✅ Inherent 2 (enemyResShred), applied once
    const inherent2Stacks = characterState?.activeStates?.inherent2 ?? 0;
    const inherent2 = Math.min(inherent2Stacks * 5, 15);

    if (!mergedBuffs.__lupaInherent2Applied) {
        mergedBuffs.enemyResShred = (mergedBuffs.enemyResShred ?? 0) + inherent2;
        mergedBuffs.__lupaInherent2Applied = true;
    }

    // Sequence 1: +25% Crit Rate
    if (isToggleActive(1) && isActiveSequence(1)) {
        if (!mergedBuffs.__seq1) {
            mergedBuffs.critRate = (mergedBuffs.critRate ?? 0) + 25;
            mergedBuffs.__seq1 = true;
        }
    } else {
        mergedBuffs.__seq1 = false;
    }

    // Sequence 2: +40% fusion
    const seq2Value = characterState?.toggles?.['2_value'] ?? 0;
    if (isActiveSequence(2) && seq2Value > 0) {
        if (!mergedBuffs.__seq2) {
            mergedBuffs.fusion = (mergedBuffs.fusion ?? 0) + (seq2Value * 20);
            mergedBuffs.__seq2 = true;
        }
    } else {
        mergedBuffs.__seq2 = false;
    }

    // sequence 3
    if (isActiveSequence(3) && name.includes('nowhere to run dmg')) {
        skillMeta.multiplier *= 2;
    }

    // sequence 4
    if (isActiveSequence(4) && name.includes('dance with the wolf - climax dmg')) {
        skillMeta.multiplier *= 2.25;
    }

    // sequence 5
    if (isToggleActive(5) && isActiveSequence(5)) {
        if (!mergedBuffs.__seq5) {
            mergedBuffs.resonanceLiberation = (mergedBuffs.resonanceLiberation ?? 0) + 15;
            mergedBuffs.__seq5 = true;
        }
    } else {
        mergedBuffs.__seq5 = false;
    }

    // sequence 6
    if (isActiveSequence(6)) {
        const isTargetSkill =
            ['nowhere to run dmg', 'dance with the wolf - climax dmg'].some(n => name.includes(n)) ||
            (skillMeta.tab === 'resonanceLiberation' && name.includes('skill damage'));

        if (isTargetSkill && !skillMeta.__seq6Applied) {
            skillMeta.skillDefIgnore = (skillMeta.skillDefIgnore ?? 0) + 40;
            skillMeta.__seq6Applied = true;
        }
    } else {
        skillMeta.__seq6Applied = false;
    }


    return { mergedBuffs, combatState, skillMeta };
}