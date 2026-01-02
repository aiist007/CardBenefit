export type BenefitCategory = string;

export interface Benefit {
  id: string;
  cardName: string;
  bank: string;
  category: BenefitCategory;
  title: string;
  description: string;
  validity?: string; // 时效 (e.g., "Monthly", "Until 2024-12-31")
  usageCondition?: string; // 获得权益的条件 (e.g., "Spend $500 monthly")
  value?: string;
  terms?: string;
  notes?: string; // 个人备注 (User notes)
  isCompleted?: boolean; // 是否已完成 (Todo status)
}

export const CATEGORIES: BenefitCategory[] = [
  'Travel',
  'Dining',
  'Shopping',
  'Insurance',
  'Lifestyle',
  'Vehicle',
  'Health',
  'Other',
];

export const CATEGORY_LABELS: Record<string, string> = {
  Travel: '旅行',
  Dining: '餐饮',
  Shopping: '购物',
  Insurance: '保险',
  Lifestyle: '生活',
  Vehicle: '用车',
  Health: '健康',
  Other: '其他',
};

export const CARD_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-cyan-100 text-cyan-700',
  'bg-indigo-100 text-indigo-700',
  'bg-lime-100 text-lime-700',
  'bg-pink-100 text-pink-700',
];

export const getCardColor = (cardName: string) => {
  if (!cardName) return 'bg-slate-100 text-slate-700';
  let hash = 0;
  for (let i = 0; i < cardName.length; i++) {
    hash = cardName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CARD_COLORS.length;
  return CARD_COLORS[index];
};
