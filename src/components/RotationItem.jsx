import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getSkillDamageCache } from '../utils/skillDamageCache';

export function RotationItem({
                                 id,
                                 index,
                                 entry,
                                 onMultiplierChange,
                                 onEdit,
                                 onDelete,
                                 setRotationEntries,
                                 currentSliderColor,
                             }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };


    const multiplier = entry.multiplier ?? 1;
    const cache = getSkillDamageCache();
    const match = cache.find(s => s.name === entry.label && s.tab === entry.tab);

    // ✅ Use cached if locked, otherwise live
    const source = entry.locked && entry.snapshot
        ? entry.snapshot
        : {
            normal: match?.normal ?? 0,
            crit: match?.crit ?? 0,
            avg: match?.avg ?? 0
        };

    const normal = source.normal * multiplier;
    const crit = source.crit * multiplier;
    const avg = source.avg * multiplier;

    // ✅ Toggle lock state
    const toggleLock = () => {
        setRotationEntries(prev => {
            const copy = [...prev];
            const item = copy[index];
            const locked = !item.locked;

            const match = getSkillDamageCache().find(
                s => s.name === item.label && s.tab === item.tab
            );

            copy[index] = {
                ...item,
                locked,
                snapshot: locked && match
                    ? {
                        avg: match.avg,
                        crit: match.crit,
                        normal: match.normal,
                        tab: item.tab,
                        label: item.label,
                        isSupportSkill: match.isSupportSkill,
                        supportColor: match.supportColor
                    }
                    : undefined
            };

            return copy;
        });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`rotation-item-wrapper ${entry.locked ? 'locked' : ''}`}
            onClick={toggleLock}
        >
            <div className={`rotation-item ${entry.locked ? 'locked' : ''}`}>
                <div className="rotation-header">
                    <span className="entry-name" style={{ color: currentSliderColor }}>
                        {entry.label}
                        {multiplier > 1 ? ` (x${multiplier})` : ''}
                    </span>
                    <span className="entry-type-detail">
                        {entry.iconPath && (
                            <img
                                src={entry.iconPath}
                                alt=""
                                className="skill-type-icon"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        )}
                        <span className="entry-detail-text">{entry.detail}</span>
                    </span>
                </div>
                <div className="rotation-values">
                    {match?.isSupportSkill ? (
                        <>
                            <span
                                className="value-label"
                                style={{
                                    color: match.supportColor,
                                    fontWeight: 'bold'
                                }}
                            >
                              {match.supportLabel}
                            </span>
                            <span></span>
                            <span></span>
                            <span className="value avg" style={{
                                color: match.supportColor,
                                fontWeight: 'bold'
                            }}>
                                {Math.round(avg)}
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="value-label">Normal</span>
                            <span className="value">{Math.round(normal)}</span>
                            <span className="value-label">Crit</span>
                            <span className="value">{Math.round(crit)}</span>
                            <span className="value-label">Avg</span>
                            <span className="value avg">{Math.round(avg)}</span>
                        </>
                    )}
                    <div className="rotation-multiplier-inline" onClick={(e) => e.stopPropagation()}>
                        <label style={{ fontSize: '13px' }}>×</label>
                        <input
                            type="number"
                            min="1"
                            max="99"
                            className="character-level-input"
                            value={multiplier}
                            onChange={(e) =>
                                onMultiplierChange(index, parseInt(e.target.value) || 1)
                            }
                            style={{ width: '40px', fontSize: '13px', marginLeft: '4px', textAlign: 'right' }}
                        />
                    </div>
                </div>
            </div>
            <div className="rotation-actions external-actions" onClick={(e) => e.stopPropagation()}>
                <button className="rotation-button" title="Edit" onClick={() => onEdit(index)}>
                    <Pencil size={18} />
                </button>
                <button className="rotation-button" title="Delete" onClick={() => onDelete(index)}>
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}