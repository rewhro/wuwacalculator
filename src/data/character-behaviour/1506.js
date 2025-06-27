// src/character-behaviors/1506.jsx

import React from "react";

export function applyPheobeLogic({
                                             mergedBuffs,
                                             combatState,
                                             skillMeta,
                                             characterState,
                                             isActiveSequence = () => false,
                                             isToggleActive = () => false,
    characterLevel = 1,
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

    const state =
        characterState?.activeStates?.absolution
            ? 'Absolution'
            : characterState?.activeStates?.confession
                ? 'Confession'
                : null;

    if (state !== 'Confession') {
        mergedBuffs.__pheobeConfessionResShred = false;
    }

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

    if (skillMeta.tab === 'outroSkill') {
        skillMeta.multiplier = 528.41/100;
    }

    // === Flat Multiplier Boosts ===
    if (state === 'Absolution') {
        if (skillMeta.name.includes('Starflash') && combatState.spectroFrazzle > 0)
            skillMeta.amplify = 256;

        if (skillMeta.skillType === 'ultimate') {
            const scale = isActiveSequence(1) ? 5.80 : 3.55;
            skillMeta.multiplier *= scale;
        }

        if (tab === 'outroSkill' && combatState.spectroFrazzle > 0) {
            if (!mergedBuffs.__pheobeOutroApplied && isActiveSequence(2)) {
                mergedBuffs.damageTypeAmplify.outro = (mergedBuffs.damageTypeAmplify.outro ?? 0) + 120;
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

        if (!mergedBuffs.__attentive && characterState?.activeStates?.attentive) {
            mergedBuffs.enemyResShred += 10;
            mergedBuffs.damageTypeAmplify.spectroFrazzle = (mergedBuffs.damageTypeAmplify.spectroFrazzle ?? 0) +  100;
            mergedBuffs.__attentive = true;
        }

        if (isActiveSequence(3) && skillMeta.name?.includes('Starflash')) {
            skillMeta.multiplier *= (1 + 2.49);
        }
    }

    if (characterState?.activeStates?.attentive && !mergedBuffs.__attentive) {
        mergedBuffs.damageTypeAmplify.spectroFrazzle = (mergedBuffs.damageTypeAmplify.spectroFrazzle ?? 0) + 100;
        mergedBuffs.__attentive = true;
    }

    // === Passive Buffs ===
    if ((state === 'Absolution' || state === 'Confession') && !mergedBuffs.__pheobeSpectro1 && characterLevel >= 70) {
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
            scaling: { atk: 1 }
        }
    ]
};

export function pheobeBuffsLogic({
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

    if (state.attentive) {
        if (element === 'spectro') {
            mergedBuffs.enemyResShred = (mergedBuffs.enemyResShred ?? 0) + 10;
        }
        mergedBuffs.damageTypeAmplify.spectroFrazzle = (mergedBuffs.damageTypeAmplify.spectroFrazzle ?? 0) + 100;
    }

    if (state.boatAdrift) {
        mergedBuffs.damageTypeAmplify.spectroFrazzle = (mergedBuffs.damageTypeAmplify.spectroFrazzle ?? 0) + 120;
    }

    return { mergedBuffs };
}