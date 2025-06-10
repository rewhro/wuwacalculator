import {getCharacterOverride} from "../data/character-behaviour/index.js";
import {getWeaponOverride} from "../data/weapon-behaviour/index.js";
import {calculateSupportEffect} from "./supportCalculator.js";
import {calculateDamage} from "./damageCalculator.js";
import { elementToAttribute } from './attributeHelpers';

export function computeSkillDamage({
                                       entry,                // { label, detail, tab }
                                       levelData,            // Optional full level object from skill tree
                                       activeCharacter,
                                       characterRuntimeStates,
                                       finalStats,
                                       combatState,
                                       mergedBuffs,
                                       sliderValues,
                                       characterLevel,
                                       getSkillData = () => null // Optional override for character logic
                                   }) {
    const charId = activeCharacter?.Id ?? activeCharacter?.id ?? activeCharacter?.link;
    const element = elementToAttribute[activeCharacter?.attribute] ?? '';

    const characterState = {
        activeStates: characterRuntimeStates?.[charId]?.activeStates ?? {},
        toggles: characterRuntimeStates?.[charId]?.sequenceToggles ?? {}
    };

    const isActiveSequence = (n) => sliderValues?.sequence >= n;
    const isToggleActive = (id) => characterState.toggles?.[id] || characterState.activeStates?.[id];

    const label = entry.label;
    let skillType = entry.detail?.toLowerCase?.() || '';

    if (!['basic', 'heavy', 'skill', 'ultimate', 'intro', 'outro'].includes(skillType)) {
        // Fallback inference based on tab or label
        const label = entry.label?.toLowerCase?.() ?? '';
        if (label.includes('heavy attack')) {
            skillType = 'heavy';
        } else if (entry.tab === 'resonanceSkill') {
            skillType = 'skill';
        } else if (entry.tab === 'resonanceLiberation') {
            skillType = 'ultimate';
        } else if (entry.tab === 'normalAttack') {
            skillType = 'basic';
        } else if (entry.tab === 'introSkill') {
            skillType = 'intro';
        } else if (entry.tab === 'outroSkill') {
            skillType = 'outro';
        } else {
            skillType = 'basic'; // Safe fallback
        }
    }
    const tab = entry.tab;

    // === Get raw multiplier from levelData ===
    let rawMultiplier = '0%';
    if (levelData?.Param) {
        rawMultiplier = typeof levelData.Param[0] === 'string'
            ? levelData.Param[0]
            : levelData.Param?.[0]?.[sliderValues?.[tab] - 1] ?? '0%';
    }

    const { flat, percent } = extractFlatAndPercent(rawMultiplier);
    const parsedMultiplier = parseCompoundMultiplier(rawMultiplier);

    let skillMeta = {
        name: label,
        skillType,
        multiplier: parsedMultiplier || 1,
        amplify: 0,
        tab,
        visible: true,
        tags: [
            ...(levelData?.healing ? ['healing'] : []),
            ...(levelData?.shielding ? ['shielding'] : [])
        ]
    };

    let localMergedBuffs = structuredClone(mergedBuffs);

    // === Character override ===
    const override = getCharacterOverride(charId);
    if (override) {
        const result = override({
            mergedBuffs: localMergedBuffs,
            combatState,
            skillMeta,
            characterState,
            isActiveSequence,
            isToggleActive,
            baseCharacterState: activeCharacter,
            sliderValues,
            getSkillData,
            finalStats,
            element,
            characterLevel
        });

        skillMeta = result.skillMeta ?? skillMeta;
        localMergedBuffs = result.mergedBuffs ?? localMergedBuffs;
    }

    // === Weapon override ===
    const weaponLogic = getWeaponOverride(combatState?.weaponId);
    if (typeof weaponLogic?.applyWeaponBuffLogic === 'function') {
        const currentParamValues = combatState.weaponParam?.map(
            p => p?.[Math.min(Math.max((combatState.weaponRank ?? 1) - 1, 0), 4)]
        ) ?? [];

        const result = weaponLogic.applyWeaponBuffLogic({
            mergedBuffs: localMergedBuffs,
            combatState,
            skillMeta,
            characterState,
            isToggleActive,
            finalStats,
            element,
            currentParamValues,
            baseCharacterState: activeCharacter
        });

        skillMeta = result?.skillMeta ?? skillMeta;
        localMergedBuffs = result?.mergedBuffs ?? localMergedBuffs;
    }

    // === Scaling source ===
    const scaling = skillMeta.scaling ?? (
        characterRuntimeStates?.[charId]?.CalculationData?.skillScalingRatios?.[tab] ?? {
            atk: 1, hp: 0, def: 0, energyRegen: 0
        }
    );

    // === Handle healing/shielding skills ===
    const tag = skillMeta.tags?.[0];
    const isSupportSkill = tag === 'healing' || tag === 'shielding';

    if (isSupportSkill) {
        const avg = skillMeta.flatOverride ?? calculateSupportEffect({
            finalStats,
            scaling,
            multiplier: skillMeta.multiplier,
            type: tag,
            skillHealingBonus: skillMeta.skillHealingBonus ?? 0,
            skillShieldBonus: skillMeta.skillShieldBonus ?? 0,
            flat
        });

        return { normal: 0, crit: 0, avg, skillMeta};
    }

    // === Final damage ===
    let { normal, crit, avg } = calculateDamage({
        finalStats,
        combatState,
        multiplier: skillMeta.multiplier,
        amplify: skillMeta.amplify,
        scaling,
        element,
        skillType: skillMeta.skillType,
        characterLevel,
        mergedBuffs: localMergedBuffs,
        skillDmgBonus: skillMeta.skillDmgBonus ?? 0,
        critDmgBonus: skillMeta.critDmgBonus ?? 0,
        critRateBonus: skillMeta.critRateBonus ?? 0,
        skillDefIgnore: skillMeta.skillDefIgnore ?? 0
    });

    let subHits = [];

    const rawMultiplierString = typeof levelData?.Param?.[0] === 'string'
        ? levelData.Param[0]
        : levelData.Param?.[0]?.[sliderValues?.[tab] - 1];

    const parts = parseMultiplierParts(rawMultiplierString);

    const rawTotalMultiplier = parts.reduce((sum, p) => {
        const val = parseFloat(p.value) / 100;
        return sum + val * p.count;
    }, 0);

    const overrideMultiplier = skillMeta.multiplier ?? rawTotalMultiplier;
    const multiplierRatio = rawTotalMultiplier > 0 ? (overrideMultiplier / rawTotalMultiplier) : 1;

    if (parts.length > 1 || (parts.length === 1 && parts[0].count > 1)) {
        subHits = parts.map((part) => {
            const baseMultiplier = parseFloat(part.value) / 100;
            const adjustedMultiplier = baseMultiplier * multiplierRatio;

            const oneHitMeta = structuredClone(skillMeta);
            oneHitMeta.multiplier = adjustedMultiplier;

            const { normal, crit, avg } = calculateDamage({
                finalStats,
                combatState,
                multiplier: oneHitMeta.multiplier,
                amplify: oneHitMeta.amplify,
                scaling,
                element,
                skillType: oneHitMeta.skillType,
                characterLevel,
                mergedBuffs: localMergedBuffs,
                skillDmgBonus: oneHitMeta.skillDmgBonus ?? 0,
                critDmgBonus: oneHitMeta.critDmgBonus ?? 0,
                critRateBonus: oneHitMeta.critRateBonus ?? 0,
                skillDefIgnore: oneHitMeta.skillDefIgnore ?? 0
            });

            return {
                label: part.count > 1 ? `${part.count} Hits` : '',
                count: part.count,
                normal,
                crit,
                avg
            };
        });

        // Main skill = total of all sub-hits (factoring in their count)
        normal = subHits.reduce((sum, hit, i) => sum + hit.normal * parts[i].count, 0);
        crit = subHits.reduce((sum, hit, i) => sum + hit.crit * parts[i].count, 0);
        avg = subHits.reduce((sum, hit, i) => sum + hit.avg * parts[i].count, 0);
    }

    return { normal, crit, avg, skillMeta, subHits };
}

