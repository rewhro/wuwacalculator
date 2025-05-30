export function applyZaniLogic({
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
    const ember = characterState?.activeStates?.ember ?? 0;

    if (tab === 'resonanceSkill') {
        if (name.includes('targeted') || name.includes('forcible')) {
            skillMeta.skillType = ['skill', 'spectroFrazzle'];
        }
    } else if (tab === 'forteCircuit') {
        skillMeta.skillType = ['heavy', 'spectroFrazzle'];
    } else if (tab === 'outroSkill') {
        skillMeta.skillType = ['outro', 'spectroFrazzle'];
        skillMeta.multiplier = 1.5;
        skillMeta.skillDmgBonus = (skillMeta.skillDmgBonus ?? 0) + ember * 10;
    }

    if (characterState?.activeStates?.sunburst && !mergedBuffs.__zaniSunburst) {
        mergedBuffs.damageTypeAmplify.spectroFrazzle = (mergedBuffs.damageTypeAmplify.spectroFrazzle ?? 0) + 20;
        mergedBuffs.__zaniSunburst = true;
    }

    if (name === 'basic attack multiplier increase') {
        characterState.activeStates.__infernoValue = skillMeta.multiplier;
        skillMeta.visible = false;
    }

    if (tab === 'normalAttack' && !name.includes('heavy') && characterState?.activeStates?.inferno) {
        skillMeta.multiplier *= (1 + characterState.activeStates.__infernoValue);
    }

    if (name === 'additional multiplier per blaze') {
        characterState.activeStates.__blazeValue = skillMeta.multiplier;
        skillMeta.visible = false;
    }

    if (name === 'heavy slash - nightfall dmg') {
        const stacks = characterState?.activeStates?.blaze ?? 0;
        const perStack = characterState?.activeStates?.__blazeValue ?? 0;
        const bonusMultiplier = Math.min(stacks * perStack, 58);
        skillMeta.multiplier += bonusMultiplier;
    }

    if (isToggleActiveLocal('inherent1') && !mergedBuffs.__ZaniInherent1) {
        mergedBuffs.spectro = (mergedBuffs.spectro ?? 0) + 12;
        mergedBuffs.__ZaniInherent1 = true;
    }

    if (isToggleActive(1) && isActiveSequence(1) && !mergedBuffs.__zaniS1) {
        mergedBuffs.spectro = (mergedBuffs.spectro ?? 0) + 50;
        mergedBuffs.__zaniS1 = true;
    }

    if (isActiveSequence(2)) {
        if (!mergedBuffs.__zaniS2) {
            mergedBuffs.critRate = (mergedBuffs.critRate ?? 0) + 20;
            mergedBuffs.__zaniS2 = true;
        }
        if (name.includes('forcible') || name.includes('targeted')) {
            skillMeta.multiplier *= 1.8;
        }
    }

    const blazeS3 = characterState?.toggles?.['3_value'] ?? 0;
    if (isActiveSequence(3) && name.includes('the last stand')) {
        skillMeta.multiplier += Math.min(blazeS3 * 8, 1200)/100;
    }

    if (isToggleActive(4) && isActiveSequence(4) && !mergedBuffs.__zaniS4) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 20;
        mergedBuffs.__zaniS4 = true;
    }

    if (isActiveSequence(5) && name.includes('rekindle')) {
        skillMeta.multiplier *= 2.2;
    }

    if (isActiveSequence(6) && tab === 'forteCircuit') {
        skillMeta.multiplier *= 1.4;
    }

    return {mergedBuffs, combatState, skillMeta};
}

export const zaniMultipliers = {
    outroSkill: [
        {
            name: "Beacon For the Future DMG",
            scaling: { atk: 1 }
        }
    ]
};

export function zaniBuffsLogic({
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

    if (state.beacon) {
        mergedBuffs.elementDmgAmplify.spectro = (mergedBuffs.elementDmgAmplify.spectro ?? 0) + 20;
    }

    if (state.efficiency) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 20;
    }

    return { mergedBuffs };
}