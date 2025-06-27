export function applyPhrolovaLogic({
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
        amplify: skillMeta?.amplify ?? 0,
    };

    const isToggleActiveLocal = (key) => characterState?.activeStates?.[key] === true;
    const name = skillMeta.name?.toLowerCase();
    const tab = skillMeta.tab ?? '';

    if (name.includes('scarlet coda') || name.includes('suite of immortality') || tab === 'forteCircuit') {
        skillMeta.skillType = 'skill';
    } else if (tab === 'resonanceLiberation') {
        skillMeta.skillType = 'echoSkill';
    }

    const stacks = characterState?.activeStates?.inherent2 ?? 0;
    const critBonus = (stacks >= 24)
        ? 60 + (stacks - 24)
        : 2.5 * stacks;
    if (!mergedBuffs.__phrolovaInherent2) {
        mergedBuffs.critDmg = (mergedBuffs.critDmg ?? 150) + critBonus;
        mergedBuffs.__phrolovaInherent2 = true;
    }

    if (name.includes('dmg multiplier increase per aftersound')) {
        characterState.activeStates.__aftersound = skillMeta.multiplier;
        skillMeta.visible = false;
    }

    if (name.includes('scarlet coda')) {
        const perStack = characterState.activeStates.__aftersound ?? 0;
        const bonusMultiplier = Math.min(stacks * perStack, 24 * perStack);
        skillMeta.multiplier += bonusMultiplier;
    }

    if (isActiveSequence(1) && tab === 'forteCircuit') {
        skillMeta.multiplier *= 1.8;
    }

    if (isActiveSequence(2) && (name.includes('dmg multiplier increase per aftersound') || name.includes('scarlet coda'))) {
        skillMeta.multiplier *= 1.75;
    }

    if (isActiveSequence(3)) {
        if (!mergedBuffs.__phrolovaS3) {
            mergedBuffs.damageTypeAmplify.echoSkill = (mergedBuffs.damageTypeAmplify.echoSkill ?? 0) + 60;
            mergedBuffs.__phrolovaS3 = true;
        }

        if (name.includes('suite of immortality')) {
            skillMeta.multiplier *= 1.8;
        }
    }

    if (isActiveSequence(4) && isToggleActive(4) && !mergedBuffs.__phrolovaS4) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 20;
        mergedBuffs.__phrolovaS4 = true;
    }

    if (isActiveSequence(6)) {
        if (name.includes('enhanced attack - hecate')) {
            const bonusMultiplier = 1 + Math.min(stacks * 0.3, 24 * 0.3);
            skillMeta.multiplier *= bonusMultiplier;
        }

        if (name.includes('apparition of beyond - hecate')) {
            skillMeta.multiplier = 304.8/100;
            skillMeta.skillType = 'echoSkill';
        }

        if (isToggleActive(6) && name.includes('basic attack - hecate')) {
            skillMeta.skillDmgBonus = (skillMeta.skillDmgBonus ?? 0) + 300;
        }
    }

    return {mergedBuffs, combatState, skillMeta};
}

export const phrolovaMultipliers = {
    forteCircuit: [
        {
            name: "Apparition of Beyond - Hecate DMG",
            scaling: { atk: 1 },
        }
    ]
};


export function phrolovaBuffsLogic({
                                   mergedBuffs, characterState, activeCharacter
                               }) {
    const state = characterState?.activeStates ?? {};

    if (state.illuminating) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 20;
    }

    if (state.unfinishedPiece) {
        mergedBuffs.damageTypeAmplify.heavy = (mergedBuffs.damageTypeAmplify.heavy ?? 0) + 25;
        mergedBuffs.elementDmgAmplify.havoc = (mergedBuffs.elementDmgAmplify.havoc ?? 0) + 20;
    }

    return { mergedBuffs };
}