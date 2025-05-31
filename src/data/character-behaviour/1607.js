export function applyCantLogic({
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

    const s1 = [
        'perception',
        'graceful step',
        'flickering reverie'
    ].some(n => name.includes(n));

    if (name.includes('delusive')) {
        skillMeta.skillType = ['heavy'];
    }

    if (name.includes('jolt') || tab === 'forteCircuit' || tab === 'resonanceLiberation') {
        skillMeta.skillType = ['basic'];
    }

    if (name.includes('diffusion')) {
        skillMeta.skillType = ['basic', 'coord'];
    }

    if (characterLevel >= 50 && !mergedBuffs.__cantInherent1) {
        mergedBuffs.healingBonus = (mergedBuffs.healingBonus ?? 0) + 20;
        mergedBuffs.__cantInherent1 = false;
    }

    const inherent2Stacks = characterState?.activeStates?.inherent2 ?? 0;
    const inherent2 = Math.min(inherent2Stacks * 6, 12);

    if (!mergedBuffs.__cantInherent2) {
        mergedBuffs.havoc = (mergedBuffs.havoc ?? 0) + inherent2;
        mergedBuffs.__cantInherent2 = true;
    }

    if (isActiveSequence(1) && isToggleActive(1) && s1) {
        skillMeta.multiplier *= 1.5;
    }

    if (isActiveSequence(2) && name.includes('jolt')) {
        skillMeta.multiplier *= 2.45;
    }

    if (name.includes('suffocation') && isActiveSequence(3)) {
        skillMeta.multiplier *= 4.7;
    }

    if (isActiveSequence(4) && isToggleActive(4) && !mergedBuffs.__cantS4 ) {
        mergedBuffs.healingBonus = (mergedBuffs.healingBonus ?? 0) + 25;
        mergedBuffs.__cantS4 = false;
    }

    if (isActiveSequence(6)) {
        if (name.includes('phantom')) {
            skillMeta.multiplier *= 1.8;
        }

        if (isToggleActive(6) && !mergedBuffs.__cantS6) {
            mergedBuffs.enemyDefIgnore = (mergedBuffs.enemyDefIgnore ?? 0) + 30;
            mergedBuffs.__cantS6 = false;
        }
    }

    return {mergedBuffs, combatState, skillMeta};
}

export const cantMultipliers = {
    forteCircuit: [
        {
            name: "Healing by Consuming Trance",
            scaling: { atk: 1 },
            healing: true
        },
        {
            name: "Perception Drain Healing",
            scaling: { atk: 1 },
            healing: true
        }
    ]
};

export function cantBuffsLogic({
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

    if (state.tentacles) {
        mergedBuffs.damageTypeAmplify.skill = (mergedBuffs.damageTypeAmplify.skill ?? 0) + 25;
        mergedBuffs.elementDmgAmplify.havoc = (mergedBuffs.elementDmgAmplify.havoc ?? 0) + 20;
    }

    return { mergedBuffs };
}