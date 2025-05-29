export function applyWeaponBuffLogic({ mergedBuffs, characterState, activeCharacter }) {
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

    // Example logic for each weapon
    const buffs = {
        staticMist: () => {
            const rank = state['staticMist_rank'] ?? 0;
            const values = [0, 10, 12.5, 15, 17.5, 20];
            mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + values[rank];
        },
        stellarSymphony: () => {
            const rank = state['stellarSymphony_rank'] ?? 0;
            const values = [0, 14, 17.5, 21, 24.5, 28];
            mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + values[rank];
        },
        luminousHymn: () => {
            const rank = state['luminousHymn_rank'] ?? 0;
            const values = [0, 30, 37.5, 45, 52.5, 60];
            mergedBuffs.damageTypeAmplify.spectroFrazzle = (mergedBuffs.damageTypeAmplify.spectroFrazzle ?? 0) + values[rank];
        },
        bloodpactsPledge: () => {
            const rank = state['bloodpactsPledge_rank'] ?? 0;
            const values = [0, 10, 14, 18, 22, 26];
            mergedBuffs.elementDmgAmplify.aero = (mergedBuffs.elementDmgAmplify.aero ?? 0) + values[rank];
        },
        woodlandAria: () => {
            const rank = state['woodlandAria_rank'] ?? 0;
            const values = [0, 10, 11.5, 13, 14.5, 16];
            if (element === 'aero') {
                mergedBuffs.enemyResShred = (mergedBuffs.enemyResShred ?? 0) + values[rank];
            }
        },
        wildfireMark: () => {
            const rank = state['wildfireMark_rank'] ?? 0;
            const values = [0, 24, 30, 36, 42, 48];
            mergedBuffs[element] = (mergedBuffs[element] ?? 0) + values[rank];
        }
    };

    Object.keys(buffs).forEach(key => {
        if ((state[`${key}_rank`] ?? 0) > 0) {
            buffs[key]();
        }
    });

    return mergedBuffs;
}