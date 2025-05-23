export function applyBaizhiLogic({
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
    const tab = skillMeta.tab ?? '';

    if (tab === 'forteCircuit' && name.includes("stimulus feedback")) {
        skillMeta.multiplier = 0.25/100;
    } else if (tab === 'outroSkill' && name.includes("lightning manipulation hot")) {
        skillMeta.multiplier = 1.54/100;
    }
        // ✅ Inherent 1: +15% ATK, only once
    if (characterState?.activeStates?.inherent1 && !mergedBuffs.__baizhiInherentApplied) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 15;
        mergedBuffs.__baizhiInherentApplied = true;
    }

    // === Sequence 2: +15% healing bonus and glacio DMG
    if (isToggleActive(2) && isActiveSequence(2)) {
        if (!mergedBuffs.__baizhiSeq2) {
            mergedBuffs.healingBonus = (mergedBuffs.healingBonus ?? 0) + 15;
            mergedBuffs.glacio = (mergedBuffs.glacio ?? 0) + 15;
            mergedBuffs.__baizhiSeq2 = true;
        }
    } else {
        mergedBuffs.__baizhiSeq2 = false;
    }

    // === Sequence 3: +12% HP
    if (isToggleActive(3) && isActiveSequence(3)) {
        if (!mergedBuffs.__baizhiSeq3) {
            mergedBuffs.hpPercent = (mergedBuffs.hpPercent ?? 0) + 12;
            mergedBuffs.__baizhiSeq3 = true;
        }
    } else {
        mergedBuffs.__baizhiSeq3 = false;
    }

    // === Sequence 4 (Only apply once per skill)
    if (isToggleActive(4) && isActiveSequence(4)) {
        // Buff: "Remnant Entities Healing" ×1.20 multiplier
        if (name === 'remnant entities healing' && !skillMeta.__baizhiS4HealingApplied) {
            skillMeta.multiplier = (skillMeta.multiplier ?? 0) * 1.20;
            skillMeta.__baizhiS4HealingApplied = true;
        }

        // Buff: "Remnant Entities Damage" +0.012 multiplier
        if (name === 'remnant entities damage' && !skillMeta.__baizhiS4DamageApplied) {
            skillMeta.multiplier = (skillMeta.multiplier ?? 0) + 0.012;
            skillMeta.__baizhiS4DamageApplied = true;
        }
    }

    // === Sequence 6: +12% glacio DMG
    if (isToggleActive(6) && isActiveSequence(6)) {
        if (!mergedBuffs.__baizhiSeq6) {
            mergedBuffs.glacio = (mergedBuffs.glacio ?? 0) + 12;
            mergedBuffs.__baizhiSeq6 = true;
        }
    } else {
        mergedBuffs.__baizhiSeq6 = false;
    }

    return { mergedBuffs, combatState, skillMeta };
}

// Manual healing skill declarations only
export const baizhiMultipliers = {
    resonanceSkill: [
        {
            name: "Healing",
            scaling: { hp: 1 },
            healing: true
        },
        {
            name: "Skill DMG",
            scaling: { hp: 1 }
        }
    ],
    resonanceLiberation: [
        {
            name: "Remnant Entities Damage",
            scaling: { hp: 1 }
        },
        {
            name: "Remnant Entities Healing",
            scaling: { hp: 1 },
            healing: true
        },
        {
            name: "Momentary Union Healing",
            scaling: { hp: 1 },
            healing: true
        }
    ],
    forteCircuit: [
        {
            name: "Concentration Healing",
            scaling: { hp: 1 },
            healing: true
        },
        {
            name: "Stimulus Feedback",
            scaling: { hp: 1 },
            healing: true
        }
    ],
    outroSkill: [
        {
            name: "Lightning Manipulation HoT",
            scaling: { hp: 1 },
            healing: true
        }
    ],
    introSkill: [
        {
            name: "Overflowing Frost Healing",
            scaling: { hp: 1 },
            healing: true
        }
    ]
};
