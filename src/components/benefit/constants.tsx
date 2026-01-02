import React from 'react';
import { BenefitCategory } from '@/types';
import { Plane, Utensils, ShoppingBag, Shield, Zap, Circle, Car, Heart } from 'lucide-react';

export const CategoryIcons: Record<BenefitCategory, React.ReactNode> = {
    Travel: <Plane className="h-3 w-3" />,
    Dining: <Utensils className="h-3 w-3" />,
    Shopping: <ShoppingBag className="h-3 w-3" />,
    Insurance: <Shield className="h-3 w-3" />,
    Lifestyle: <Zap className="h-3 w-3" />,
    Vehicle: <Car className="h-3 w-3" />,
    Health: <Heart className="h-3 w-3" />,
    Other: <Circle className="h-3 w-3" />,
};

// Larger icons for Cards if needed, or specific component overrides can be handled there.
// But for consistency, we might just export the components or valid JSX.
// The current usage expects ReactNode with specific classes (h-3 w-3).
// Card uses h-4 w-4. We can export a function or just the mapping and let consumers clone/resize, 
// or simpler: export the component type.
// However, the existing code uses pre-rendered JSX in the map.
// Let's keep the map simple for now, but maybe export the Icon Component Map instead?
// BenefitTable uses h-3 w-3, BenefitCard uses h-4 w-4.
// To support both, let's export the Lucide Icon Components directly.

export const CategoryIconComponents: Record<BenefitCategory, React.ElementType> = {
    Travel: Plane,
    Dining: Utensils,
    Shopping: ShoppingBag,
    Insurance: Shield,
    Lifestyle: Zap,
    Vehicle: Car,
    Health: Heart,
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
    Other: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
};

// Card colors might be slightly different in the original file (stronger backgrounds), 
// but unifying them is part of the goal.
// BenefitCard.tsx had: 'bg-blue-500 hover:bg-blue-600' (text-white implied by usage in Badge?)
// BenefitTable.tsx had: 'bg-blue-100 text-blue-700'
// Let's create two sets if they are distinctly different designs.
// Table is "light" (badge style), Card is "solid" (pill style).

export const CategoryColorsLight: Record<BenefitCategory, string> = {
    Travel: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    Dining: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    Shopping: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
    Insurance: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    Lifestyle: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    Vehicle: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
    Health: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
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
    Other: 'bg-gray-500 hover:bg-gray-600',
};
