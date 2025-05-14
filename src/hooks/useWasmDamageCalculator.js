import { useState, useEffect } from 'react';

export default function useWasmDamageCalculator() {
    const [wasmExports, setWasmExports] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadWasm = async () => {
            try {
                const wasm = await WebAssembly.instantiateStreaming(
                    fetch('/damageCalculator.wasm')
                );
                if (isMounted) {
                    setWasmExports(wasm.instance.exports);
                }
            } catch (err) {
                console.error('Failed to load damageCalculator.wasm:', err);
            }
        };

        loadWasm();

        return () => {
            isMounted = false;
        };
    }, []);

    const calculateDamage = (
        stat, multiplier,
        flatDmg, flatBonus,
        enemyRes, resShred,
        characterLevel, enemyLevel, defIgnore, defShred,
        dmgReductionBase, dmgReductionAdditional,
        elementReductionBase, elementReductionAdditional,
        elementDmgBonus, dmgBonusAdditional,
        elementAmplify, amplifyElement,
        specialBase, specialAdditional
    ) => {
        return wasmExports?.calculate_damage
            ? wasmExports.calculate_damage(
                stat, multiplier,
                flatDmg, flatBonus,
                enemyRes, resShred,
                characterLevel, enemyLevel, defIgnore, defShred,
                dmgReductionBase, dmgReductionAdditional,
                elementReductionBase, elementReductionAdditional,
                elementDmgBonus, dmgBonusAdditional,
                elementAmplify, amplifyElement,
                specialBase, specialAdditional
            )
            : 0;
    };

    return {
        loaded: !!wasmExports,
        calculateDamage
    };
}