'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Benefit } from '@/types';
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
                    setBenefits(dbData);
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

    // Helper to check if two benefit titles are effectively the same
    // 中文说明：检查两个权益标题是否实质上相同（模糊匹配）
    const areTitlesSimilar = (t1: string, t2: string): boolean => {
        const s1 = t1.toLowerCase().trim().replace(/\s+/g, '');
        const s2 = t2.toLowerCase().trim().replace(/\s+/g, '');
        if (s1 === s2) return true;

        // Common keywords to ignore for similarity but important for identity
        // 如果包含这些关键词，通常意味着是不同的子活动，不应轻易合并
        const exclusiveKeywords = ['京东', '支付宝', '微信', '立减金', '红包'];

        // If one contains an exclusive keyword that the other doesn't, they are NOT similar
        for (const kw of exclusiveKeywords) {
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
    const mergeBenefits = (existing: Benefit, incoming: Benefit): Benefit => {
        const isBetter = (newVal?: string, oldVal?: string) => {
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
            terms: isBetter(incoming.terms, existing.terms) ? incoming.terms : existing.terms,
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

            const existingIndex = prev.findIndex(b =>
                b.bank === benefitWithNormalized.bank &&
                b.cardName === benefitWithNormalized.cardName &&
                areTitlesSimilar(b.title, benefitWithNormalized.title)
            );

            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = mergeBenefits(updated[existingIndex], benefitWithNormalized);
                return updated;
            }
            return [...prev, benefitWithNormalized];
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

                const existingIndex = currentBenefits.findIndex(b =>
                    b.bank === newB.bank &&
                    b.cardName === newB.cardName &&
                    areTitlesSimilar(b.title, newB.title)
                );

                if (existingIndex >= 0) {
                    currentBenefits[existingIndex] = mergeBenefits(currentBenefits[existingIndex], newB);
                } else {
                    currentBenefits.push(newB);
                }
            });

            return currentBenefits;
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
    };

    const deleteBenefit = (id: string) => {
        setBenefits((prev) => prev.filter((b) => b.id !== id));
    };

    const updateBenefit = (id: string, updates: Partial<Benefit>) => {
        setBenefits((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
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
            restoreFromBackup
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
