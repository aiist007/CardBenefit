module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/utils/bankUtils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeBankName",
    ()=>normalizeBankName
]);
/**
 * Utility for normalizing Chinese bank names.
 * 中文说明：规范化中国银行名称的工具。
 */ const BANK_MAP = {
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
    'AMEX': 'AMEX HK'
};
const normalizeBankName = (name)=>{
    if (!name || typeof name !== 'string') return '其他银行';
    // Clean common suffixes and prefixes
    let trimmed = name.trim().replace(/信用卡中心$/, '').replace(/信用卡$/, '').replace(/分行$/, '').trim();
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
    for (const [alias, canonical] of Object.entries(BANK_MAP)){
        if (trimmed.includes(alias) || alias.includes(trimmed)) {
            // Only match if alias is substantial to avoid false positives
            if (alias.length >= 2) return canonical;
        }
    }
    return trimmed;
};
}),
"[project]/src/utils/cardUtils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeCardName",
    ()=>normalizeCardName
]);
/**
 * Utility for normalizing credit card names.
 * 中文说明：规范化信用卡名称的工具。
 */ const CARD_MAP = {
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
    '通用': '通用'
};
const normalizeCardName = (name)=>{
    if (!name || typeof name !== 'string') return '通用';
    // Remove leading/trailing slashes, dots, and whitespace
    let trimmed = name.trim().replace(/^[./\\]+|[./\\]+$/g, '').trim();
    if (!trimmed || trimmed === 'None' || trimmed === '通用卡片' || trimmed === '通用') return '通用';
    // 1. Exact match in map (including specific bank abbreviations like "工行")
    if (CARD_MAP[trimmed]) return CARD_MAP[trimmed];
    // 2. Fuzzy match aliases (e.g. "精粹白" -> "农行精粹白")
    for (const [alias, canonical] of Object.entries(CARD_MAP)){
        if (trimmed.includes(alias)) {
            if (alias.length >= 2) return canonical;
        }
    }
    // 3. Handle general bank benefits if they missed the suffix
    // If it's a common bank abbr but accidentally got "卡" stripped or was never there
    // e.g. "建行" -> "建行信用卡"
    const commonBanks = [
        '工行',
        '建行',
        '农行',
        '中行',
        '交行',
        '邮储',
        '招行',
        '中信',
        '光大',
        '华夏',
        '民生',
        '广发',
        '平安',
        '兴业',
        '浦发',
        '浙商',
        '恒丰',
        '渤海'
    ];
    if (commonBanks.includes(trimmed)) {
        return `${trimmed}信用卡`;
    }
    return trimmed;
};
}),
"[project]/src/context/BenefitContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BenefitProvider",
    ()=>BenefitProvider,
    "useBenefits",
    ()=>useBenefits
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$bankUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/bankUtils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cardUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/cardUtils.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
const BenefitContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const BenefitProvider = ({ children })=>{
    const [benefits, setBenefits] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoaded, setIsLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const loadData = async ()=>{
            try {
                // 1. Try to load from JSON DB first
                const response = await fetch('/api/db');
                const dbData = await response.json();
                if (Array.isArray(dbData) && dbData.length > 0) {
                    setBenefits(dbData);
                    // Clear old localStorage migration flag if it exists
                    localStorage.removeItem('cc_migration_v2');
                    localStorage.removeItem('cc_benefits');
                } else {
                    // 2. If DB is empty, check localStorage for migration
                    const stored = localStorage.getItem('cc_benefits');
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        const processed = parsed.map((b)=>({
                                ...b,
                                id: b.id || crypto.randomUUID()
                            }));
                        // Migrate to JSON DB
                        await fetch('/api/db', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(processed)
                        });
                        setBenefits(processed);
                        localStorage.removeItem('cc_benefits');
                        localStorage.removeItem('cc_migration_v2');
                        console.log('Migration from localStorage to JSON DB completed.');
                    }
                }
            } catch (e) {
                console.error('Failed to load or migrate data:', e);
            } finally{
                setIsLoaded(true);
            }
        };
        loadData();
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isLoaded) {
            // Save to JSON DB whenever benefits change
            const saveData = async ()=>{
                try {
                    await fetch('/api/db', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(benefits)
                    });
                } catch (e) {
                    console.error('Failed to save to JSON DB:', e);
                }
            };
            saveData();
        }
    }, [
        benefits,
        isLoaded
    ]);
    // Helper to check if two benefit titles are effectively the same
    // 中文说明：检查两个权益标题是否实质上相同（模糊匹配）
    const areTitlesSimilar = (t1, t2)=>{
        const s1 = t1.toLowerCase().trim().replace(/\s+/g, '');
        const s2 = t2.toLowerCase().trim().replace(/\s+/g, '');
        if (s1 === s2) return true;
        // Common keywords to ignore for similarity but important for identity
        // 如果包含这些关键词，通常意味着是不同的子活动，不应轻易合并
        const exclusiveKeywords = [
            '京东',
            '支付宝',
            '微信',
            '立减金',
            '红包'
        ];
        // If one contains an exclusive keyword that the other doesn't, they are NOT similar
        for (const kw of exclusiveKeywords){
            if (s1.includes(kw) !== s2.includes(kw)) return false;
        }
        // If one is a substantial substring of another, they match
        // e.g. "星巴克买一送一" and "星巴克周一买一送一"
        if (s1.length >= 4 && s2.length >= 4) {
            if (s1.includes(s2) || s2.includes(s1)) return true;
        }
        return false;
    };
    // Helper to merge two benefits
    // 中文说明：合并两个权益的辅助函数，优先保留更详细的信息
    const mergeBenefits = (existing, incoming)=>{
        const isBetter = (newVal, oldVal)=>{
            if (!newVal || newVal === 'None' || newVal.trim() === '') return false;
            if (!oldVal || oldVal === 'None' || oldVal.trim() === '') return true;
            return newVal.length > oldVal.length;
        };
        // If incoming has a specific validity and existing doesn't, or incoming's is longer/more detailed
        const mergedValidity = isBetter(incoming.validity, existing.validity) ? incoming.validity : existing.validity;
        const mergedValue = isBetter(incoming.value, existing.value) ? incoming.value : existing.value;
        return {
            ...existing,
            category: incoming.category !== 'Other' && incoming.category !== '其它' ? incoming.category : existing.category,
            description: isBetter(incoming.description, existing.description) ? incoming.description : existing.description,
            validity: mergedValidity,
            usageCondition: isBetter(incoming.usageCondition, existing.usageCondition) ? incoming.usageCondition : existing.usageCondition,
            value: mergedValue,
            terms: isBetter(incoming.terms, existing.terms) ? incoming.terms : existing.terms
        };
    };
    const addBenefit = (benefit)=>{
        setBenefits((prev)=>{
            const normalizedBank = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$bankUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeBankName"])(benefit.bank);
            const normalizedCard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cardUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeCardName"])(benefit.cardName);
            const benefitWithNormalized = {
                ...benefit,
                title: benefit.title || '无标题权益',
                bank: normalizedBank,
                cardName: normalizedCard,
                id: benefit.id || crypto.randomUUID()
            };
            const existingIndex = prev.findIndex((b)=>b.bank === benefitWithNormalized.bank && b.cardName === benefitWithNormalized.cardName && areTitlesSimilar(b.title, benefitWithNormalized.title));
            if (existingIndex >= 0) {
                const updated = [
                    ...prev
                ];
                updated[existingIndex] = mergeBenefits(updated[existingIndex], benefitWithNormalized);
                return updated;
            }
            return [
                ...prev,
                benefitWithNormalized
            ];
        });
    };
    const addBenefits = (newBenefits)=>{
        setBenefits((prev)=>{
            let currentBenefits = [
                ...prev
            ];
            newBenefits.forEach((incomingB)=>{
                const normalizedBank = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$bankUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeBankName"])(incomingB.bank);
                const normalizedCard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cardUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeCardName"])(incomingB.cardName);
                const newB = {
                    ...incomingB,
                    title: incomingB.title || '无标题权益',
                    bank: normalizedBank,
                    cardName: normalizedCard,
                    id: incomingB.id || crypto.randomUUID()
                };
                const existingIndex = currentBenefits.findIndex((b)=>b.bank === newB.bank && b.cardName === newB.cardName && areTitlesSimilar(b.title, newB.title));
                if (existingIndex >= 0) {
                    currentBenefits[existingIndex] = mergeBenefits(currentBenefits[existingIndex], newB);
                } else {
                    currentBenefits.push(newB);
                }
            });
            return currentBenefits;
        });
    };
    const replaceBenefits = (newBenefits)=>{
        const processed = (newBenefits || []).map((b)=>({
                ...b,
                title: b.title || '无标题权益',
                bank: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$bankUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeBankName"])(b.bank),
                cardName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$cardUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeCardName"])(b.cardName),
                id: b.id || crypto.randomUUID()
            }));
        setBenefits(processed);
    };
    const deleteBenefit = (id)=>{
        setBenefits((prev)=>prev.filter((b)=>b.id !== id));
    };
    const updateBenefit = (id, updates)=>{
        setBenefits((prev)=>prev.map((b)=>b.id === id ? {
                    ...b,
                    ...updates
                } : b));
    };
    const duplicateBenefit = (id)=>{
        const original = benefits.find((b)=>b.id === id);
        if (!original) return null;
        const copy = {
            ...original,
            id: crypto.randomUUID(),
            title: `${original.title} (Copy)`,
            isCompleted: false
        };
        setBenefits((prev)=>[
                ...prev,
                copy
            ]);
        return copy;
    };
    const clearAllBenefits = ()=>{
        if (confirm('Are you sure you want to clear all benefits? This action cannot be undone.')) {
            setBenefits([]);
        }
    };
    const getBackups = async ()=>{
        try {
            const res = await fetch('/api/db?type=backups');
            if (res.ok) return await res.json();
        } catch (e) {
            console.error('Failed to fetch backups:', e);
        }
        return [];
    };
    const restoreFromBackup = async (name)=>{
        try {
            const res = await fetch(`/api/db?type=backup&name=${encodeURIComponent(name)}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    replaceBenefits(data);
                    return true;
                }
            }
        } catch (e) {
            console.error('Failed to restore backup:', e);
        }
        return false;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BenefitContext.Provider, {
        value: {
            benefits,
            addBenefit,
            deleteBenefit,
            updateBenefit,
            duplicateBenefit,
            addBenefits,
            replaceBenefits,
            clearAllBenefits,
            getBackups,
            restoreFromBackup
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/BenefitContext.tsx",
        lineNumber: 265,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
const useBenefits = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(BenefitContext);
    if (context === undefined) {
        throw new Error('useBenefits must be used within a BenefitProvider');
    }
    return context;
};
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__51a8f5aa._.js.map