// src/components/ExpandableSection.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function ExpandableSection({ title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    const [height, setHeight] = useState(0);
    const contentRef = useRef(null);

    useEffect(() => {
        if (open && contentRef.current) {
            setHeight(contentRef.current.scrollHeight);
        } else {
            setHeight(0);
        }
    }, [open, children]);

    return (
        <div className="buffs-box">
            <div className="expandable-header" onClick={() => setOpen(prev => !prev)}>
                <span className="section-title">{title}</span>
                {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            <div
                className="expandable-body-wrapper"
                style={{
                    maxHeight: `${height}px`,
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                }}
            >
                <div ref={contentRef} className="expandable-body">
                    {children}
                </div>
            </div>
        </div>
    );
}