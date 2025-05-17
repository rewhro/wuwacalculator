export function getUnifiedStatPool(buffSources) {
    const merged = {
        atkFlat: 0,
        hpFlat: 0,
        defFlat: 0,
        atkPercent: 0,
        hpPercent: 0,
        defPercent: 0,
        critRate: 0,
        critDmg: 0,
        energyRegen: 0,
        healingBonus: 0,
        basicAtk: 0,
        heavyAtk: 0,
        resonanceSkill: 0,
        resonanceLiberation: 0,
        aero: 0,
        glacio: 0,
        spectro: 0,
        fusion: 0,
        electro: 0,
        havoc: 0,
        coordinated: 0,
        elementBonus: 0,
        enemyResShred: 0,
        enemyDefShred: 0,
        enemyDefIgnore: 0,
        flatDmg: 0,
        dmgReduction: 0,
        elementDmgReduction: 0,
        damageTypeAmplify: {},
        elementDmgAmplify: {}
    };

    const ELEMENT_KEYS = ['aero', 'glacio', 'spectro', 'fusion', 'electro', 'havoc'];

    for (const source of buffSources) {
        for (const [key, rawVal] of Object.entries(source ?? {})) {
            const val = Number(rawVal ?? 0);

            if (key === 'damageTypeAmplify') {
                for (const [typeKey, typeVal] of Object.entries(rawVal ?? {})) {
                    merged.damageTypeAmplify[typeKey] = (merged.damageTypeAmplify[typeKey] ?? 0) + Number(typeVal ?? 0);
                }
            } else if (key === 'elementDmgAmplify') {
                for (const [elKey, elVal] of Object.entries(rawVal ?? {})) {
                    merged.elementDmgAmplify[elKey] = (merged.elementDmgAmplify[elKey] ?? 0) + Number(elVal ?? 0);
                }
            } else if (ELEMENT_KEYS.includes(key)) {
                merged[key] += val;
                merged.elementDmgAmplify[key] = (merged.elementDmgAmplify[key] ?? 0) + val;
            } else if (merged[key] !== undefined) {
                // 🟢 This keeps basicAtk/heavyAtk/etc. as flat bonuses, not misclassified
                merged[key] += val;
            }
        }
    }

    return merged;
}