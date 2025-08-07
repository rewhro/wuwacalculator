import {elementToAttribute} from "../../utils/attributeHelpers.js";

export function applyAugustaLogic({
                                   mergedBuffs,
                                   combatState,
                                   skillMeta,
                                   characterState,
                                   isActiveSequence = () => false,
                                      isToggleActive = () => false,
                                      characterLevel = 1,
                                      finalStats
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

    const name = skillMeta.name?.toLowerCase();
    const tab = skillMeta.tab ?? '';

    if (tab === 'forteCircuit') {
        skillMeta.skillType = 'skill';
    } else if (tab === 'resonanceLiberation') {
        skillMeta.skillType = 'heavy';
    }

    if (name.includes('glory\'s favor')) {
        skillMeta.visible = characterLevel >= 50;
    }

    const crown = characterState?.activeStates?.crownofWills;

    if (!mergedBuffs.__augustaCrownofWills) {
        const allowStacks = isActiveSequence(1);

        if (typeof crown === 'number' && allowStacks) {
            if (crown > 0) {
                mergedBuffs.electro = (mergedBuffs.electro ?? 0) + (15 * crown);
                mergedBuffs.__augustaCrownofWills = true;
            }
        } else if (crown === true) {
            mergedBuffs.electro = (mergedBuffs.electro ?? 0) + 15;
            mergedBuffs.__augustaCrownofWills = true;
        }
    }

    if (isActiveSequence(1) && !mergedBuffs.__augustaS1) {
        mergedBuffs.critDmg = (mergedBuffs.critDmg ?? 0) + (15 * crown);
        mergedBuffs.__augustaS1 = true;
    }

    const critRate = (mergedBuffs.critRate ?? 0) + 5;
    const excessCritRate = Math.max(0, critRate - 100);
    const bonusCritDmg = Math.min(100, excessCritRate * 2);
    if (isActiveSequence(2) && !mergedBuffs.__augustaS2) {
        mergedBuffs.critDmg = (mergedBuffs.critDmg ?? 0) + (20 * crown);
        mergedBuffs.critDmg = (mergedBuffs.critDmg ?? 0) + bonusCritDmg;
        mergedBuffs.__augustaS2 = true;
    }

    if (isActiveSequence(3)) {
        const affectedSkills = [
            'thunderoar: backstep',
            'thunderoar: spinslash',
            'thunderoar: uppercut',
            'undying sunlight: plunge',
            'sunborne',
            'everbright protector'
        ];

        const isAffected = affectedSkills.some(skill => name?.includes(skill));

        if (isAffected) {
            skillMeta.multiplier *= 1.25;
        }
    }

    if (isActiveSequence(4) && !mergedBuffs.__augustaS4 && isToggleActive(4)) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 20;
        mergedBuffs.__augustaS4 = true;
    }

    if (isActiveSequence(5) && name.includes('glory\'s favor')) {
        skillMeta.skillShieldBonus = (skillMeta.skillShieldBonus ?? 0) + 50;
    }

    if (isActiveSequence(6) && !mergedBuffs.__augustaS6) {
        mergedBuffs.electro = (mergedBuffs.electro ?? 0) + (5 * crown);
        mergedBuffs.__augustaS6 = true;
    }

    return {mergedBuffs, combatState, skillMeta};
}

export const augustaMultipliers = {
    forteCircuit: [
        {
            name: "Inherent Skill: Glory's Favor Shield",
            scaling: { atk: 1 },
            shielding: true,
            Param : [
                [
                    "350+2.5%",
                    "350+2.5%",
                    "350+2.5%",
                    "350+2.5%",
                    "350+2.5%",
                    "350+2.5%",
                    "350+2.5%",
                    "350+2.5%",
                    "350+2.5%",
                    "350+2.5%",
                    "350+2.5%",
                    "350+2.5%",
                    "350+2.5%",
                    "350+2.5%",
                    "350+2.5%",
                    "350+2.5%",
                    "350+2.5%",
                    "350+2.5%",
                    "350+2.5%",
                    "350+2.5%",
                ]
            ]
        }
    ]
};


export function augustaBuffsLogic({
                                   mergedBuffs, characterState
                               }) {
    const state = characterState?.activeStates ?? {};

    if (state.battlesong) {
        for (const elem of Object.values(elementToAttribute)) {
            mergedBuffs.elementDmgAmplify[elem] = (mergedBuffs.elementDmgAmplify[elem] ?? 0) + 15;
        }
    }

    if (state.ascentinSun) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 20;
    }

    return { mergedBuffs };
}