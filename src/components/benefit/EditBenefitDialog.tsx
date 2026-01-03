import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Benefit, BenefitCategory, CATEGORIES } from "@/types";
import { useBenefits } from '@/context/BenefitContext';

import { validateCardName } from '@/utils/cardUtils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface EditBenefitDialogProps {
    benefit: Benefit | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (benefit: Benefit) => void;
}

export const EditBenefitDialog: React.FC<EditBenefitDialogProps> = ({
    benefit,
    open,
    onOpenChange,
    onSave,
}) => {
    const { allCategories, allCategoryLabels } = useBenefits();
    const [formData, setFormData] = useState<Benefit | null>(null);
    const [customCategory, setCustomCategory] = useState('');
    const [showCustomCategory, setShowCustomCategory] = useState(false);

    useEffect(() => {
        if (benefit) {
            setFormData({ ...benefit });
            // Check if existing category is in standard list
            if (benefit.category && !CATEGORIES.includes(benefit.category)) {
                setShowCustomCategory(true);
                setCustomCategory(benefit.category);
            } else {
                setShowCustomCategory(false);
                setCustomCategory('');
            }
        }
    }, [benefit]);

    if (!formData) return null;

    const handleChange = (field: keyof Benefit, value: string) => {
        setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
    };

    const handleCategoryChange = (v: string) => {
        if (v === 'custom') {
            setShowCustomCategory(true);
        } else {
            setShowCustomCategory(false);
            handleChange('category', v);
        }
    };

    const handleSave = () => {
        if (formData) {
            const finalData = {
                ...formData,
                category: showCustomCategory ? customCategory : formData.category
            };
            onSave(finalData);
            onOpenChange(false);
        }
    };

    const validation = validateCardName(formData.cardName);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Benefit (编辑权益)</DialogTitle>
                    <DialogDescription>
                        Update the details for this credit card benefit.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-bank">Bank (银行)</Label>
                            <Input
                                id="edit-bank"
                                value={formData.bank}
                                onChange={(e) => handleChange('bank', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="edit-cardName">Card Name (卡名/官方全称)</Label>
                                {validation.isValid ? (
                                    <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold">
                                        <CheckCircle2 className="h-3 w-3" />
                                        <span>官方全称</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold">
                                        <AlertCircle className="h-3 w-3" />
                                        <span>非标准名称</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Input
                                    id="edit-cardName"
                                    value={formData.cardName}
                                    onChange={(e) => handleChange('cardName', e.target.value)}
                                    className={!validation.isValid ? "border-amber-200 focus-visible:ring-amber-500" : ""}
                                />
                                {!validation.isValid && validation.suggestion && (
                                    <button
                                        type="button"
                                        onClick={() => handleChange('cardName', validation.suggestion!)}
                                        className="text-[10px] text-blue-600 hover:underline font-medium"
                                    >
                                        推荐使用官方名: {validation.suggestion}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-title">Benefit Title (权益名称)</Label>
                        <Input
                            id="edit-title"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-category">Category (分类)</Label>
                            <Select
                                value={showCustomCategory ? 'custom' : formData.category}
                                onValueChange={handleCategoryChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allCategories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>{allCategoryLabels[cat] || cat}</SelectItem>
                                    ))}
                                    <SelectItem value="custom" className="text-blue-600 font-medium">+ 自定义分类</SelectItem>
                                </SelectContent>
                            </Select>
                            {showCustomCategory && (
                                <Input
                                    placeholder="输入新分类名称"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    className="h-8 text-xs mt-1 animate-in fade-in slide-in-from-top-1"
                                    autoFocus
                                />
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-value">Estimated Value (金额/价值)</Label>
                            <Input
                                id="edit-value"
                                value={formData.value || ''}
                                onChange={(e) => handleChange('value', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description (权益内容)</Label>
                        <Textarea
                            id="edit-description"
                            className="min-h-[100px]"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-validity">Validity (时效)</Label>
                            <Input
                                id="edit-validity"
                                value={formData.validity || ''}
                                onChange={(e) => handleChange('validity', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-condition">Condition (获取条件)</Label>
                            <Input
                                id="edit-condition"
                                value={formData.usageCondition || ''}
                                onChange={(e) => handleChange('usageCondition', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-terms">Terms & Rules (条款说明)</Label>
                        <Textarea
                            id="edit-terms"
                            value={formData.terms || ''}
                            onChange={(e) => handleChange('terms', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-notes">Notes (备注 - 仅手动编辑)</Label>
                        <Textarea
                            id="edit-notes"
                            placeholder="Add your personal notes or reminders here..."
                            value={formData.notes || ''}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            className="border-blue-100 bg-blue-50/20"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
