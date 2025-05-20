export function applySanhuaLogic({
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

    const name = skillMeta.name.toLowerCase();

    const isBurstAttack = [
        'glacier burst damage',
        'ice prism burst damage',
        'ice thorn burst damage'
    ].some(n => name.includes(n));

    const isDetonate = name.includes('detonate damage');

    // === Skill Type Reassignment ===
    if (isBurstAttack) {
        skillMeta.skillType = 'skill';
    } else if (isDetonate) {
        skillMeta.skillType = 'heavy';
    }

    // === Inherent Skills ===

    // Inherent 1: +20% Skill DMG (only if "Skill DMG" and under resonanceSkill tab)
    if (
        isToggleActive('inherent1') &&
        skillMeta.tab === 'resonanceSkill' &&
        name === 'skill dmg'
    ) {
        skillMeta.skillDmgBonus = (skillMeta.skillDmgBonus ?? 0) + 20;
    }

    // Inherent 2: +20% to specific burst attacks
    if (isToggleActive('inherent2') && isBurstAttack) {
        skillMeta.skillDmgBonus = (skillMeta.skillDmgBonus ?? 0) + 20;
    }

    // === Passive Buffs (sequence toggles) ===

    // Sequence 1: +15% Crit Rate
    if (isToggleActive(1) && isActiveSequence(1)) {
        if (!mergedBuffs.__sanhuaSeq1) {
            mergedBuffs.critRate = (mergedBuffs.critRate ?? 0) + 15;
            mergedBuffs.__sanhuaSeq1 = true;
        }
    } else {
        mergedBuffs.__sanhuaSeq1 = false;
    }

    // Sequence 3: +35% Glacio
    if (isToggleActive(3) && isActiveSequence(3)) {
        if (!mergedBuffs.__sanhuaSeq3) {
            mergedBuffs.glacio = (mergedBuffs.glacio ?? 0) + 35;
            mergedBuffs.__sanhuaSeq3 = true;
        }
    } else {
        mergedBuffs.__sanhuaSeq3 = false;
    }

    // Sequence 6: +20% ATK
    const seq6Value = characterState?.toggles?.['6_value'] ?? 0;
    if (isActiveSequence(6) && seq6Value > 0) {
        if (!mergedBuffs.__sanhuaSeq6) {
            mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + (seq6Value * 10);
            mergedBuffs.__sanhuaSeq6 = true;
        }
    } else {
        mergedBuffs.__sanhuaSeq6 = false;
    }

    // === Per-skill Buffs (dynamic) ===

    // Sequence 4: +120% skill dmg bonus to Detonate Damage
    if (isToggleActive(4) && isDetonate) {
        skillMeta.skillDmgBonus = (skillMeta.skillDmgBonus ?? 0) + 120;
    }

    // Sequence 5: Passive +100% Crit DMG for burst attacks
    if (isActiveSequence(5) && isToggleActive(5) && isBurstAttack) {
        skillMeta.critDmgBonus = (skillMeta.critDmgBonus ?? 0) + 100;
    }

    return { mergedBuffs, combatState, skillMeta };
}