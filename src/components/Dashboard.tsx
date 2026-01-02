'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Benefit, BenefitCategory, CATEGORIES, CATEGORY_LABELS, getCardColor } from '@/types';
import { Search, LayoutGrid, List, CreditCard, Filter, MessageSquare, Send, Loader2, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BenefitTable } from './benefit/BenefitTable';
import { BenefitCard } from './benefit/BenefitCard';
import { AddBenefitForm } from './benefit/AddBenefitForm';
import { EditBenefitDialog } from './benefit/EditBenefitDialog';
import { RestoreBackupDialog } from './benefit/RestoreBackupDialog';
import { useBenefits } from '@/context/BenefitContext';
import { CategoryIconComponents } from './benefit/constants';
import { normalizeBankName } from '@/utils/bankUtils';
import { normalizeCardName } from '@/utils/cardUtils';
import { Globe } from 'lucide-react';

export const Dashboard = () => {
    const { benefits, deleteBenefit, updateBenefit, duplicateBenefit } = useBenefits();
    const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<BenefitCategory[]>([]);
    const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

    // Chat State
    const [chatQuery, setChatQuery] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isChatOpen) {
            scrollToBottom();
        }
    }, [chatHistory, isChatLoading, isChatOpen]);

    const handleChatSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!chatQuery.trim() || isChatLoading) return;

        const newUserMessage = { role: 'user' as const, content: chatQuery };
        const updatedHistory = [...chatHistory, newUserMessage].slice(-16); // Keep last 8 rounds (16 messages)

        setChatHistory(prev => [...prev, newUserMessage]);
        setChatQuery('');
        setIsChatLoading(true);
        setIsChatOpen(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedHistory,
                    contextBenefits: benefits
                })
            });

            const data = await response.json();
            if (data.content) {
                setChatHistory(prev => [...prev, { role: 'assistant', content: data.content }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
        } finally {
            setIsChatLoading(false);
        }
    };

    // Get unique card names and bank names for the header filter
    const uniqueCards = Array.from(new Set(benefits.map(b => b.cardName))).filter(Boolean).sort();
    const uniqueBanks = Array.from(new Set(benefits.map(b => b.bank))).filter(Boolean).sort();
    const uniqueCategories = Array.from(new Set(benefits.map(b => b.category as BenefitCategory))).filter(Boolean).sort((a, b) => {
        // Sort based on CATEGORIES order if possible
        const idxA = CATEGORIES.indexOf(a);
        const idxB = CATEGORIES.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    // Filter benefits based on search and card filter
    const filteredBenefits = benefits.filter(benefit => {
        const query = searchQuery.toLowerCase().trim();
        const normalizedBankQuery = normalizeBankName(query);
        const normalizedCardQuery = normalizeCardName(query);

        const matchesSearch =
            !query ||
            (benefit.title || '').toLowerCase().includes(query) ||
            (benefit.cardName || '').toLowerCase().includes(query) ||
            (benefit.bank || '').toLowerCase().includes(query) ||
            (benefit.category || '').toLowerCase().includes(query) ||
            (benefit.description || '').toLowerCase().includes(query) ||
            // Alias matches
            (normalizedBankQuery !== '其他银行' && benefit.bank === normalizedBankQuery) ||
            (normalizedCardQuery !== '通用卡片' && benefit.cardName === normalizedCardQuery);

        const matchesCard = selectedCards.length === 0 || selectedCards.includes(benefit.cardName);
        const matchesBank = selectedBanks.length === 0 || selectedBanks.includes(benefit.bank);
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(benefit.category as BenefitCategory);

        return matchesSearch && matchesCard && matchesBank && matchesCategory;
    });

    const toggleBankFilter = (bank: string) => {
        setSelectedBanks(prev =>
            prev.includes(bank)
                ? prev.filter(b => b !== bank)
                : [...prev, bank]
        );
    };

    const toggleCardFilter = (card: string) => {
        setSelectedCards(prev =>
            prev.includes(card)
                ? prev.filter(c => c !== card)
                : [...prev, card]
        );
    };

    const toggleCategoryFilter = (category: BenefitCategory) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const resetFilters = () => {
        setSelectedCards([]);
        setSelectedBanks([]);
        setSelectedCategories([]);
    };

    const handleToggleComplete = (id: string, completed: boolean) => {
        updateBenefit(id, { isCompleted: completed });
    };

    const handleDuplicate = (id: string) => {
        const newBenefit = duplicateBenefit(id);
        if (newBenefit) {
            setEditingBenefit(newBenefit);
            setIsDialogOpen(true);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="space-y-6">
                    {/* Top Action Area */}
                    <AddBenefitForm />

                    {/* Redesigned Search & Chat & View Switcher Row */}
                    <div className="flex flex-col lg:flex-row items-stretch gap-3">
                        {/* Search Bar (Shortened) */}
                        <div className="relative w-full lg:w-[35%]">
                            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                                placeholder="搜索权益、银行、卡片..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 h-10 bg-white border-slate-200 focus:border-blue-500 rounded-xl shadow-sm transition-all text-sm"
                            />
                        </div>

                        {/* AI Chat Bar */}
                        <form onSubmit={handleChatSubmit} className="relative flex-grow flex items-center gap-2">
                            <div className="relative flex-grow">
                                <MessageSquare className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                                <Input
                                    placeholder="问问 AI 助手：某张卡有什么权益？怎么用最划算？"
                                    value={chatQuery}
                                    onChange={(e) => setChatQuery(e.target.value)}
                                    className="pl-11 pr-24 h-10 bg-blue-50/30 border-blue-100 focus:border-blue-400 focus:ring-blue-100 rounded-xl shadow-sm transition-all text-sm"
                                />
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                                    {chatHistory.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setIsChatOpen(!isChatOpen)}
                                            className={`p-1.5 rounded-lg transition-colors ${isChatOpen ? 'text-blue-600 bg-blue-100' : 'text-slate-400 hover:bg-slate-100'}`}
                                            title={isChatOpen ? "隐藏对话" : "显示对话"}
                                        >
                                            <List className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={!chatQuery.trim() || isChatLoading}
                                        className="p-1.5 text-blue-500 hover:text-blue-600 disabled:text-slate-300 transition-colors"
                                    >
                                        {isChatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className="flex items-center gap-3 shrink-0">
                            <div className="h-10 px-4 flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm text-xs font-bold text-slate-500 whitespace-nowrap">
                                <span className="text-blue-600 mr-1.5">{filteredBenefits.length}</span> 项结果
                            </div>

                            <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-lg border border-slate-200 shadow-sm">
                                <Button
                                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className={`text-xs font-bold px-3 h-8 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                                >
                                    <List className="h-4 w-4 mr-2" />
                                    列表
                                </Button>
                                <Button
                                    variant={viewMode === 'card' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('card')}
                                    className={`text-xs font-bold px-3 h-8 rounded-md transition-all ${viewMode === 'card' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                                >
                                    <LayoutGrid className="h-4 w-4 mr-2" />
                                    网格
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages Overlay (Optional, or display below) */}
                    {isChatOpen && chatHistory.length > 0 && (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-blue-600 flex items-center gap-2">
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    AI 权益助手
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setChatHistory([]);
                                        setIsChatOpen(false);
                                    }}
                                    className="h-6 text-[10px] text-slate-400 hover:text-rose-500"
                                >
                                    清空对话
                                </Button>
                            </div>
                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-100">
                                {chatHistory.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white border border-blue-100 text-slate-700 rounded-tl-none shadow-sm'
                                            }`}>
                                            {msg.role === 'user' ? (
                                                msg.content
                                            ) : (
                                                <div className="prose prose-sm prose-blue max-w-none 
                                                    prose-p:leading-relaxed prose-p:my-1
                                                    prose-ul:my-1 prose-li:my-0.5
                                                    prose-headings:text-blue-600 prose-headings:my-2
                                                    prose-strong:text-blue-700
                                                    prose-table:border prose-table:border-blue-100 prose-table:my-2
                                                    prose-th:bg-blue-50 prose-th:px-2 prose-th:py-1
                                                    prose-td:px-2 prose-td:py-1">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-blue-100 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm">
                                            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                    )}

                    {/* Filters Panel */}
                    <div className="flex flex-col gap-2.5 px-6 py-4 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
                        {/* Bank Row */}
                        <div className="flex items-start gap-4">
                            <div className="flex items-center gap-2 w-16 shrink-0 pt-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Globe className="h-3 w-3" />
                                    银行
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <Button
                                    variant={selectedBanks.length === 0 ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedBanks([])}
                                    className={`rounded-full px-3.5 h-6 text-xs font-bold transition-all ${selectedBanks.length === 0
                                        ? 'bg-slate-800 text-white hover:bg-slate-900 border-slate-800 shadow-sm'
                                        : 'text-slate-500 border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    全部
                                </Button>
                                {uniqueBanks.map(bank => {
                                    const isActive = selectedBanks.includes(bank);
                                    return (
                                        <Button
                                            key={bank}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleBankFilter(bank)}
                                            className={`rounded-full px-3.5 h-6 text-xs font-bold transition-all border ${isActive
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                                }`}
                                        >
                                            {bank}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Card Row */}
                        <div className="flex items-start gap-4">
                            <div className="flex items-center gap-2 w-16 shrink-0 pt-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <CreditCard className="h-3 w-3" />
                                    卡片
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <Button
                                    variant={selectedCards.length === 0 ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedCards([])}
                                    className={`rounded-full px-3.5 h-6 text-xs font-bold transition-all ${selectedCards.length === 0
                                        ? 'bg-slate-800 text-white hover:bg-slate-900 border-slate-800 shadow-sm'
                                        : 'text-slate-500 border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    全部
                                </Button>
                                {uniqueCards.map(card => {
                                    const colorClass = getCardColor(card);
                                    const isActive = selectedCards.includes(card);
                                    return (
                                        <Button
                                            key={card}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleCardFilter(card)}
                                            className={`rounded-full px-3.5 h-6 text-xs font-bold transition-all border ${isActive
                                                ? `${colorClass} border-current shadow-sm ring-1 ring-current/20`
                                                : `bg-white border-slate-200 text-slate-500 hover:border-slate-300`
                                                }`}
                                        >
                                            {card}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Category Row */}
                        <div className="flex items-start gap-4">
                            <div className="flex items-center gap-2 w-16 shrink-0 pt-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Filter className="h-3 w-3" />
                                    分类
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <Button
                                    variant={selectedCategories.length === 0 ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedCategories([])}
                                    className={`rounded-full px-3.5 h-6 text-xs font-bold transition-all ${selectedCategories.length === 0
                                        ? 'bg-slate-800 text-white hover:bg-slate-900 border-slate-800 shadow-sm'
                                        : 'text-slate-500 border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    全部
                                </Button>
                                {uniqueCategories.map(cat => {
                                    const Icon = CategoryIconComponents[cat] || CategoryIconComponents.Other;
                                    const isActive = selectedCategories.includes(cat);
                                    return (
                                        <Button
                                            key={cat}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleCategoryFilter(cat)}
                                            className={`rounded-full px-3.5 h-6 text-xs font-bold transition-all border ${isActive
                                                ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                                }`}
                                        >
                                            <Icon className="h-3 w-3 mr-1" />
                                            {CATEGORY_LABELS[cat] || cat}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="space-y-6">
                    {/* Filter Banner */}
                    {(selectedCards.length > 0 || selectedCategories.length > 0 || selectedBanks.length > 0) && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center justify-between text-sm text-blue-700 animate-in fade-in slide-in-from-top-1">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                {selectedBanks.length > 0 && (
                                    <span className="flex items-center gap-2">
                                        <span className="font-semibold">已选银行:</span>
                                        <span className="flex gap-1">
                                            {selectedBanks.map(b => (
                                                <span key={b} className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-bold uppercase">{b}</span>
                                            ))}
                                        </span>
                                    </span>
                                )}
                                {selectedCards.length > 0 && (
                                    <span className="flex items-center gap-2">
                                        <span className="font-semibold">已选卡片:</span>
                                        <span className="flex gap-1">
                                            {selectedCards.map(c => (
                                                <span key={c} className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-bold uppercase">{c}</span>
                                            ))}
                                        </span>
                                    </span>
                                )}
                                {selectedCategories.length > 0 && (
                                    <span className="flex items-center gap-2">
                                        <span className="font-semibold">已选分类:</span>
                                        <span className="flex gap-1">
                                            {selectedCategories.map(c => (
                                                <span key={c} className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-bold uppercase">{CATEGORY_LABELS[c] || c}</span>
                                            ))}
                                        </span>
                                    </span>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetFilters}
                                className="h-auto py-1 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 shrink-0"
                            >
                                清除筛选
                            </Button>
                        </div>
                    )}

                    {/* Content List/Grid */}
                    {filteredBenefits.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                            <p className="text-slate-400 text-lg">暂无匹配权益</p>
                            <p className="text-slate-400 text-sm mt-2">请尝试调整搜索或添加新权益</p>
                        </div>
                    ) : (
                        viewMode === 'card' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredBenefits.map((benefit) => (
                                    <BenefitCard
                                        key={benefit.id}
                                        benefit={benefit}
                                        onDelete={deleteBenefit}
                                        onEdit={(b) => {
                                            setEditingBenefit(b);
                                            setIsDialogOpen(true);
                                        }}
                                        onDuplicate={handleDuplicate}
                                        onToggleComplete={handleToggleComplete}
                                        onCardClick={(cardName) => toggleCardFilter(cardName)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <BenefitTable
                                benefits={filteredBenefits}
                                onDelete={deleteBenefit}
                                onEdit={(b) => {
                                    setEditingBenefit(b);
                                    setIsDialogOpen(true);
                                }}
                                onDuplicate={handleDuplicate}
                                onToggleComplete={handleToggleComplete}
                                onCardClick={(cardName) => toggleCardFilter(cardName)}
                            />
                        )
                    )}
                </div>
            </div>

            <EditBenefitDialog
                benefit={editingBenefit}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSave={(updatedBenefit) => {
                    updateBenefit(updatedBenefit.id, updatedBenefit);
                    setIsDialogOpen(false);
                }}
            />

            <RestoreBackupDialog
                open={isRestoreDialogOpen}
                onOpenChange={setIsRestoreDialogOpen}
            />

            {/* 紧急恢复按钮 (Fixed Bottom Right) */}
            <button
                onClick={() => setIsRestoreDialogOpen(true)}
                className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 bg-[#FF0000] hover:bg-red-700 text-white px-5 py-3.5 rounded-full shadow-[0_10px_40px_-10px_rgba(255,0,0,0.5)] transition-all active:scale-95 group font-bold text-sm border-2 border-white/20"
                title="系统紧急恢复 (从自动快照中选择版本)"
            >
                <RotateCcw className="h-5 w-5 transition-transform group-hover:rotate-180 duration-700" />
                <span>紧急恢复</span>
            </button>
        </div>
    );
};
