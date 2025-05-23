import { calculateSupportEffect} from "../../utils/supportCalculator.js";
import { extractFlatAndPercent} from "../../components/DamageSection.jsx";

export function applyYouhuogic({
                                   mergedBuffs,
                                   combatState,
                                   skillMeta,
                                   characterState,
                                   isActiveSequence = () => false,
                                   isToggleActive = () => false,
                                   baseCharacterState,
                                   sliderValues,
                                   getSkillData,
                                    finalStats
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

    if (tab === 'forteCircuit' && name.includes("poetic essence")) {
        skillMeta.skillType = 'skill';
    }


    // inherent 1
    if (tab === 'resonanceSkill' && name.includes("treasured piece healing")) {
        const scrollNode = Object.values(getSkillData(baseCharacterState, 'resonanceSkill')?.Level ?? {})
            .find(level => level?.Name?.toLowerCase?.() === 'scroll divination healing');

        const paramArray = scrollNode?.Param?.[0];
        const scrollRaw = paramArray?.[sliderValues?.resonanceSkill - 1] ?? paramArray?.[0];

        // Extract both flat and percent from string like "1767+81.90% ATK"
        const flatAndPercent = extractFlatAndPercent(scrollRaw ?? '');

        const scaling = scrollNode?.scaling ?? { atk: 1 };

        const scrollHeal = calculateSupportEffect({
            finalStats,
            scaling,
            multiplier: flatAndPercent.percent,
            flat: flatAndPercent.flat,
            type: 'healing'
        });

        skillMeta.scaling = { atk: 0 };        // prevent default ATK scaling
        skillMeta.multiplier = 0;              // block % scaling
        skillMeta.flatOverride = Math.floor(scrollHeal * 0.3);  // 30% of original
        skillMeta.tags = ['healing'];
        skillMeta.visible = isToggleActiveLocal('inherent1');

        console.log('🧮 ScrollHeal:', scrollHeal, '→ Treasured Piece Heal:', skillMeta.flatOverride);
    }

    // inherent 2
    if (isToggleActiveLocal('inherent2')) {
        if (!mergedBuffs.__youhuInherent1) {
            mergedBuffs.glacio += 15;
            mergedBuffs.__youhuInherent1 = true;
        }
    } else {
        mergedBuffs.__youhuInherent1 = false;
    }


    if (name === 'poetic essence skill dmg') {
        let bonus = 0;

        const hasAntithesis = isToggleActive('antithesis');
        const hasTriplet = isToggleActive('triplet');
        const seq2Active = isActiveSequence(2);

        if (hasAntithesis) {
            bonus += seq2Active ? 70 * 2 : 70;
        }

        if (hasTriplet) {
            bonus += seq2Active ? 175 * 2 : 175;
        }

        skillMeta.skillDmgBonus = (skillMeta.skillDmgBonus ?? 0) + bonus;
    }

    if (isActiveSequence(3)) {
        if (!mergedBuffs.__youhuSeq3) {
            mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + 20;
            mergedBuffs.__youhuSeq3 = true;
        }
    } else {
        mergedBuffs.__youhuSeq3 = false;
    }

    if (isToggleActive(5) && isActiveSequence(5)) {
        if (!mergedBuffs.__youhuSeq5) {
            mergedBuffs.critRate = (mergedBuffs.critRate ?? 0) + 15;
            mergedBuffs.__youhuSeq5 = true;
        }
    } else {
        mergedBuffs.__youhuSeq5 = false;
    }

    const seq6Value = characterState?.toggles?.['6_value'] ?? 0;
    if (isActiveSequence(6) && seq6Value > 0) {
        if (!mergedBuffs.__seq6) {
            mergedBuffs.critDmg = (mergedBuffs.critDmg ?? 0) + (seq6Value * 15);
            mergedBuffs.__seq6 = true;
        }
    } else {
        mergedBuffs.__seq6 = false;
    }

    return { mergedBuffs, combatState, skillMeta };
}

export const youhuMultipliers = {
    resonanceSkill: [
        {
            name: "Scroll Divination Healing",
            scaling: { atk: 1 },
            healing: true
        },
        {
            name: "Treasured Piece Healing",
            multiplier: "0%",
            scaling: { atk: 1 },
            healing: true
        }
    ],
    forteCircuit: [
        {
            name: "Poetic Essence Healing",
            scaling: { atk: 1 },
            healing: true
        },
        {
            name: "Double Pun Bonus Healing",
            scaling: { atk: 1 },
            healing: true
        }
    ]
};
