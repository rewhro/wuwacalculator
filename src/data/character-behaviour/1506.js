// src/character-behaviors/1506.jsx

export function applyPheobeLogic({
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

    const state =
        characterState?.activeStates?.absolution
            ? 'Absolution'
            : characterState?.activeStates?.confession
                ? 'Confession'
                : null;

    // === Damage Type Reassignments ===
    const basicSkills = [
        "Chamuel's Star: Stage 1 DMG",
        "Chamuel's Star: Stage 2 DMG",
        "Chamuel's Star: Stage 3 DMG",
        "Ring of Mirrors: Refracted Holy Light DMG"
    ];

    const heavySkills = ["Starflash", "Absolution Litany"];
    const skillSkills = ["Utter Confession"];

    if (basicSkills.includes(skillMeta.name)) {
        skillMeta.skillType = 'basic';
    } else if (heavySkills.some(name => skillMeta.name?.includes(name))) {
        skillMeta.skillType = 'heavy';
    } else if (skillSkills.some(name => skillMeta.name?.includes(name))) {
        skillMeta.skillType = 'skill';
    }

    console.log(`[PheobeLogic] Assigned skill type: ${skillMeta.name} → ${skillMeta.skillType}`);

    // === Flat Multiplier Boosts ===
    if (state === 'Absolution') {
        if (skillMeta.name.includes('Starflash') && combatState.spectroFrazzle > 0)
            skillMeta.amplify = 256;

        if (skillMeta.skillType === 'ultimate') {
            const scale = isActiveSequence(1) ? 5.80 : 3.55;
            skillMeta.multiplier *= scale;
        }

        if (skillMeta.skillType === 'outro' && combatState.spectroFrazzle > 0) {
            if (!mergedBuffs.__pheobeOutroApplied && isActiveSequence(2)) {
                mergedBuffs.outroAmplify = (mergedBuffs.outroAmplify ?? 0) + 120;
                mergedBuffs.__pheobeOutroApplied = true;
            }
            skillMeta.multiplier *= (1 + 2.55);
        }



        if (isActiveSequence(3) && skillMeta.name?.includes('Starflash')) {
            skillMeta.multiplier *= (1 + 0.91);
        }
    } else if (state === 'Confession') {
        if (skillMeta.skillType === 'ultimate') {
            skillMeta.multiplier *= (1 + 0.90);
        }

        if (isActiveSequence(3) && skillMeta.name?.includes('Starflash')) {
            skillMeta.multiplier *= (1 + 2.49);
        }
    }

    // === Passive Buffs ===
    if ((state === 'Absolution' || state === 'Confession') && !mergedBuffs.__pheobeSpectro1) {
        mergedBuffs.spectro += 12;
        mergedBuffs.__pheobeSpectro1 = true;
    }

    if (isToggleActive(4) && isActiveSequence(4)) {
        if (!mergedBuffs.__pheobeResShred) {
            mergedBuffs.enemyResShred += 10;
            mergedBuffs.__pheobeResShred = true;
        }
    } else {
        mergedBuffs.__pheobeResShred = false;
    }

    if (isToggleActive(5) && isActiveSequence(5)) {
        if (!mergedBuffs.__pheobeSpectro2) {
            mergedBuffs.spectro += 12;
            mergedBuffs.__pheobeSpectro2 = true;
        }
    } else {
        mergedBuffs.__pheobeSpectro2 = false;
    }

    if (isToggleActive(6) && isActiveSequence(6)) {
        if (!mergedBuffs.__pheobeAtkBuff) {
            mergedBuffs.atkPercent += 10;
            mergedBuffs.__pheobeAtkBuff = true;
        }
    } else {
        mergedBuffs.__pheobeAtkBuff = false;
    }

    return { mergedBuffs, combatState, skillMeta };
}

export const pheobeMultipliers = {
    outroSkill: [
        {
            name: "Attentive Heart",
            multiplier: "528.41%",
            scaling: { atk: 1 }
        }
    ]
};