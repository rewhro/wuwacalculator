export function applyChixiaLogic({
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

    if (name === 'leaping flames') {
        skillMeta.multiplier = 530/100;
    }

    if (tab === 'forteCircuit') {
        skillMeta.skillType = 'skill';
    }

    if (name === 'boom boom damage' && !mergedBuffs.__chixiaInherent1) {
        skillMeta.skillDmgBonus = (skillMeta.skillDmgBonus ?? 0) + 50;
        mergedBuffs.__chixiaInherent1 = true;
    }

    const inherent2Stacks = characterState?.activeStates?.inherent2 ?? 0;
    const inherent2 = Math.min(inherent2Stacks * 1, 30);
    if (inherent2 > 0 && !mergedBuffs.__chixiaInherent2) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + inherent2;
        mergedBuffs.__chixiaInherent2 = true;
    }

    if (isActiveSequence(1) && name === 'boom boom damage') {
        skillMeta.critRateBonus = 999999;
    }

    if (isToggleActive(3) && isActiveSequence(3) && !mergedBuffs.__chixiaSeq3 && tab === 'resonanceLiberation') {
        skillMeta.skillDmgBonus = (skillMeta.skillDmgBonus ?? 0) + 40;
        mergedBuffs.__chixiaSeq3 = true;
    }

    if(isActiveSequence(5) && inherent2 >= 30 && !mergedBuffs.__chixiaSeq5) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 30;
        mergedBuffs.__chixiaSeq5 = true;
    }

    if(isActiveSequence(6) && isToggleActive(6) && !mergedBuffs.__chixiaSeq6) {
        mergedBuffs.basicAtk = (mergedBuffs.basicAtk ?? 0) + 25;
        console.log(mergedBuffs);
        mergedBuffs.__chixiaSeq6 = true;
    }

    return {mergedBuffs, combatState, skillMeta};
}

export const chixiaMultipliers = {
    outroSkill: [
        {
            name: "Leaping Flames",
            scaling: { atk: 1 }
        }
    ]
};