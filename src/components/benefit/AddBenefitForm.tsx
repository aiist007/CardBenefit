'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBenefits } from '@/context/BenefitContext';
import { CATEGORIES, BenefitCategory, CATEGORY_LABELS, Benefit } from '@/types';
import { Loader2, Sparkles, Globe, Image as ImageIcon, X, ChevronDown, ChevronUp, PenTool, Settings2, CheckCircle2, AlertCircle, Edit2, Check, RefreshCw } from 'lucide-react';
import { validateCardName } from '@/utils/cardUtils';


export const AddBenefitForm = () => {
    const { benefits, addBenefits, replaceBenefits, deleteBenefit, updateBenefit } = useBenefits();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('处理中');

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            setLoadingText('AI 处理中');
            let seconds = 0;
            interval = setInterval(() => {
                seconds++;
                if (seconds > 2) setLoadingText('正在连接...');
                if (seconds > 8) setLoadingText('读取页面...');
                if (seconds > 15) setLoadingText('启动浏览器...');
                if (seconds > 25) setLoadingText('深度解析...');
                if (seconds > 40) setLoadingText('稍作等待...');
            }, 1000);
        } else {
            setLoadingText('处理中');
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    // Bulk/AI State
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [bulkUrl, setBulkUrl] = useState('');
    const [constraints, setConstraints] = useState('');
    const [draftBenefits, setDraftBenefits] = useState<Benefit[]>([]);
    const [isReviewOpen, setIsReviewOpen] = useState(false);



    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setScreenshot(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBulkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Allow submission if any of screenshot, bulkUrl, or constraints are present
            if (screenshot || bulkUrl || constraints) {
                const response = await fetch('/api/parse', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        screenshot,
                        url: bulkUrl,
                        constraints,
                        benefits: (!bulkUrl && !screenshot) ? benefits : undefined // Only send current state if in command mode
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'AI parsing failed');
                }

                if (data.isCommandMode && data.changeset) {
                    const { added = [], updated = [] } = data.changeset;
                    // For command mode, we show added/updated in drafts for review
                    const combinedDrafts = [...added, ...updated];
                    if (combinedDrafts.length > 0) {
                        setDraftBenefits(combinedDrafts);
                        setIsReviewOpen(true);
                    } else {
                        alert('指令执行成功，无新增或更新项。');
                    }
                } else if (data.benefits) {
                    // Extraction mode
                    setDraftBenefits(data.benefits);
                    setIsReviewOpen(true);
                }
                setBulkUrl('');
                setScreenshot(null);
                setConstraints('');
            } else {
                alert('请提供网页链接、上传截图或输入指令。');
            }
        } catch (error: any) {
            console.error(error);
            alert(`解析失败: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-slate-200/60 shadow-sm overflow-hidden mb-6">
            <CardContent className="p-3">
                <form onSubmit={handleBulkSubmit} className="flex flex-col lg:flex-row items-center gap-3">
                    <div className="flex-shrink-0 flex items-center gap-2 px-2 border-r border-slate-100 mr-1">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        <span className="font-bold text-slate-800 text-sm whitespace-nowrap">添加权益</span>
                    </div>

                    <div className="flex-[1] min-w-[120px] relative">
                        <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                        <Input
                            id="bulkUrl"
                            value={bulkUrl}
                            onChange={(e) => setBulkUrl(e.target.value)}
                            placeholder="粘贴网页链接 (URL)..."
                            className="h-9 pl-8 text-xs bg-slate-50/50 border-slate-100 hover:bg-white focus:bg-white transition-colors"
                        />
                    </div>

                    {!screenshot ? (
                        <div className="flex-shrink-0 relative h-9 px-3 border border-dashed border-slate-200 rounded-md flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer group">
                            <input
                                type="file"
                                id="screenshot"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <ImageIcon className="h-3.5 w-3.5 mr-1.5 text-slate-400 group-hover:text-blue-500" />
                            <span className="text-[11px] text-slate-400 group-hover:text-blue-500 font-medium whitespace-nowrap">截图上传</span>
                        </div>
                    ) : (
                        <div className="flex-shrink-0 relative h-9 w-16 rounded border border-slate-200 overflow-hidden group">
                            <img src={screenshot} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => setScreenshot(null)}
                                className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}

                    <div className="flex-[3] min-w-[200px] relative">
                        <Settings2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                        <Input
                            id="constraints"
                            value={constraints}
                            onChange={(e) => setConstraints(e.target.value)}
                            placeholder="填写提取要求或修改要求"
                            className="h-9 pl-8 text-xs bg-slate-50/50 border-slate-100 hover:bg-white focus:bg-white transition-colors"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 h-9 px-5 font-bold shadow-sm shadow-blue-100 text-xs shrink-0 rounded-md"
                        disabled={isLoading || (!screenshot && !bulkUrl && !constraints)}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                {loadingText}
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                                AI 提交
                            </>
                        )}
                    </Button>
                </form>

                {/* Draft Review Section */}
                {isReviewOpen && draftBenefits.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-800">权益预检 (Review)</h3>
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                    {draftBenefits.length} 项待确认
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsReviewOpen(false)}
                                    className="h-7 text-[11px] text-slate-400 hover:text-slate-600"
                                >
                                    取消
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        addBenefits(draftBenefits);
                                        setDraftBenefits([]);
                                        setIsReviewOpen(false);
                                        alert('已成功保存所有权益！');
                                    }}
                                    className="h-7 text-[11px] bg-green-600 hover:bg-green-700 font-bold"
                                >
                                    确认并保存
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-1">
                            {draftBenefits.map((draft, idx) => {
                                const validation = validateCardName(draft.cardName);
                                return (
                                    <div key={idx} className="group p-2 rounded-lg border border-slate-100 bg-white hover:border-blue-200 transition-all">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-1">
                                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                                        {draft.bank}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 group">
                                                        <Input
                                                            value={draft.cardName}
                                                            onChange={(e) => {
                                                                const updated = [...draftBenefits];
                                                                updated[idx] = { ...updated[idx], cardName: e.target.value };
                                                                setDraftBenefits(updated);
                                                            }}
                                                            className="h-6 w-auto min-w-[120px] text-[11px] font-bold px-1 py-0 border-transparent bg-transparent hover:border-slate-200 focus:border-blue-400 focus:bg-white transition-all"
                                                        />
                                                        {validation.isValid ? (
                                                            <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" title="官方全称已匹配" />
                                                        ) : (
                                                            <div className="flex items-center gap-1">
                                                                <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" title="非标准名称" />
                                                                {validation.suggestion && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const updated = [...draftBenefits];
                                                                            updated[idx] = { ...updated[idx], cardName: validation.suggestion! };
                                                                            setDraftBenefits(updated);
                                                                        }}
                                                                        className="text-[9px] text-blue-500 hover:underline font-medium"
                                                                    >
                                                                        修正为: {validation.suggestion}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-[11px] font-bold text-slate-800 truncate">
                                                    {draft.title}
                                                </div>
                                                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 opacity-80 group-hover:opacity-100">
                                                    {draft.description}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = draftBenefits.filter((_, i) => i !== idx);
                                                    setDraftBenefits(updated);
                                                }}
                                                className="mt-1 p-1 text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
