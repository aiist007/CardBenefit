/**
 * Utility for normalizing credit card names.
 * 中文说明：规范化信用卡名称的工具。
 */

const CARD_MAP: Record<string, string> = {
    // American Express (美运)
    'AE白': '美运白',
    'AE黑': '美运黑',
    'AE超白': '美运超白',
    'AMEX白': '美运白',
    '美运白': '美运白',
    '美运黑': '美运黑',
    'Safari卡': '美运Safari',
    'Safari白金': '美运Safari',

    // CMB (招行)
    '招行经典白': '招行经典白',
    '经典白': '招行经典白',
    '经典白金': '招行经典白',
    '百夫长白金': '招行百夫长白',
    '钻石卡': '招行钻石卡',
    '自由人生': '招行自由人生',
    '鸟白': '招行自由人生',

    // ABC (农行)
    '农行精粹白': '农行精粹白',
    '精粹白': '农行精粹白',
    '精粹': '农行精粹白',
    '老农白': '农行精粹白',
    '悠然白': '农行悠然白',
    '航司白': '农行航司白',

    // CCB (建行)
    '建行大山白': '建行大山白',
    '大山白': '建行大山白',
    '家庭卡': '建行家庭挚爱',
    '挚爱': '建行家庭挚爱',

    // ICBC (工行)
    '香白': '工行香白',
    '黑白菜': '工行黑白菜',

    // SPDB (浦发)
    '浦发AE白': '浦发AE白',
    'AE超白金': '浦发超白',
    '浦发超白': '浦发超白',

    // HXB (华夏)
    '华夏尊尚白': '华夏尊尚白',
    '尊尚白': '华夏尊尚白',
    '华夏银行运通Safari卡': '华夏银行美国运通 Safari 信用卡',
    '华夏运通Safari': '华夏银行美国运通 Safari 信用卡',
    '华夏Safari': '华夏银行美国运通 Safari 信用卡',
    'Safari卡': '华夏银行美国运通 Safari 信用卡',
    'UP白': '华夏银行UP信用卡白金卡',
    'UP白金卡': '华夏银行UP信用卡白金卡',
    '华夏UP信用卡白金卡': '华夏银行UP信用卡白金卡',
    '上海银行东航白金卡': '上海银行东方航空联名白金信用卡',
    '上海银行东方航空联名白金卡': '上海银行东方航空联名白金信用卡',
    '东航白金卡': '上海银行东方航空联名白金信用卡',

    // CGB (广发)
    '广发真情': '广发真情卡',

    // Common abbreviations
    '白金卡': '白金卡',
    '金卡': '金卡',
    '普卡': '普卡',
    '通用卡片': '通用',
    '通用': '通用',
};

/**
 * Normalizes a card name to its standard version.
 * 中文说明：规范化信用卡名称，去除首尾特殊字符。
 */
export const normalizeCardName = (name: string): string => {
    if (!name || typeof name !== 'string') return '通用';

    // Remove leading/trailing slashes, dots, and whitespace
    let trimmed = name.trim()
        .replace(/^[./\\，、, ]+|[./\\，、, ]+$/g, '')
        .trim();

    if (!trimmed || trimmed === 'None' || trimmed === '通用卡片' || trimmed === '通用') return '通用';

    // We use Official Full Names as requested by the user.
    // First, check for exact match in the mapping table.
    if (CARD_MAP[trimmed]) return CARD_MAP[trimmed];

    // Try a more aggressive match: check if any key in CARD_MAP is contained within the trimmed name
    // or vice versa, focusing on substantial matches to avoid false positives.
    for (const [variant, official] of Object.entries(CARD_MAP)) {
        if (trimmed === variant) return official;
        if (variant.length >= 3 && (trimmed.includes(variant) || variant.includes(trimmed))) {
            return official;
        }
    }

    return trimmed;
};

/**
 * Checks if a name is a known official card name.
 * 中文说明：检查名称是否为已知的官方卡片名称。
 */
export const isOfficialCardName = (name: string): boolean => {
    if (!name) return false;
    const trimmed = name.trim();

    // Check if it's a value in CARD_MAP (official names)
    if (Object.values(CARD_MAP).includes(trimmed)) return true;

    // Check if it's a key in CARD_MAP that maps to itself or another name
    // (though mapping-to-self is the standard for official names)
    return !!CARD_MAP[trimmed] && CARD_MAP[trimmed] === trimmed;
};

/**
 * Validates a card name and provides suggestions if possible.
 * 中文说明：验证卡片名称，并尽量提供建议。
 */
export const validateCardName = (name: string): { isValid: boolean; suggestion?: string } => {
    const trimmed = name.trim();
    if (isOfficialCardName(trimmed)) return { isValid: true };

    const normalized = normalizeCardName(trimmed);
    if (isOfficialCardName(normalized)) {
        return { isValid: false, suggestion: normalized };
    }

    return { isValid: false };
};

/**
 * Gets a list of all official card names.
 * 中文说明：获取所有官方卡片名称的列表。
 */
export const getOfficialCardNames = (): string[] => {
    const names = new Set(Object.values(CARD_MAP));
    return Array.from(names).filter(n => n !== '通用');
};
