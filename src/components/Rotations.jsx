import React from 'react';
import { getSkillDamageCache } from '../utils/skillDamageCache';

export default function Rotations({ rotationEntries }) {
    if (!rotationEntries || rotationEntries.length === 0) return null;

    const skillCache = getSkillDamageCache();
    const total = { normal: 0, crit: 0, avg: 0 };
    const supportTotals = { healing: 0, shielding: 0 };
    const breakdownMap = {};

    for (const entry of rotationEntries) {
        const multiplier = entry.multiplier ?? 1;

        // ✅ Use snapshot if locked
        const source = entry.locked ? entry.snapshot : skillCache.find(
            s => s.name === entry.label && s.tab === entry.tab
        );

        if (!source) continue;

        const isSupport = source.isSupportSkill;
        const avg = (source.avg ?? 0) * multiplier;
        const normal = (source.normal ?? 0) * multiplier;
        const crit = (source.crit ?? 0) * multiplier;

        if (isSupport) {
            if (source.supportColor === 'limegreen') {
                supportTotals.healing += avg;
            } else {
                supportTotals.shielding += avg;
            }
            continue; // skip DMG
        }

        total.normal += normal;
        total.crit += crit;
        total.avg += avg;

        const type = getSkillType(entry);
        if (!breakdownMap[type]) {
            breakdownMap[type] = { normal: 0, crit: 0, avg: 0 };
        }

        breakdownMap[type].normal += normal;
        breakdownMap[type].crit += crit;
        breakdownMap[type].avg += avg;
    }

    return (
        <>
            <h3 className="damage-box-title">Rotation</h3>
            <div className="damage-grid">
                <div></div>
                <div>Normal</div>
                <div>CRIT</div>
                <div>AVG</div>

                <div>Total DMG</div>
                <div>{Math.round(total.normal).toLocaleString()}</div>
                <div>{Math.round(total.crit).toLocaleString()}</div>
                <div>{Math.round(total.avg).toLocaleString()}</div>

                {Object.entries(breakdownMap).map(([type, dmg]) => {
                    const percent = total.avg > 0 ? (dmg.avg / total.avg) * 100 : 0;
                    return (
                        <React.Fragment key={type}>
                            <div style={{ color: '#999' }}>
                                ({percent.toFixed(1)}%) {type}
                            </div>
                            <div style={{ color: '#999' }}>{Math.round(dmg.normal).toLocaleString()}</div>
                            <div style={{ color: '#999' }}>{Math.round(dmg.crit).toLocaleString()}</div>
                            <div style={{ color: '#999' }}>{Math.round(dmg.avg).toLocaleString()}</div>
                        </React.Fragment>
                    );
                })}

                {supportTotals.healing > 0 && (
                    <>
                        <div style={{ color: 'limegreen', fontWeight: 'bold' }}>Total Healing</div>
                        <div></div>
                        <div></div>
                        <div style={{ color: 'limegreen', fontWeight: 'bold' }}>
                            {Math.round(supportTotals.healing).toLocaleString()}
                        </div>
                    </>
                )}

                {supportTotals.shielding > 0 && (
                    <>
                        <div style={{ color: '#838383', fontWeight: 'bold' }}>Total Shield</div>
                        <div></div>
                        <div></div>
                        <div style={{ color: '#838383', fontWeight: 'bold' }}>
                            {Math.round(supportTotals.shielding).toLocaleString()}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

function getSkillType(entry) {
    const detail = entry.detail?.toLowerCase?.() ?? '';

    if (detail.includes('basic')) return 'Basic Attack';
    if (detail.includes('heavy')) return 'Heavy Attack';
    if (detail === 'resonance skill') return 'Resonance Skill';
    if (detail.includes('liberation')) return 'Resonance Liberation';
    if (detail.includes('intro')) return 'Intro Skill';
    if (detail.includes('outro')) return 'Outro Skill';
    return 'Other';
}