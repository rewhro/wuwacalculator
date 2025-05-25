export function applyCalcharoLogic({
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

    if (name === '"necessary means" damage') {
        skillMeta.skillType = 'intro';
    } else if (name.includes('hounds roar')) {
        skillMeta.skillType = 'basic';
    } else if (tab === 'resonanceLiberation') {
        if (name.includes('heavy')) {
            skillMeta.skillType = 'ultimate';
        } else if (name.includes('dodge')) {
            skillMeta.skillType = 'ultimate';
        }
    } else if (name === '"mercy" damage') {
        skillMeta.skillType = 'heavy';
    } else if (name === '"death messenger" damage') {
        skillMeta.skillType = 'ultimate';
    } else if (name === 'shadowy raid') {
        skillMeta.multiplier = (195.98+391.96)/100;
    }

    if (isToggleActiveLocal('inherent1') && !mergedBuffs.__calcharoInherent1) {
        mergedBuffs.resonanceLiberation = (mergedBuffs.resonanceLiberation ?? 0) + 10;
        mergedBuffs.__calcharoInherent1 = true;
    }

    if (isToggleActive(2) && isActiveSequence(2) && !mergedBuffs.__calcharoS2) {
        mergedBuffs.resonanceSkill = (mergedBuffs.resonanceSkill ?? 0) + 30;
        mergedBuffs.__calcharoS2 = true;
    }

    if (isToggleActive(3) && isActiveSequence(3) && !mergedBuffs.__calcharoS3) {
        mergedBuffs.electro = (mergedBuffs.electro ?? 0) + 25;
        mergedBuffs.__calcharoS3 = true;
    }

    if (isToggleActive(4) && isActiveSequence(4) && !mergedBuffs.__calcharoS4) {
        mergedBuffs.electro = (mergedBuffs.electro ?? 0) + 20;
        mergedBuffs.__calcharoS4 = true;
    }

    if (isActiveSequence(5) && skillMeta.skillType === 'intro') {
        skillMeta.multiplier *= 1.5;
    }

    if (name === 'the ultimatum: phantom damage') {
        skillMeta.visible = isActiveSequence(6);
        if (skillMeta.visible) {
            skillMeta.multiplier = 1;
            skillMeta.skillType = 'ultimate';
        }
    }

    return {mergedBuffs, combatState, skillMeta};
}

export const calcharoMultipliers = {
    outroSkill: [
        {
            name: 'Shadowy Raid',
            scaling: { atk: 1 }
        }
    ],
    resonanceLiberation: [
        {
            name: 'The Ultimatum: Phantom Damage',
            scaling: { atk: 1 }
        }
    ]
};
