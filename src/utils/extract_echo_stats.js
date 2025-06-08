import Tesseract from 'tesseract.js';

// Simple keyword-based parser
function parseStatLine(text) {
    const statMap = {
        'crit rate': 'critRate',
        'crit dmg': 'critDmg',
        'atk': 'atk',
        'hp': 'hp',
        'def': 'def',
        'glacio dmg bonus': 'glacioDmgBonus',
        'resonance liberation dmg bonus': 'resonanceLiberationDmgBonus',
        // Add more as needed
    };

    const lowerText = text.toLowerCase().replace(/[^a-z0-9.%]/g, ' ');
    const match = lowerText.match(/(.+?)\s+([\d.]+%?)/);
    if (!match) return null;

    const label = match[1].trim();
    const rawValue = match[2].trim();
    const value = parseFloat(rawValue.replace('%', ''));
    const isPercent = rawValue.includes('%');

    const key = Object.keys(statMap).find(k => label.includes(k));
    if (!key) return null;

    return {
        key: statMap[key],
        value,
        isPercent
    };
}

export async function extractStatsFromImage(imageFile) {
    console.log('📸 Starting OCR on:', imageFile.name);

    const result = await Tesseract.recognize(imageFile, 'eng', {
        logger: m => console.log('[Tesseract]', m),
    });

    // Raw OCR text
    console.log('📝 Raw OCR Result:\n', result.data.text);

    const rawLines = result.data.text.split('\n').map(line => line.trim()).filter(Boolean);
    console.log('🔍 Filtered OCR Lines:', rawLines);

    const statLines = rawLines.map(parseStatLine).filter(Boolean);
    console.log('📊 Parsed Stat Lines:', statLines);

    // Group by every 5 stats (2 main, 3 sub)
    const groupedEchoes = [];
    for (let i = 0; i < statLines.length; i += 5) {
        groupedEchoes.push({
            mainStats: statLines.slice(i, i + 2),
            subStats: statLines.slice(i + 2, i + 5),
            cost: 3,
            set: 'Unknown'
        });
    }

    console.log('✅ Final Echoes:', groupedEchoes);
    return groupedEchoes;
}