import React from 'react';

export default function CustomBuffsPane({ customBuffs, setCustomBuffs }) {
    const percentageFields = new Set([
        'atkPercent', 'hpPercent', 'defPercent',
        'critRate', 'critDmg', 'energyRegen', 'healingBonus',
        'basicAtk', 'heavyAtk', 'resonanceSkill', 'resonanceLiberation',
        'aero', 'glacio', 'spectro', 'fusion', 'electro', 'havoc',
        'coord', 'coordAmplify',
        'basicAtkAmplify', 'heavyAtkAmplify', 'resonanceSkillAmplify',
        'resonanceLiberationAmplify', 'aeroAmplify', 'glacioAmplify',
        'spectroAmplify', 'fusionAmplify', 'electroAmplify', 'havocAmplify',
        'enemyResShred', 'enemyDefShred', 'enemyDefIgnore',
        'spectroFrazzleAmplify', 'aeroErosionAmplify',
        'spectroFrazzleDmg', 'aeroErosionDmg'
    ]);

    const flatFields = new Set(['atkFlat', 'hpFlat', 'defFlat']);

    const handleChange = (key, value) => {
        const num = Number(value);
        let clamped = num;

        if (percentageFields.has(key)) {
            clamped = Math.min(Math.max(num, 0), 999);
        } else if (flatFields.has(key)) {
            clamped = Math.min(Math.max(num, 0), 9999);
        }

        const damageTypeMap = {
            basicAtkAmplify: 'basic',
            heavyAtkAmplify: 'heavy',
            resonanceSkillAmplify: 'skill',
            resonanceLiberationAmplify: 'ultimate',
            spectroFrazzleAmplify: 'spectroFrazzle',
            aeroErosionAmplify: 'aeroErosion',
            coordAmplify: 'coord'
        };

        if (damageTypeMap[key]) {
            setCustomBuffs(prev => ({
                ...prev,
                damageTypeAmplify: {
                    ...prev.damageTypeAmplify,
                    [damageTypeMap[key]]: clamped
                }
            }));
            return;
        }

        const elementAmplifyMap = {
            aeroAmplify: 'aero',
            glacioAmplify: 'glacio',
            spectroAmplify: 'spectro',
            fusionAmplify: 'fusion',
            electroAmplify: 'electro',
            havocAmplify: 'havoc'
        };

        if (elementAmplifyMap[key]) {
            setCustomBuffs(prev => ({
                ...prev,
                elementDmgAmplify: {
                    ...prev.elementDmgAmplify,
                    [elementAmplifyMap[key]]: clamped
                }
            }));
            return;
        }

        setCustomBuffs(prev => ({
            ...prev,
            [key]: clamped
        }));
    };

    const renderInput = (key) => {
        const damageTypeMap = {
            basicAtkAmplify: 'basic',
            heavyAtkAmplify: 'heavy',
            resonanceSkillAmplify: 'skill',
            resonanceLiberationAmplify: 'ultimate',
            spectroFrazzleAmplify: 'spectroFrazzle',
            aeroErosionAmplify: 'aeroErosion',
            coordAmplify: 'coord'
        };

        const elementAmplifyMap = {
            aeroAmplify: 'aero',
            glacioAmplify: 'glacio',
            spectroAmplify: 'spectro',
            fusionAmplify: 'fusion',
            electroAmplify: 'electro',
            havocAmplify: 'havoc'
        };

        let value = customBuffs[key] ?? 0;

        if (damageTypeMap[key]) {
            value = customBuffs.damageTypeAmplify?.[damageTypeMap[key]] ?? 0;
        }

        if (elementAmplifyMap[key]) {
            value = customBuffs.elementDmgAmplify?.[elementAmplifyMap[key]] ?? 0;
        }

        return percentageFields.has(key) ? (
            <div className="input-with-suffix">
                <input
                    type="number"
                    value={value}
                    onChange={e => handleChange(key, e.target.value)}
                />
                <span>%</span>
            </div>
        ) : (
            <input
                type="number"
                value={value}
                onChange={e => handleChange(key, e.target.value)}
            />
        );
    };

    return (
        <>
            <div className="character-settings">
                <h3>Main Stats</h3>
                <div className="buff-grid">
                    {[
                        ['Attack', 'atkFlat', 'atkPercent'],
                        ['HP', 'hpFlat', 'hpPercent'],
                        ['Defense', 'defFlat', 'defPercent']
                    ].map(([label, flatKey, percentKey]) => (
                        <div className="buff-row" key={label}>
                            <label>{label}</label>
                            <div className="dual-input">
                                <input type="number" value={customBuffs[flatKey] ?? 0}
                                       onChange={e => handleChange(flatKey, e.target.value)} />
                                <div className="input-with-suffix">
                                    <input type="number" value={customBuffs[percentKey] ?? 0}
                                           onChange={e => handleChange(percentKey, e.target.value)} />
                                    <span>%</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {[['Crit Rate', 'critRate'], ['Crit DMG', 'critDmg'],
                        ['Energy Regen', 'energyRegen'], ['Healing Bonus', 'healingBonus']].map(([label, key]) => (
                        <div className="buff-row" key={key}>
                            <label>{label}</label>
                            {renderInput(key)}
                        </div>
                    ))}
                </div>
            </div>

            <div className="character-settings">
                <h3>Damage Modifiers</h3>
                <div className="buff-grid">
                    {[
                        ['Basic Attack DMG', 'basicAtk'], ['Heavy Attack DMG', 'heavyAtk'],
                        ['Resonance Skill DMG', 'resonanceSkill'], ['Resonance Liberation DMG', 'resonanceLiberation'],
                        ['Aero DMG', 'aero'], ['Glacio DMG', 'glacio'], ['Spectro DMG', 'spectro'],
                        ['Fusion DMG', 'fusion'], ['Electro DMG', 'electro'], ['Havoc DMG', 'havoc'],
                        ['Coordinated DMG', 'coord'], ['Coordinated DMG Amplify', 'coordAmplify'],
                        ['Basic Attack DMG Amplify', 'basicAtkAmplify'],
                        ['Heavy Attack DMG Amplify', 'heavyAtkAmplify'],
                        ['Resonance Skill DMG Amplify', 'resonanceSkillAmplify'],
                        ['Resonance Liberation DMG Amplify', 'resonanceLiberationAmplify'],
                        ['Aero DMG Amplify', 'aeroAmplify'],
                        ['Glacio DMG Amplify', 'glacioAmplify'],
                        ['Spectro DMG Amplify', 'spectroAmplify'],
                        ['Fusion DMG Amplify', 'fusionAmplify'],
                        ['Electro DMG Amplify', 'electroAmplify'],
                        ['Havoc DMG Amplify', 'havocAmplify'],
                        ['Enemy Res Shred', 'enemyResShred'],
                        ['Enemy DEF Shred', 'enemyDefShred'],
                        ['Enemy DEF Ignore', 'enemyDefIgnore'],
                        ['Spectro Frazzle DMG', 'spectroFrazzleDmg'],
                        ['Aero Erosion DMG', 'aeroErosionDmg'],
                        ['Spectro Frazzle DMG Amplify', 'spectroFrazzleAmplify'],
                        ['Aero Erosion DMG Amplify', 'aeroErosionAmplify']
                    ].map(([label, key]) => (
                        <div className="buff-row" key={key}>
                            <label>{label}</label>
                            {renderInput(key)}
                        </div>
                    ))}
                </div>
            </div>

            <button className="clear-button" onClick={() => {
                setCustomBuffs({
                    atkFlat: 0, atkPercent: 0, hpFlat: 0, hpPercent: 0, defFlat: 0, defPercent: 0,
                    critRate: 0, critDmg: 0, energyRegen: 0, healingBonus: 0,
                    basicAtk: 0, heavyAtk: 0, resonanceSkill: 0, resonanceLiberation: 0,
                    aero: 0, glacio: 0, spectro: 0, fusion: 0, electro: 0, havoc: 0,
                    coord: 0, coordAmplify: 0, basicAtkAmplify: 0, heavyAtkAmplify: 0,
                    resonanceSkillAmplify: 0, resonanceLiberationAmplify: 0, aeroAmplify: 0,
                    glacioAmplify: 0, spectroAmplify: 0, fusionAmplify: 0, electroAmplify: 0,
                    havocAmplify: 0, enemyResShred: 0, enemyDefShred: 0, enemyDefIgnore: 0,
                    spectroFrazzleDmg: 0, aeroErosionDmg: 0, spectroFrazzleAmplify: 0,
                    aeroErosionAmplify: 0,
                });
            }}>
                Clear All
            </button>
        </>
    );
}