import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Benefit, BenefitCategory, CATEGORY_LABELS, getCardColor } from '@/types';
import { Plane, Utensils, ShoppingBag, Shield, Zap, Circle, Trash2, Edit2, Copy, CheckCircle2, Car, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CategoryColorsSolid, CategoryIconComponents } from "./constants";

interface BenefitCardProps {
    benefit: Benefit;
    onDelete?: (id: string) => void;
    onEdit?: (benefit: Benefit) => void;
    onDuplicate?: (id: string) => void;
    onToggleComplete?: (id: string, completed: boolean) => void;
    onCardClick?: (cardName: string) => void;
}



// ... constants replaced ...


export const BenefitCard: React.FC<BenefitCardProps> = ({ benefit, onDelete, onEdit, onDuplicate, onToggleComplete, onCardClick }) => {
    return (
        <Card className={`flex flex-col h-full transition-all duration-300 relative group overflow-hidden ${benefit.isCompleted
            ? 'bg-slate-50/80 border-slate-100 shadow-none'
            : 'hover:shadow-lg hover:-translate-y-1'
            }`}>
            {benefit.isCompleted && (
                <div className="absolute top-0 right-0 p-1 bg-emerald-500 text-white rounded-bl-lg z-10">
                    <CheckCircle2 className="h-3 w-3" />
                </div>
            )}
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex items-start gap-3 flex-grow">
                        <Checkbox
                            checked={benefit.isCompleted}
                            onCheckedChange={(checked) => onToggleComplete?.(benefit.id, !!checked)}
                            className="mt-1.5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                        />
                        <div className="flex-grow">
                            <Badge variant="secondary" className={`${CategoryColorsSolid[benefit.category as BenefitCategory] || 'bg-slate-500 hover:bg-slate-600'} text-white border-0 flex gap-1 items-center w-fit mb-1 ${benefit.isCompleted ? 'grayscale opacity-50' : ''}`}>
                                {(() => {
                                    const Icon = CategoryIconComponents[benefit.category as BenefitCategory] || CategoryIconComponents.Other;
                                    return <Icon className="h-4 w-4" />;
                                })()}
                                <span className="text-[10px] font-bold tracking-wider">{CATEGORY_LABELS[benefit.category] || benefit.category}</span>
                            </Badge>
                            <CardTitle className={`text-lg leading-tight ${benefit.isCompleted ? 'line-through text-slate-400' : ''}`}>
                                {benefit.title}
                            </CardTitle>
                            <CardDescription className={`font-medium flex items-center gap-1 ${benefit.isCompleted ? 'text-slate-300' : 'text-slate-700'}`}>
                                <span>{benefit.bank}</span>
                                <span>•</span>
                                <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${benefit.isCompleted
                                        ? 'bg-slate-100 text-slate-400'
                                        : `${getCardColor(benefit.cardName)} hover:opacity-80`
                                        }`}
                                    onClick={(e) => {
                                        if (!benefit.isCompleted && onCardClick) {
                                            e.stopPropagation();
                                            onCardClick(benefit.cardName);
                                        }
                                    }}
                                    title="点击筛选此卡片权益"
                                >
                                    {benefit.cardName}
                                </span>
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {benefit.value && benefit.value !== 'None' && (
                            <Badge variant="outline" className={`text-emerald-600 bg-emerald-50 border-emerald-100 ${benefit.isCompleted ? 'opacity-30' : ''}`}>
                                {benefit.value}
                            </Badge>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-blue-500 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); onDuplicate?.(benefit.id); }}
                            title="复制权益"
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); onEdit?.(benefit); }}
                            title="编辑权益"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); onDelete?.(benefit.id); }}
                            title="删除权益"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className={`flex-grow space-y-4 pt-1 ${benefit.isCompleted ? 'opacity-40' : ''}`}>
                <p className={`text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium ${benefit.isCompleted ? 'line-through text-slate-400' : ''}`}>
                    {benefit.description}
                </p>

                <div className="grid grid-cols-1 gap-3 py-3 border-t border-slate-100">
                    {benefit.usageCondition && benefit.usageCondition !== 'None' && (
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">条件</span>
                            <p className="text-xs font-semibold text-indigo-700 bg-indigo-50/50 px-2 by-1.5 rounded border border-indigo-100/30">
                                {benefit.usageCondition}
                            </p>
                        </div>
                    )}
                    {benefit.validity && benefit.validity !== 'None' && (
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">有效期</span>
                            <p className="text-xs text-slate-700 font-medium">
                                {benefit.validity}
                            </p>
                        </div>
                    )}
                    {benefit.notes && benefit.notes !== 'None' && (
                        <div className="flex flex-col gap-1 p-2.5 bg-amber-50/50 rounded-lg border border-amber-100/50 mt-1">
                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">备注</span>
                            <p className="text-xs text-amber-900 font-medium leading-relaxed">
                                {benefit.notes}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
            {benefit.terms && benefit.terms !== 'None' && (
                <CardFooter className="pt-0">
                    <p className="text-[10px] text-slate-500 font-medium w-full border-t border-dashed pt-2">
                        条款: {benefit.terms}
                    </p>
                </CardFooter>
            )}
        </Card>
    );
};
