/**
 * jsonToToon converts an array of objects to TOON (Token-Oriented Object Notation).
 * TOON is a compact format that reduces token usage for LLM prompts by:
 * 1. Using a tabular header-first representation for arrays of objects.
 * 2. Removing redundant punctuation (brackets, curly braces, quotes).
 * 3. Using indentation and minimal separators.
 */
export function jsonToToon(data: any[]): string {
    if (!Array.isArray(data) || data.length === 0) return '';

    // Get all unique keys from all objects to handle sparse objects
    const keys = Array.from(new Set(data.flatMap(obj => Object.keys(obj))));

    // Header
    let toon = `FIELDS: ${keys.join('|')}\n`;
    toon += `DATA:\n`;

    // Items
    data.forEach(item => {
        const row = keys.map(key => {
            const val = item[key];
            if (val === null || val === undefined) return '';

            // Clean value: remove newlines and pipe characters which are our separators
            const cleanVal = String(val)
                .replace(/[\n\r]+/g, ' ')
                .replace(/\|/g, '\\|')
                .trim();
            return cleanVal;
        }).join('|');
        toon += `- ${row}\n`;
    });

    return toon;
}

/**
 * toonToJson converts a TOON string back to an array of objects.
 */
export function toonToJson(toon: string): any[] {
    if (!toon || !toon.trim()) return [];

    const lines = toon.trim().split('\n');
    const fieldsLine = lines.find(l => l.startsWith('FIELDS:'));
    if (!fieldsLine) return [];

    const keys = fieldsLine.replace('FIELDS:', '').trim().split('|');
    const dataIndex = lines.findIndex(l => l.startsWith('DATA:'));
    if (dataIndex === -1) return [];

    const result: any[] = [];
    for (let i = dataIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('- ')) {
            const rowValues = line.substring(2).split(/(?<!\\)\|/);
            const obj: any = {};
            keys.forEach((key, index) => {
                let val = rowValues[index] || '';
                // Restore escaped pipes
                val = val.replace(/\\\|/g, '|');

                // Try to parse booleans and numbers
                if (val.toLowerCase() === 'true') obj[key] = true;
                else if (val.toLowerCase() === 'false') obj[key] = false;
                else if (val === '') obj[key] = null;
                else if (!isNaN(Number(val)) && val.trim() !== '') obj[key] = Number(val);
                else obj[key] = val;
            });
            result.push(obj);
        }
    }

    return result;
}

/**
 * Estimated token reduction factor (rough heuristic)
 */
export function estimateTokenSaving(json: string, toon: string): {
    savingPercent: number,
    jsonLength: number,
    toonLength: number
} {
    const jsonLen = json.length;
    const toonLen = toon.length;
    const saving = ((jsonLen - toonLen) / jsonLen) * 100;
    return {
        savingPercent: Math.round(saving),
        jsonLength: jsonLen,
        toonLength: toonLen
    };
}
