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
 * Normalizes a card name to its concise version.
 * 中文说明：将卡片名称规范化为简洁的版本。
 */
export const normalizeCardName = (name: string): string => {
    if (!name || typeof name !== 'string') return '通用';

    // Remove leading/trailing slashes, dots, and whitespace
    let trimmed = name.trim()
        .replace(/^[./\\]+|[./\\]+$/g, '')
        .trim();

    if (!trimmed || trimmed === 'None' || trimmed === '通用卡片' || trimmed === '通用') return '通用';

    // 1. Exact match in map (including specific bank abbreviations like "工行")
    if (CARD_MAP[trimmed]) return CARD_MAP[trimmed];

    // 2. Fuzzy match aliases (e.g. "精粹白" -> "农行精粹白")
    for (const [alias, canonical] of Object.entries(CARD_MAP)) {
        if (trimmed.includes(alias)) {
            if (alias.length >= 2) return canonical;
        }
    }

    // 3. Handle general bank benefits if they missed the suffix
    // If it's a common bank abbr but accidentally got "卡" stripped or was never there
    // e.g. "建行" -> "建行信用卡"
    const commonBanks = ['工行', '建行', '农行', '中行', '交行', '邮储', '招行', '中信', '光大', '华夏', '民生', '广发', '平安', '兴业', '浦发', '浙商', '恒丰', '渤海'];
    if (commonBanks.includes(trimmed)) {
        return `${trimmed}信用卡`;
    }

    return trimmed;
};
