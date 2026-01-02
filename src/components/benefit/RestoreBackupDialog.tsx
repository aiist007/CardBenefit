'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useBenefits } from '@/context/BenefitContext';
import { RotateCcw, Clock, HardDrive, Loader2, AlertTriangle } from 'lucide-react';

interface RestoreBackupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const RestoreBackupDialog = ({ open, onOpenChange }: RestoreBackupDialogProps) => {
    const { getBackups, restoreFromBackup } = useBenefits();
    const [backups, setBackups] = useState<{ name: string, time: number, size: number }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRestoring, setIsRestoring] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            loadBackups();
        }
    }, [open]);

    const loadBackups = async () => {
        setIsLoading(true);
        const data = await getBackups();
        setBackups(data);
        setIsLoading(false);
    };

    const handleRestore = async (name: string) => {
        if (confirm('确定要恢复到此版本吗？这将覆盖当前所有数据。')) {
            setIsRestoring(name);
            const success = await restoreFromBackup(name);
            if (success) {
                alert('数据恢复成功！');
                onOpenChange(false);
            } else {
                alert('恢复失败，请稍后重试。');
            }
            setIsRestoring(null);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-6 bg-red-600 text-white">
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <RotateCcw className="h-6 w-6" />
                        系统紧急恢复
                    </DialogTitle>
                    <DialogDescription className="text-red-100 mt-2">
                        从自动保存的快照中选择一个版本进行回滚。
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 bg-white">
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg mb-4 text-amber-800 text-sm">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>恢复快照将替换当前数据库中的<strong>所有内容</strong>，请谨慎操作。</span>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-100">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                <p>正在获取备份列表...</p>
                            </div>
                        ) : backups.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                <HardDrive className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>暂无可用备份快照</p>
                            </div>
                        ) : (
                            backups.map((backup) => (
                                <div
                                    key={backup.name}
                                    className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-red-200 hover:bg-red-50/30 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800">{formatDate(backup.time)}</div>
                                            <div className="text-xs text-slate-400 flex gap-2">
                                                <span>{formatSize(backup.size)}</span>
                                                <span>•</span>
                                                <span className="truncate max-w-[150px]">{backup.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRestore(backup.name)}
                                        disabled={isRestoring !== null}
                                        className="rounded-lg border-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all font-bold"
                                    >
                                        {isRestoring === backup.name ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : '恢复此版本'}
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-500 font-medium">
                        取消
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
