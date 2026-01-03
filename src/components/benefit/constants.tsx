import React from 'react';
import { BenefitCategory } from '@/types';
import { Plane, Utensils, ShoppingBag, Shield, Zap, Circle, Car, Heart, CreditCard, Cake } from 'lucide-react';

export const CategoryIcons: Record<BenefitCategory, React.ReactNode> = {
    Travel: <Plane className="h-3 w-3" />,
    Dining: <Utensils className="h-3 w-3" />,
    Shopping: <ShoppingBag className="h-3 w-3" />,
    Insurance: <Shield className="h-3 w-3" />,
    Lifestyle: <Zap className="h-3 w-3" />,
    Vehicle: <Car className="h-3 w-3" />,
    Health: <Heart className="h-3 w-3" />,
    Birthday: <Cake className="h-3 w-3" />,
    Other: <Circle className="h-3 w-3" />,
};

export const CategoryIconComponents: Record<BenefitCategory, React.ElementType> = {
    Travel: Plane,
    Dining: Utensils,
    Shopping: ShoppingBag,
    Insurance: Shield,
    Lifestyle: Zap,
    Vehicle: Car,
    Health: Heart,
    Birthday: Cake,
    AnnualFee: CreditCard,
    Other: Circle,
};

export const CategoryColors: Record<BenefitCategory, string> = {
    Travel: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    Dining: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    Shopping: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
    Insurance: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    Lifestyle: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    Vehicle: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
    Health: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
    Birthday: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    AnnualFee: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    Other: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
};

export const CategoryColorsLight: Record<BenefitCategory, string> = {
    Travel: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    Dining: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    Shopping: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
    Insurance: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    Lifestyle: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    Vehicle: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
    Health: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
    Birthday: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    AnnualFee: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100',
    Other: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
};

export const CategoryColorsSolid: Record<BenefitCategory, string> = {
    Travel: 'bg-blue-500 hover:bg-blue-600',
    Dining: 'bg-orange-500 hover:bg-orange-600',
    Shopping: 'bg-pink-500 hover:bg-pink-600',
    Insurance: 'bg-emerald-500 hover:bg-emerald-600',
    Lifestyle: 'bg-purple-500 hover:bg-purple-600',
    Vehicle: 'bg-cyan-500 hover:bg-cyan-600',
    Health: 'bg-rose-500 hover:bg-rose-600',
    Birthday: 'bg-amber-500 hover:bg-amber-600',
    AnnualFee: 'bg-indigo-500 hover:bg-indigo-600',
    Other: 'bg-gray-500 hover:bg-gray-600',
};
