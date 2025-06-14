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

    // ✅ Inherent 2 (enemyResShred), applied once
    const inherent2Stacks = characterState?.activeStates?.inherent2 ?? 0;
    const inherent2 = Math.min(inherent2Stacks * 5, 15);

    if (!mergedBuffs.__lupaInherent2Applied) {
        mergedBuffs.enemyResShred = (mergedBuffs.enemyResShred ?? 0) + inherent2;
        mergedBuffs.__lupaInherent2Applied = true;
    }

    // Sequence 1: +25% Crit Rate
    if (isToggleActive(1) && isActiveSequence(1)) {
        if (!mergedBuffs.__lupSeq1) {
            mergedBuffs.critRate = (mergedBuffs.critRate ?? 0) + 25;
            mergedBuffs.__lupSeq1 = true;
        }
    } else {
        mergedBuffs.__lupSeq1 = false;
    }

    // Sequence 2: +40% fusion
    const seq2Value = characterState?.toggles?.['2_value'] ?? 0;
    if (isActiveSequence(2) && seq2Value > 0) {
        if (!mergedBuffs.__lupSeq2) {
            mergedBuffs.fusion = (mergedBuffs.fusion ?? 0) + (seq2Value * 20);
            mergedBuffs.__lupSeq2 = true;
        }
    } else {
        mergedBuffs.__lupSeq2 = false;
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
        if (!mergedBuffs.__lupSeq3) {
            mergedBuffs.resonanceLiberation = (mergedBuffs.resonanceLiberation ?? 0) + 15;
            mergedBuffs.__lupSeq3 = true;
        }
    } else {
        mergedBuffs.__lupSeq3 = false;
    }

    // sequence 6
    if (isActiveSequence(6)) {
        const isTargetSkill =
            ['nowhere to run dmg', 'dance with the wolf - climax dmg'].some(n => name.includes(n)) ||
            (skillMeta.tab === 'resonanceLiberation' && name.includes('skill damage'));

        if (isTargetSkill && !skillMeta.__lupSeq6) {
            skillMeta.skillDefIgnore = (skillMeta.skillDefIgnore ?? 0) + 40;
            skillMeta.__lupSeq6 = true;
        }
    } else {
        skillMeta.__lupSeq6 = false;
    }

    return { mergedBuffs, combatState, skillMeta };
}

export function lupaBuffsLogic({
                                     mergedBuffs, characterState, activeCharacter
                                 }) {
    const state = characterState?.activeStates ?? {};
    const stacks = state.glory * 3;
    const stacks2 = state.huntingField * 20;

    const elementMap = {
        1: 'glacio',
        2: 'fusion',
        3: 'electro',
        4: 'aero',
        5: 'spectro',
        6: 'havoc'
    };
    const element = elementMap?.[activeCharacter?.attribute];

    if (element === 'fusion') {
        mergedBuffs.enemyResShred = (mergedBuffs.enemyResShred ?? 0) + stacks;
        if (state.glory >= 3) {
            mergedBuffs.enemyResShred = (mergedBuffs.enemyResShred ?? 0) + 6;
        }
    }

    if (state.warrior) {
        mergedBuffs.damageTypeAmplify.basic = (mergedBuffs.damageTypeAmplify.basic ?? 0) + 25;
        mergedBuffs.elementDmgAmplify.fusion = (mergedBuffs.elementDmgAmplify.fusion ?? 0) + 20;
    }

    mergedBuffs.fusion = (mergedBuffs.fusion ?? 0) + stacks2;

    return { mergedBuffs };
}