export function getSkillData(char, tab) {
    if (!char?.raw?.SkillTrees) return null;
    const tree = Object.values(char.raw.SkillTrees).find(tree =>
        tree.Skill?.Type?.toLowerCase?.().replace(/\s/g, '') === tab.toLowerCase()
    );
    return tree?.Skill ?? null;
}

export function parseCompoundMultiplier(formula) {
    if (!formula) return 0;

    const parts = formula.match(/\d+(\.\d+)?%(\*\d+)?/g);
    if (!parts) return 0;

    return parts.reduce((sum, part) => {
        const [percent, timesStr] = part.split('*');
        const value = parseFloat(percent.replace('%', '')) / 100;
        const times = timesStr ? parseInt(timesStr, 10) : 1;
        return sum + value * times;
    }, 0);
}

export function parseFlatComponent(formula) {
    //console.log(formula);
    if (!formula) return 0;

    // Extract all numeric values (both percent and flat)
    const allNumbers = formula.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];

    // Get percent contribution using existing function
    const percentMultiplier = parseCompoundMultiplier(formula) * 100;

    // Total minus percentage portion = flat component
    const total = allNumbers.reduce((sum, n) => sum + n, 0);
    return total - percentMultiplier;
}

export function extractFlatAndPercent(str) {
    const flatMatch = str.match(/^(\d+(\.\d+)?)/);
    const percentMatch = str.match(/(\d+(\.\d+)?)%/);
    const statMatch = str.match(/%[\s]*([a-zA-Z\s]+)/);

    return {
        flat: flatMatch ? parseFloat(flatMatch[1]) : 0,
        percent: percentMatch ? parseFloat(percentMatch[1]) / 100 : 0,
        stat: statMatch ? statMatch[1].trim().toLowerCase() : null
    };
}

function parseMultiplierParts(multiplierString) {
    if (typeof multiplierString !== 'string') return [];

    const parts = multiplierString.match(/[\d.]+%\s*(\*\s*\d+)?/g);
    if (!parts) return [];

    return parts.map(part => {
        const match = part.trim().match(/^([\d.]+%)\s*(?:\*\s*(\d+))?$/);
        if (!match) return null;
        const [, value, repeat] = match;
        return {
            value,
            count: repeat ? parseInt(repeat, 10) : 1
        };
    }).filter(Boolean);
}