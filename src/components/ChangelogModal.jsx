// src/components/ChangelogModal.jsx
import React from 'react';

export default function ChangelogModal({ open, onClose }) {
    if (!open) return null;

    const changelogData = [
        {
            date: '18/05/2025',
            entries: [
                {
                    type: 'paragraph',
                    content: `<strong>Pheobe</strong> is now fully functional.`
                },
                /*
                {
                    type: 'bullet',
                    content: `Mostly just UI support and "un-generalization" (i'm not sure yet what that means) for THE Pheobe. More characters will be updated later.`
                },
                */
            ]
        },
        {
            date: '20/05/2025',
            entries: [
                {
                    type: 'paragraph',
                    content: `<strong>Sanhua</strong> is now fully functional.`
                }
            ]

        },
        {
            date: '21/05/2025',
            entries: [
                {
                    type: 'paragraph',
                    content: `<strong>Baizhi</strong> is now fully functional.`
                }
            ]

        },
        {
            date: '22/05/2025',
            entries: [
                {
                    type: 'paragraph',
                    content: `<strong>Lingyang</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Lupa</strong> is now fully functional.`
                }
            ]

        },
        {
            date: '23/05/2025',
            entries: [
                {
                    type: 'paragraph',
                    content: `<strong>Zhezhi</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Youhu</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Carlotta</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Cartethyia</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Chixia</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Encore</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Mortefi</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Changli</strong> is now fully functional.`
                }
            ]

        },
        {
            date: '24/05/2025',
            entries: [
                {
                    type: 'paragraph',
                    content: `<strong>Brant</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Calcharo</strong> is now fully functional.`
                }
            ]
        },
        {
            date: '25/05/2025',
            entries: [
                {
                    type: 'paragraph',
                    content: `<strong>Yinlin</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Yuanwu</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Jinhsi</strong> is now fully functional.`
                }
            ]
        },
        {
            date: '26/05/2025',
            entries: [
                {
                    type: 'paragraph',
                    content: `<strong>Xiangli Yao</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Zani</strong> is now fully functional.`
                }
            ]
        },
        {
            date: '27/05/2025',
            entries: [
                {
                    type: 'paragraph',
                    content: `<strong>YangYang</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Jiyan</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Jianxin</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Rover: Aero Husbando</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Rover: Aero Waifu</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Ciaccona</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Rover: Spectro Husbando</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Rover: Spectro Waifu</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Verina</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Lumi</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Memoke- S-Shorekeeper</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Taoqi</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Danjin</strong> is now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `<strong>Camellya</strong> is now fully functional.`
                }
            ]
        },
        {
            date: '27/05/2025',
            entries: [
                {
                    type: 'paragraph',
                    content: `Added weapons (just base atk and main stats)`
                }
            ]
        },
        {
            date: '28/05/2025',
            entries: [
                {
                    type: 'paragraph',
                    content: `All 5 star weapons are now fully functional.`
                },
                {
                    type: 'paragraph',
                    content: `All other weapons are now fully functional.`
                }
            ]
        },
        {
            date: '29/05/2025',
            entries: [
                {
                    type: 'paragraph',
                    content: `Added echo buffs.`
                },
                {
                    type: 'paragraph',
                    content: `Added weapon buffs.`
                }
            ]
        }
        // Add more changelogs as needed
    ];

    return (
        <div className="skills-modal-overlay" onClick={onClose}>
            <div className="skills-modal-content changelog-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Changelog</h2>
                <div className="changelog-entries">
                    {changelogData.map((log, index) => (
                        <div key={index} className="changelog-block">
                            <h3 className="changelog-date">{log.date}</h3>
                            {log.entries.map((entry, idx) => {
                                if (entry.type === 'paragraph') {
                                    return <p key={idx} dangerouslySetInnerHTML={{ __html: entry.content }} />;
                                } else if (entry.type === 'bullet') {
                                    return <ul key={idx}><li dangerouslySetInnerHTML={{ __html: entry.content }} /></ul>;
                                }
                                return null;
                            })}
                        </div>
                    ))}
                </div>
                <button className="btn-secondary" onClick={onClose}>Close</button>
            </div>
        </div>
    );
}