/**
 * Utility for normalizing Chinese bank names.
 * 中文说明：规范化中国银行名称的工具。
 */

const BANK_MAP: Record<string, string> = {
    // Big Six Banks (六大行)
    '中国工商银行': '工行',
    '工商银行': '工行',
    '工行': '工行',
    'ICBC': '工行',

    '中国建设银行': '建行',
    '建设银行': '建行',
    '建行': '建行',
    'CCB': '建行',

    '中国农业银行': '农行',
    '农业银行': '农行',
    '农行': '农行',
    'ABC': '农行',

    '中国银行': '中行',
    '中行': '中行',
    'BOC': '中行',

    '交通银行': '交行',
    '交行': '交行',
    'BOCOM': '交行',

    '中国邮政储蓄银行': '邮储',
    '邮政储蓄银行': '邮储',
    '邮储': '邮储',
    'PSBC': '邮储',

    // Joint-stock Commercial Banks (股份制银行)
    '招商银行': '招行',
    '招商': '招行',
    '招行': '招行',
    'CMB': '招行',

    '中信银行': '中信',
    '中信': '中信',
    'CITIC': '中信',

    '中国光大银行': '光大',
    '光大': '光大',
    'CEB': '光大',

    '华夏银行': '华夏',
    '华夏': '华夏',
    'HXB': '华夏',

    '中国民生银行': '民生',
    '民生': '民生',
    'CMBC': '民生',

    '广发银行': '广发',
    '广发': '广发',
    'CGB': '广发',
    'GDB': '广发',

    '平安银行': '平安',
    '平安': '平安',
    'PAB': '平安',

    '兴业银行': '兴业',
    '兴业': '兴业',
    'CIB': '兴业',

    '浦发银行': '浦发',
    '浦东发展银行': '浦发',
    '上海浦东发展银行': '浦发',
    '浦发': '浦发',
    'SPDB': '浦发',

    '浙商银行': '浙商',
    '浙商': '浙商',
    'CZB': '浙商',

    '恒丰银行': '恒丰',
    '恒丰': '恒丰',

    '渤海银行': '渤海',
    '渤海': '渤海',

    // Foreign / Other
    '美国运通': 'AMEX HK',
    '运通': 'AMEX HK',
    'American Express': 'AMEX HK',
    'AMEX': 'AMEX HK',
};

/**
 * Normalizes a bank name to its canonical Chinese version.
 * 中文说明：将银行名称规范化为标准的中文版本。
 */
export const normalizeBankName = (name: string): string => {
    if (!name || typeof name !== 'string') return '其他银行';

    // Clean common suffixes and prefixes
    let trimmed = name.trim()
        .replace(/信用卡中心$/, '')
        .replace(/信用卡$/, '')
        .replace(/分行$/, '')
        .trim();

    if (!trimmed || trimmed === 'None') return '其他银行';

    // Exact match
    if (BANK_MAP[trimmed]) return BANK_MAP[trimmed];

    // Case-insensitive match for abbreviations
    const upper = trimmed.toUpperCase();
    if (BANK_MAP[upper]) return BANK_MAP[upper];

    // Try matching without "中国" prefix if not found
    if (trimmed.startsWith('中国')) {
        const withoutPrefix = trimmed.substring(2);
        if (BANK_MAP[withoutPrefix]) return BANK_MAP[withoutPrefix];
    }

    // Partial match (e.g. "工商银行上海分行" -> "工商银行")
    for (const [alias, canonical] of Object.entries(BANK_MAP)) {
        if (trimmed.includes(alias) || alias.includes(trimmed)) {
            // Only match if alias is substantial to avoid false positives
            if (alias.length >= 2) return canonical;
        }
    }

    return trimmed;
};
