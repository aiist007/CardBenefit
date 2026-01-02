import { Benefit, BenefitCategory } from '@/types';
// I'll stick to crypto.randomUUID() if environment supports it, or simple generator.

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const parseBenefitsFromText = (text: string, defaultCardName: string = 'Unknown Card'): Benefit[] => {
    const lines = text.split('\n');
    const benefits: Benefit[] = [];

    let currentTitle = '';
    let currentDesc = '';
    let currentCategory: BenefitCategory = 'Other';

    // Heuristic:
    // Look for lines that look like titles (short, maybe bolded in markdown, or followed by paragraphs).
    // Or look for "Benefit: ..."
    // 中文说明：启发式规则：查找看起来像标题的行（短行、可能是 markdown 加粗，或后跟段落），或者查找 "Benefit: ..." 开头的行。

    // Simple block parser:
    // If line is short and non-empty -> Title
    // Following lines -> Description
    // Empty line -> End of block
    // 中文说明：简易块解析器：除了空行外，将第一行视为标题，随后的行视为描述，遇到空行则视为该块结束。

    lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) {
            if (currentTitle) {
                benefits.push({
                    id: generateId(),
                    cardName: defaultCardName,
                    bank: 'Unknown', // User can edit later
                    category: currentCategory,
                    title: currentTitle,
                    description: currentDesc.trim(),
                });
                currentTitle = '';
                currentDesc = '';
            }
            return;
        }

        if (!currentTitle) {
            // Treat this line as title
            currentTitle = trimmed.replace(/^[-*•]\s*/, '').replace(/[:：]$/, ''); // Remove bullets and trailing colons
            // Try to guess category from title keywords
            if (/travel|flight|hotel|lounge/i.test(currentTitle)) currentCategory = 'Travel';
            else if (/dining|restaurant|food/i.test(currentTitle)) currentCategory = 'Dining';
            else if (/shopping|purchase|protection/i.test(currentTitle)) currentCategory = 'Shopping';
            else if (/insurance|accident|delay/i.test(currentTitle)) currentCategory = 'Insurance';
            else currentCategory = 'Other';
        } else {
            currentDesc += trimmed + ' ';
        }
    });

    // Flush last one
    if (currentTitle) {
        benefits.push({
            id: generateId(),
            cardName: defaultCardName,
            bank: 'Unknown',
            category: currentCategory,
            title: currentTitle,
            description: currentDesc.trim(),
        });
    }

    return benefits;
};
