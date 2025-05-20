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