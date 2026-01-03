'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Benefit, CATEGORIES, CATEGORY_LABELS } from '@/types';
import { normalizeBankName } from '@/utils/bankUtils';
import { normalizeCardName } from '@/utils/cardUtils';

interface BenefitContextType {
    benefits: Benefit[];
    addBenefit: (benefit: Benefit) => void;
    deleteBenefit: (id: string) => void;
    updateBenefit: (id: string, updates: Partial<Benefit>) => void;
    duplicateBenefit: (id: string) => Benefit | null;
    addBenefits: (newBenefits: Benefit[]) => void;
    replaceBenefits: (benefits: Benefit[]) => void;
    clearAllBenefits: () => void;
    getBackups: () => Promise<{ name: string, time: number, size: number }[]>;
    restoreFromBackup: (name: string) => Promise<boolean>;
    allCategories: string[];
    allCategoryLabels: Record<string, string>;
    consolidateAll: () => void;
}

const BenefitContext = createContext<BenefitContextType | undefined>(undefined);

export const BenefitProvider = ({ children }: { children: React.ReactNode }) => {
    const [benefits, setBenefits] = useState<Benefit[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Try to load from JSON DB first
                const response = await fetch('/api/db');
                const dbData = await response.json();

                if (Array.isArray(dbData) && dbData.length > 0) {
                    // Apply dynamic re-mapping on load for data sanity
                    const migrated = dbData.map(remapBenefitCategory);
                    setBenefits(migrated);
                    // Clear old localStorage migration flag if it exists
                    localStorage.removeItem('cc_migration_v2');
                    localStorage.removeItem('cc_benefits');
                } else {
                    // 2. If DB is empty, check localStorage for migration
                    const stored = localStorage.getItem('cc_benefits');
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        const processed = parsed.map((b: Benefit) => ({
                            ...b,
                            id: b.id || crypto.randomUUID()
                        }));

                        // Migrate to JSON DB
                        await fetch('/api/db', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
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
            } finally {
                setIsLoaded(true);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        if (isLoaded) {
            // Save to JSON DB whenever benefits change
            const saveData = async () => {
                try {
                    await fetch('/api/db', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(benefits)
                    });
                } catch (e) {
                    console.error('Failed to save to JSON DB:', e);
                }
            };
            saveData();
        }
    }, [benefits, isLoaded]);

    // Automatic category re-mapping based on content keywords
    // 中文说明：根据内容关键字自动重新映射分类（如：积分 -> 旅行，年费 -> 年费）
    const remapBenefitCategory = (benefit: Benefit): Benefit => {
        const content = `${benefit.title} ${benefit.description} ${benefit.usageCondition} ${benefit.value}`.toLowerCase();

        // 1. Annual Fee mapping
        if (content.includes('年费')) {
            return { ...benefit, category: 'AnnualFee' };
        }

        // 2. Points mapping (if originally Other or Travel is requested)
        if (content.includes('积分')) {
            // User specifically asked to move points to Travel
            return { ...benefit, category: 'Travel' };
        }

        // 4. Force fix specific card name issues (e.g., Huaxia UP Platinum Card)
        if (benefit.bank === '华夏' && benefit.cardName === '白金卡') {
            return { ...benefit, cardName: '华夏银行UP信用卡白金卡' };
        }

        return benefit;
    };

    // Helper to check if two benefit titles are effectively the same
    // 中文说明：检查两个权益标题是否实质上相同（模糊匹配）
    const areTitlesSimilar = (t1: string, t2: string): boolean => {
        const clean = (s: string) => s.toLowerCase()
            .replace(/[活动优惠权益礼遇卡片]/g, '')
            .replace(/\s+/g, '')
            .trim();

        const s1 = clean(t1);
        const s2 = clean(t2);
        if (s1 === s2 && s1.length > 0) return true;

        // Common keywords to ignore for similarity but important for identity
        const exclusiveKeywords = ['京东', '支付宝', '微信', '立减金', '红包', '云闪付', '返现'];

        for (const kw of exclusiveKeywords) {
            if (s1.includes(kw) !== s2.includes(kw)) return false;
        }

        if (s1.length >= 3 && s2.length >= 3) {
            if (s1.includes(s2) || s2.includes(s1)) return true;
        }

        return false;
    };

    // Helper to merge two benefits
    // 中文说明：合并两个权益的辅助函数，优先保留更详细的信息
    const mergeBenefits = (existing: Benefit, incoming: Benefit): Benefit => {
        const synthesize = (oldStr: string = '', newStr: string = '', separator = ' | ') => {
            const cleanOld = (oldStr || '').trim();
            const cleanNew = (newStr || '').trim();
            if (!cleanNew || cleanNew === 'None' || cleanNew === cleanOld) return cleanOld;
            if (!cleanOld || cleanOld === 'None') return cleanNew;

            // If one contains the other, pick the longer one
            if (cleanOld.includes(cleanNew)) return cleanOld;
            if (cleanNew.includes(cleanOld)) return cleanNew;

            // Otherwise, combine them intelligently
            return `${cleanOld}${separator}${cleanNew}`;
        };

        return {
            ...existing,
            title: existing.title.length >= incoming.title.length ? existing.title : incoming.title,
            category: incoming.category !== 'Other' && incoming.category !== '其它' ? incoming.category : existing.category,
            description: synthesize(existing.description, incoming.description, '\n此外：'),
            validity: synthesize(existing.validity, incoming.validity),
            usageCondition: synthesize(existing.usageCondition, incoming.usageCondition, '；'),
            value: synthesize(existing.value, incoming.value),
            terms: synthesize(existing.terms, incoming.terms, '\n补充细则：'),
        };
    };

    const addBenefit = (benefit: Benefit) => {
        setBenefits((prev) => {
            const normalizedBank = normalizeBankName(benefit.bank);
            const normalizedCard = normalizeCardName(benefit.cardName);
            const benefitWithNormalized = {
                ...benefit,
                title: benefit.title || '无标题权益',
                bank: normalizedBank,
                cardName: normalizedCard,
                id: benefit.id || crypto.randomUUID()
            };

            const remapped = remapBenefitCategory(benefitWithNormalized);

            const existingIndex = prev.findIndex(b =>
                b.bank === remapped.bank &&
                b.cardName === remapped.cardName &&
                areTitlesSimilar(b.title, remapped.title)
            );

            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = mergeBenefits(updated[existingIndex], remapped);
                return updated;
            }
            return [...prev, remapped];
        });
    };

    const addBenefits = (newBenefits: Benefit[]) => {
        setBenefits((prev) => {
            let currentBenefits = [...prev];

            newBenefits.forEach(incomingB => {
                const normalizedBank = normalizeBankName(incomingB.bank);
                const normalizedCard = normalizeCardName(incomingB.cardName);
                const newB = {
                    ...incomingB,
                    title: incomingB.title || '无标题权益',
                    bank: normalizedBank,
                    cardName: normalizedCard,
                    id: incomingB.id || crypto.randomUUID()
                };

                const remapped = remapBenefitCategory(newB);

                const existingIndex = currentBenefits.findIndex(b =>
                    b.bank === remapped.bank &&
                    b.cardName === remapped.cardName &&
                    areTitlesSimilar(b.title, remapped.title)
                );

                if (existingIndex >= 0) {
                    currentBenefits[existingIndex] = mergeBenefits(currentBenefits[existingIndex], remapped);
                } else {
                    currentBenefits.push(remapped);
                }
            });

            return currentBenefits;
        });

        // Ensure consistency after bulk add
        setTimeout(consolidateAll, 100);
    };

    // Full sweep to re-normalize and merge all benefits in the current state
    // 中文说明：对当前所有权益进行全量重新规范化并合并重复项（深度清理）
    const consolidateAll = () => {
        setBenefits((prev) => {
            const consolidated: Benefit[] = [];

            prev.forEach(item => {
                const normalizedBank = normalizeBankName(item.bank);
                const normalizedCard = normalizeCardName(item.cardName);
                const itemWithNormalized = {
                    ...item,
                    bank: normalizedBank,
                    cardName: normalizedCard,
                };

                const remapped = remapBenefitCategory(itemWithNormalized);

                const existingIndex = consolidated.findIndex(b =>
                    b.bank === remapped.bank &&
                    b.cardName === remapped.cardName &&
                    areTitlesSimilar(b.title, remapped.title)
                );

                if (existingIndex >= 0) {
                    consolidated[existingIndex] = mergeBenefits(consolidated[existingIndex], remapped);
                } else {
                    consolidated.push(remapped);
                }
            });

            return consolidated;
        });
    };

    const replaceBenefits = (newBenefits: Benefit[]) => {
        const processed = (newBenefits || []).map(b => ({
            ...b,
            title: b.title || '无标题权益',
            bank: normalizeBankName(b.bank),
            cardName: normalizeCardName(b.cardName),
            id: b.id || crypto.randomUUID()
        }));
        setBenefits(processed);

        // Ensure consistency after replacement
        setTimeout(consolidateAll, 100);
    };

    const deleteBenefit = (id: string) => {
        setBenefits((prev) => prev.filter((b) => b.id !== id));
    };

    const updateBenefit = (id: string, updates: Partial<Benefit>) => {
        setBenefits((prev) => prev.map((b) => {
            if (b.id === id) {
                const updated = { ...b, ...updates };
                return remapBenefitCategory(updated);
            }
            return b;
        }));
    };

    const duplicateBenefit = (id: string): Benefit | null => {
        const original = benefits.find(b => b.id === id);
        if (!original) return null;

        const copy: Benefit = {
            ...original,
            id: crypto.randomUUID(),
            title: `${original.title} (Copy)`,
            isCompleted: false, // Reset completion status for copy
        };

        setBenefits(prev => [...prev, copy]);
        return copy;
    };

    const clearAllBenefits = () => {
        if (confirm('Are you sure you want to clear all benefits? This action cannot be undone.')) {
            setBenefits([]);
        }
    };

    const getBackups = async () => {
        try {
            const res = await fetch('/api/db?type=backups');
            if (res.ok) return await res.json();
        } catch (e) {
            console.error('Failed to fetch backups:', e);
        }
        return [];
    };

    const restoreFromBackup = async (name: string) => {
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

    // Calculate dynamic categories and labels
    // 中文说明：通过合并标准分类和权益中出现的自定义分类，生成动态分类列表
    const allCategories = useMemo(() => {
        const customCategories = benefits
            .map(b => b.category)
            .filter(cat => cat && !CATEGORIES.includes(cat));

        // Use Set for deduplication, then combine with standard categories
        const uniqueCustom = Array.from(new Set(customCategories));
        // Keep "Other" at the end if possible, or just append custom after standard but before "Other"
        const standardWithoutOther = CATEGORIES.filter(c => c !== 'Other');
        const hasOther = CATEGORIES.includes('Other');

        return [...standardWithoutOther, ...uniqueCustom, ...(hasOther ? ['Other'] : [])];
    }, [benefits]);

    const allCategoryLabels = useMemo(() => {
        const labels = { ...CATEGORY_LABELS };
        allCategories.forEach(cat => {
            if (!labels[cat]) {
                labels[cat] = cat; // For custom categories, use the name as label
            }
        });
        return labels;
    }, [allCategories]);

    return (
        <BenefitContext.Provider value={{
            benefits,
            addBenefit,
            deleteBenefit,
            updateBenefit,
            duplicateBenefit,
            addBenefits,
            replaceBenefits,
            clearAllBenefits,
            getBackups,
            restoreFromBackup,
            allCategories,
            allCategoryLabels,
            consolidateAll
        }}>
            {children}
        </BenefitContext.Provider>
    );
};

export const useBenefits = () => {
    const context = useContext(BenefitContext);
    if (context === undefined) {
        throw new Error('useBenefits must be used within a BenefitProvider');
    }
    return context;
};
