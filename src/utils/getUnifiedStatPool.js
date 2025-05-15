// src/utils/getUnifiedStatPool.js

export function getUnifiedStatPool(sources) {
    return sources.reduce((acc, source) => {
        for (const key in source) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                acc[key] = acc[key] || {};
                for (const subKey in source[key]) {
                    acc[key][subKey] = (acc[key][subKey] ?? 0) + (source[key][subKey] ?? 0);
                }
            } else {
                acc[key] = (acc[key] ?? 0) + (source[key] ?? 0);
            }
        }
        return acc;
    }, {});
}