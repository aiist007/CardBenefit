'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBenefits } from '@/context/BenefitContext';
import { CATEGORIES, BenefitCategory, CATEGORY_LABELS } from '@/types';
import { Loader2, Sparkles, Globe, Image as ImageIcon, X, ChevronDown, ChevronUp, PenTool, Settings2 } from 'lucide-react';


export const AddBenefitForm = () => {
    const { benefits, addBenefits, replaceBenefits } = useBenefits();
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
                    const { added = [], updated = [], deleted = [] } = data.changeset;

                    // 1. Process deletions
                    deleted.forEach((id: string) => deleteBenefit(id));

                    // 2. Process updates
                    updated.forEach((b: any) => updateBenefit(b.id, b));

                    // 3. Process additions
                    if (added.length > 0) {
                        addBenefits(added);
                    }

                    alert(`AI 指令执行成功！\n- 新增: ${added.length} 项\n- 修改: ${updated.length} 项\n- 删除: ${deleted.length} 项`);
                } else if (data.benefits) {
                    // Extraction mode
                    addBenefits(data.benefits);
                    alert(`AI 提取成功！共找到 ${data.benefits.length} 项权益。`);
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
            </CardContent>
        </Card>
    );
};
