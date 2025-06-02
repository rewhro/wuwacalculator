import React from 'react';
import { getSkillDamageCache } from '../utils/skillDamageCache';

export default function Rotations({ activeCharacter, rotationEntries }) {
    if (!rotationEntries || rotationEntries.length === 0) return null;

    const cache = getSkillDamageCache();
    const total = { normal: 0, crit: 0, avg: 0 };
    const breakdownMap = {};

    for (const entry of rotationEntries) {
        const mult = entry.multiplier ?? 1;

        const source = entry.locked ? entry.cached : cache.find(s => s.name === entry.label && s.tab === entry.tab);
        const normal = (source?.normal ?? 0) * mult;
        const crit = (source?.crit ?? 0) * mult;
        const avg = (source?.avg ?? 0) * mult;

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

                {/* 🔢 Total DMG */}
                <div>Total DMG</div>
                <div>{Math.round(total.normal).toLocaleString()}</div>
                <div>{Math.round(total.crit).toLocaleString()}</div>
                <div>{Math.round(total.avg).toLocaleString()}</div>

                {/* 🧩 Skill Type Breakdown */}
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
            </div>
        </>
    );
}

// 🧠 Helper to classify skill type from the 'detail' field
function getSkillType(entry) {
    const detail = entry.detail?.toLowerCase?.() ?? '';

    if (detail.includes('basic')) return 'Basic Attack';
    if (detail.includes('heavy')) return 'Heavy Attack';
    if (detail === 'resonance skill') return 'Resonance Skill';
    if (detail.includes('liberation')) return 'Resonance Liberation';
    if (detail.includes('intro')) return 'Intro Skill';
    if (detail.includes('outro')) return 'Outro Skill';
    return 'other';
}