'use client';

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Benefit } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ComparisonTableProps {
    benefits: Benefit[];
    selectedCardNames?: string[]; // If filtering by card
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ benefits }) => {
    // Group by card name
    const benefitsByCard = benefits.reduce((acc, benefit) => {
        if (!acc[benefit.cardName]) {
            acc[benefit.cardName] = [];
        }
        acc[benefit.cardName].push(benefit);
        return acc;
    }, {} as Record<string, Benefit[]>);

    const cardNames = Object.keys(benefitsByCard);

    if (cardNames.length === 0) {
        return <div className="p-4 text-center text-slate-500">No data to compare.</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Card Comparison</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Card Name</TableHead>
                                <TableHead>Travel</TableHead>
                                <TableHead>Dining</TableHead>
                                <TableHead>Shopping</TableHead>
                                <TableHead>Other</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cardNames.map((card) => {
                                const cardBenefits = benefitsByCard[card];
                                const travel = cardBenefits.filter(b => b.category === 'Travel');
                                const dining = cardBenefits.filter(b => b.category === 'Dining');
                                const shopping = cardBenefits.filter(b => b.category === 'Shopping');
                                const other = cardBenefits.filter(b => !['Travel', 'Dining', 'Shopping'].includes(b.category));

                                return (
                                    <TableRow key={card}>
                                        <TableCell className="font-medium">{card}</TableCell>
                                        <TableCell>
                                            <ul className="list-disc pl-4 text-sm space-y-1">
                                                {travel.map(b => <li key={b.id} title={b.description}>{b.title}</li>)}
                                            </ul>
                                        </TableCell>
                                        <TableCell>
                                            <ul className="list-disc pl-4 text-sm space-y-1">
                                                {dining.map(b => <li key={b.id} title={b.description}>{b.title}</li>)}
                                            </ul>
                                        </TableCell>
                                        <TableCell>
                                            <ul className="list-disc pl-4 text-sm space-y-1">
                                                {shopping.map(b => <li key={b.id} title={b.description}>{b.title}</li>)}
                                            </ul>
                                        </TableCell>
                                        <TableCell>
                                            <ul className="list-disc pl-4 text-sm space-y-1">
                                                {other.map(b => <li key={b.id} title={b.description}>{b.title}</li>)}
                                            </ul>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};
