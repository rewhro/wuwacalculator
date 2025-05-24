export const formatDescription = (desc, param = [], currentSliderColor = '#888') => {
    if (!desc) return '';

    // Remove HTML formatting from the source string
    desc = desc
        .replace(/<size=\d+>|<\/size>/g, '')
        .replace(/<color=[^>]+>|<\/color>/g, '')
        .replace(/<a\s+href=.*?>/gi, '')
        .replace(/<\/a>/gi, '')
        .replace(/\n/g, '<br>');

    // Handle {Cus:S=... P=... SapTag=#}
    desc = desc.replace(/\{Cus:[^}]*S=([^ ]+)\s+P=([^ ]+)\s+SapTag=(\d+)[^}]*\}/g, (_, singular, plural, tagIndex) => {
        const value = parseFloat(param[parseInt(tagIndex, 10)]);
        return value === 1 ? singular : plural;
    });

    // Highlight standard elemental damage types with the current slider color
    const sliderKeywords = ['Glacio DMG', 'Fusion DMG', 'Electro DMG', 'Aero DMG', 'Spectro DMG', 'Havoc DMG'];
    sliderKeywords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        desc = desc.replace(regex, `<span style="color: ${currentSliderColor}; font-weight: bold;">${word}</span>`);
    });

    // Highlight fixed keywords with fixed colors
    const fixedHighlights = {
        'Spectro Frazzle': 'rgb(202,179,63)',
        'Aero Erosion': 'rgb(15,205,160)',
        'Havoc Bane': 'rgb(172,9,96)',
        'Fusion Burst': 'rgb(197,52,79)',
        'Electro Flare': 'rgb(167,13,209)',
        'Glacio Chafe': 'rgb(62,189,227)'
    };

    Object.entries(fixedHighlights).forEach(([word, color]) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        desc = desc.replace(regex, `<span style="color: ${color}; font-weight: bold;">${word}</span>`);
    });

    // Replace numbered parameters like {0}, {1}, etc.
    desc = desc.replace(/{(\d+)}/g, (_, index) => param[index] ?? `{${index}}`);

    return desc;
};