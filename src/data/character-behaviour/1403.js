export function applyAaltoLogic({
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

    if (tab === 'forteCircuit') {
        skillMeta.skillType = 'skill';
    }

    const base = 0;
    if (name === 'hazey transition: stage 1 dmg') {
        const base = 3;
        console.log(base);
        skillMeta.multiplier = base / 2;
    }
    console.log(base);

    /*
        if (name.includes('hazey transition')) {
            skillMeta.multiplier = 1;
        }
    */
    if (isToggleActive(2) && isActiveSequence(2) && !mergedBuffs.__aaltoS2) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 15;
        mergedBuffs.__aaltoS2 = true;
    }

    return {mergedBuffs, combatState, skillMeta};
}

export const aaltoMultipliers = {
    normalAttack: [
        ...Array.from({ length: 5 }, (_, i) => ({
            name: `Hazey Transition: Stage ${i + 1} DMG`,
            scaling: { atk: 1 }
        })),
        {
            name: "Hazey Transition: Mid-air Attack",
            scaling: { atk: 1 }
        }
    ]
};