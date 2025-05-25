export function calculateDamage({
                                    finalStats,
                                    combatState,
                                    scaling,
                                    multiplier,
                                    element,
                                    skillType,
                                    characterLevel,
                                    mergedBuffs,
                                    amplify = 0,
                                    skillDmgBonus = 0,
                                    critDmgBonus = 0,
                                    critRateBonus = 0,
                                    skillDefIgnore = 0
                                }) {
    // Normalize skillType into array
    const skillTypes = Array.isArray(skillType) ? skillType : [skillType];

    // 1️⃣ Base stats
    const atk = finalStats.atk ?? 0;
    const hp = finalStats.hp ?? 0;
    const def = finalStats.def ?? 0;
    const energyRegen = finalStats.energyRegen ?? 0;

    // 2️⃣ Base ability damage
    const baseAbility = (atk * (scaling.atk ?? 0)) +
        (hp * (scaling.hp ?? 0)) +
        (def * (scaling.def ?? 0)) +
        (energyRegen * (scaling.energyRegen ?? 0));

    // 3️⃣ Flat damage additions
    const baseDmg = (baseAbility * multiplier) + (combatState.flatDmg ?? 0);

    // 4️⃣ Resistance multiplier
    const enemyResShred = mergedBuffs?.enemyResShred ?? 0;
    const enemyRes = (combatState.enemyRes ?? 0) - enemyResShred;

    let resMult = 1;
    if (enemyRes < 0) {
        resMult = 1 - (enemyRes / 200);
    } else if (enemyRes < 75) {
        resMult = 1 - (enemyRes / 100);
    } else {
        resMult = 1 / (1 + 5 * (enemyRes / 100));
    }

    // 5️⃣ Enemy defense multiplier
    const enemyLevel = combatState.enemyLevel ?? 1;
    const charLevel = characterLevel ?? 1;
    const enemyDefIgnore = (skillDefIgnore ?? 0) + (mergedBuffs?.enemyDefIgnore ?? 0);
    const enemyDefShred = mergedBuffs?.enemyDefShred ?? 0;
    const enemyDef = ((8 * enemyLevel) + 792) * (1 - (enemyDefIgnore + enemyDefShred) / 100);
    const defMult = (800 + 8 * charLevel) / (800 + 8 * charLevel + enemyDef);

    // 6️⃣ Reduction multipliers
    const dmgReductionTotal = 1 + ((mergedBuffs.dmgReduction ?? 0) + 0)/100;
    const elementReductionTotal = 1 + ((mergedBuffs.elementDmgReduction ?? 0) + 0)/100;

    // 7️⃣ Bonuses
    let skillTypeBonus = skillDmgBonus;
    for (const type of skillTypes) {
        skillTypeBonus += mergedBuffs?.[`${type}Atk`] ?? 0;
    }


    let elementBonus = (finalStats[`${element}DmgBonus`] ?? 0) + skillTypeBonus;


    let amplifyTotal = amplify + (mergedBuffs.elementDmgAmplify?.[element] ?? 0);
    for (const type of skillTypes) {
        amplifyTotal += mergedBuffs.damageTypeAmplify?.[type] ?? 0;

        if (type === 'outro') {
            amplifyTotal += mergedBuffs.outroAmplify ?? 0;
        }
        if (type === 'spectroFrazzle') {
            amplifyTotal += mergedBuffs.spectroFrazzleDmg ?? 0;
        }
        if (type === 'aeroErosion') {
            amplifyTotal += mergedBuffs.aeroErosionDmg ?? 0;
        }
    }


    const dmgBonus = 1 + elementBonus / 100;
    const dmgAmplify = 1 + amplifyTotal / 100;
    const special = 1 + 0; // Reserved for future use

    // 8️⃣ Final damage
    const normal = baseDmg * resMult * defMult * dmgReductionTotal * elementReductionTotal * dmgBonus * dmgAmplify * special;

    // 9️⃣ Crit damage
    const critRate = Math.min(((finalStats.critRate ?? 0) / 100) + (critRateBonus / 100), 1);
    const critDmg = ((finalStats.critDmg ?? 0) / 100) + (critDmgBonus / 100);
    const crit = normal * critDmg;

    // 🔟 Average damage
    const avg = critRate >= 1
        ? crit
        : (crit * critRate) + (normal * (1 - critRate));

    return {
        normal: Math.floor(normal),
        crit: Math.floor(crit),
        avg: Math.floor(avg)
    };
}