import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Benefit, BenefitCategory, CATEGORY_LABELS, getCardColor } from "@/types";
import { Trash2, Edit2, Copy, Plane, Utensils, ShoppingBag, Shield, Zap, Circle, ArrowUpDown, Car, Heart } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CategoryColorsLight, CategoryIconComponents } from "./constants";

interface BenefitTableProps {
    benefits: Benefit[];
    onDelete: (id: string) => void;
    onEdit: (benefit: Benefit) => void;
    onDuplicate: (id: string) => void;
    onToggleComplete?: (id: string, completed: boolean) => void;
    onCardClick?: (cardName: string) => void;
}



// ... keep imports ...

// Helper type for the props if not exported from constants (it isn't, but BenefitCategory is in types)
// removing local definitions


export const BenefitTable: React.FC<BenefitTableProps> = ({ benefits, onDelete, onEdit, onDuplicate, onToggleComplete, onCardClick }) => {
    const [sortField, setSortField] = useState<keyof Benefit | 'validityDate' | 'isCompleted'>('isCompleted');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    if (benefits.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
                <p className="text-slate-400">暂无匹配权益</p>
            </div>
        );
    }

    // Helper to parse date from validity string
    const extractDate = (dateStr?: string): number => {
        if (!dateStr) return Infinity; // No date -> end of list

        // Match YYYY followed by separators and MM, DD
        // Supports: 2024-12-31, 2024/12/31, 2024.12.31, 2024年12月31日
        const match = dateStr.match(/(\d{4})[.\-\/年](\d{1,2})[.\-\/月](\d{1,2})/);

        if (match) {
            return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3])).getTime();
        }
        return Infinity;
    };

    // Sort and Sink Logic
    const sortedBenefits = [...benefits].sort((a, b) => {
        // Always sink completed items to the bottom first
        if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1;
        }

        let comparison = 0;
        switch (sortField) {
            case 'validityDate':
                comparison = extractDate(a.validity) - extractDate(b.validity);
                break;
            case 'value':
                // Simple numeric extraction for sorting
                const valA = parseFloat((a.value || '').replace(/[^0-9.-]+/g, "")) || 0;
                const valB = parseFloat((b.value || '').replace(/[^0-9.-]+/g, "")) || 0;
                comparison = valA - valB;
                break;
            case 'bank':
            case 'cardName':
            case 'title':
            case 'category':
                // Use localeCompare for Chinese Pinyin sorting
                const strA = (a[sortField] || '').toString();
                const strB = (b[sortField] || '').toString();
                comparison = strA.localeCompare(strB, 'zh-CN');
                break;
            default:
                // Default fallback
                comparison = 0;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    const handleSort = (field: keyof Benefit | 'validityDate') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const SortIcon = ({ field }: { field: keyof Benefit | 'validityDate' }) => (
        <ArrowUpDown className={`ml-2 h-3 w-3 inline-block transition-opacity ${sortField === field ? 'opacity-100 text-blue-600' : 'opacity-30'}`} />
    );

    return (
        <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="w-[80px] text-center whitespace-nowrap">已完成</TableHead>
                        <TableHead className="cursor-pointer hover:bg-slate-100 w-[70px] whitespace-nowrap" onClick={() => handleSort('bank')}>
                            银行 <SortIcon field="bank" />
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-slate-100 w-[110px] whitespace-nowrap" onClick={() => handleSort('cardName')}>
                            卡片 <SortIcon field="cardName" />
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-slate-100 min-w-[200px] max-w-[280px]" onClick={() => handleSort('title')}>
                            权益内容 <SortIcon field="title" />
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-slate-100 w-[80px] whitespace-nowrap" onClick={() => handleSort('category')}>
                            分类 <SortIcon field="category" />
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-slate-100 w-[80px] whitespace-nowrap" onClick={() => handleSort('value')}>
                            价值 <SortIcon field="value" />
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-slate-100 w-[100px] whitespace-nowrap" onClick={() => handleSort('validityDate')}>
                            有效期 <SortIcon field="validityDate" />
                        </TableHead>
                        <TableHead className="text-right w-[120px] whitespace-nowrap">操作</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedBenefits.map((benefit) => (
                        <TableRow key={benefit.id} className={`group ${benefit.isCompleted ? 'bg-slate-50/50' : 'hover:bg-slate-50/50'}`}>
                            <TableCell className="text-center">
                                <Checkbox
                                    checked={benefit.isCompleted}
                                    onCheckedChange={(checked) => onToggleComplete?.(benefit.id, !!checked)}
                                    className="data-[state=checked]:bg-slate-300 data-[state=checked]:border-slate-300"
                                />
                            </TableCell>
                            <TableCell className={`font-medium text-[10px] ${benefit.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                {benefit.bank}
                            </TableCell>
                            <TableCell className={benefit.isCompleted ? 'text-slate-400 line-through' : ''}>
                                <div className="flex flex-col items-start gap-1">
                                    {(benefit.cardName || '').split(/[，,、]/).filter(Boolean).map((name, idx) => (
                                        <span
                                            key={idx}
                                            className={`px-1.5 py-0.5 rounded text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${benefit.isCompleted
                                                ? 'bg-slate-100 text-slate-400'
                                                : `${getCardColor(name.trim())} hover:opacity-80`
                                                }`}
                                            onClick={() => !benefit.isCompleted && onCardClick?.(name.trim())}
                                            title="点击筛选此卡片权益"
                                        >
                                            {name.trim()}
                                        </span>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell className={`max-w-[280px] break-words ${benefit.isCompleted ? 'text-slate-400' : ''}`}>
                                <div className="space-y-1 py-1">
                                    <div className={`font-medium leading-snug ${benefit.isCompleted ? 'line-through' : ''}`}>{benefit.title}</div>
                                    <div className="text-xs text-slate-500 leading-normal whitespace-pre-wrap">{benefit.description}</div>
                                    {benefit.notes && (
                                        <div className="text-[10px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded w-fit italic">
                                            注: {benefit.notes}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="secondary"
                                    className={`${CategoryColorsLight[benefit.category as BenefitCategory] || 'bg-slate-100 text-slate-700 hover:bg-slate-200'} border-0 flex items-center gap-1 w-fit ${benefit.isCompleted ? 'grayscale opacity-50' : ''}`}
                                >
                                    {(() => {
                                        const Icon = CategoryIconComponents[benefit.category as BenefitCategory] || CategoryIconComponents.Other;
                                        return <Icon className="h-3 w-3" />;
                                    })()}
                                    {CATEGORY_LABELS[benefit.category] || benefit.category}
                                </Badge>
                            </TableCell>
                            <TableCell className={`text-slate-600 ${benefit.isCompleted ? 'opacity-50' : ''}`}>
                                {benefit.value || '-'}
                            </TableCell>
                            <TableCell className={`text-slate-600 text-xs ${benefit.isCompleted ? 'opacity-50' : ''}`}>
                                {benefit.validity || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className={`flex justify-end gap-1 ${benefit.isCompleted ? 'hidden' : ''}`}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                                        onClick={() => onEdit(benefit)}
                                        title="编辑"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-blue-600"
                                        onClick={() => onDuplicate(benefit.id)}
                                        title="复制一份"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-red-600"
                                        onClick={() => onDelete(benefit.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div >
    );
};
