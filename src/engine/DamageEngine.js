// ✅ FINAL bulletproof DamageEngine.js

import { useState, useEffect } from 'react';

// ✅ Safe fallback Wasm loader
export function useWasmDamageCalculator() {
    const [wasmExports, setWasmExports] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadWasm = async () => {
            try {
                const response = await fetch('/damageCalculator.wasm');
                const buffer = await response.arrayBuffer();
                const wasm = await WebAssembly.instantiate(buffer);

                if (isMounted) {
                    setWasmExports(wasm.instance.exports);
                    console.log('✅ Damage engine loaded');
                }
            } catch (err) {
                console.error('❌ Failed to load damageCalculator.wasm:', err);
            }
        };

        loadWasm();
        return () => { isMounted = false; };
    }, []);

    const calculateDamage = (
        atk, multiplier,
        flatDmg, flatBonus,
        enemyRes, resShred,
        characterLevel, enemyLevel, defIgnore, defShred,
        dmgRedBase, dmgRedAdd,
        elemRedBase, elemRedAdd,
        elemBonus, bonusAdd,
        elemAmplify, amplifyElem,
        specialBase, specialAdd
    ) => {
        return wasmExports?.calculate_damage
            ? wasmExports.calculate_damage(
                atk, multiplier,
                flatDmg, flatBonus,
                enemyRes, resShred,
                characterLevel, enemyLevel, defIgnore, defShred,
                dmgRedBase, dmgRedAdd,
                elemRedBase, elemRedAdd,
                elemBonus, bonusAdd,
                elemAmplify, amplifyElem,
                specialBase, specialAdd
            )
            : 0;
    };

    return {
        loaded: !!wasmExports,
        calculateDamage
    };
}

// ✅ Clean inputs builder
export function buildDamageInputs({
                                      atk, multiplier,
                                      flatDmg = 0, flatBonus = 0,
                                      enemyRes = 0, resShred = 0,
                                      characterLevel = 1, enemyLevel = 1,
                                      defIgnore = 0, defShred = 0,
                                      dmgRedBase = 0, dmgRedAdd = 0,
                                      elemRedBase = 0, elemRedAdd = 0,
                                      elemBonus = 0, bonusAdd = 0,
                                      elemAmplify = 0, amplifyElem = 0,
                                      specialBase = 0, specialAdd = 0
                                  }) {
    return [
        atk, multiplier,
        flatDmg, flatBonus,
        enemyRes, resShred,
        characterLevel, enemyLevel, defIgnore, defShred,
        dmgRedBase, dmgRedAdd,
        elemRedBase, elemRedAdd,
        elemBonus, bonusAdd,
        elemAmplify, amplifyElem,
        specialBase, specialAdd
    ];
}
