export const formatDescription = (desc, param = [], currentSliderColor = '#888') => {
    if (!desc) return '';
    desc = desc.replace(/<size=\d+>|<\/size>/g, '')
        .replace(/<color=[^>]+>|<\/color>/g, '')
        .replace(/\n/g, '<br>');

    desc = desc.replace(/\{Cus:[^}]*S=([^ ]+)\s+P=([^ ]+)\s+SapTag=(\d+)[^}]*\}/g, (_, singular, plural, tagIndex) => {
        const value = parseFloat(param[parseInt(tagIndex, 10)]);
        return value === 1 ? singular : plural;
    });

    const attributeWords = ['Glacio DMG', 'Fusion DMG', 'Electro DMG', 'Aero DMG', 'Spectro DMG', 'Havoc DMG'];
    attributeWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        desc = desc.replace(regex, `<span style="color: ${currentSliderColor}; font-weight: bold;">${word}</span>`);
    });
    desc = desc.replace(/{(\d+)}/g, (_, index) => param[index] ?? `{${index}}`);
    return desc;
}