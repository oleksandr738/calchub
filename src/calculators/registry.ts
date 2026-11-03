import type { CategorySlug } from '../utils/categories';
import type { CalculatorDef } from './types';

export interface CalculatorMeta {
  /** Адреса калькулятора, однакова для всіх мов */
  slug: string;
  /** Основна категорія (визначає URL) */
  category: CategorySlug;
  /** Додаткові категорії, де калькулятор теж показується */
  also?: CategorySlug[];
  icon: string;
  popular?: boolean;
  /** Кількість питань у FAQ (ключі faq1q/faq1a ... у файлах перекладу) */
  faqCount: number;
  /** Підвантаження логіки для універсального двигуна (без load — окремий компонент) */
  load?: () => Promise<{ calculator: CalculatorDef }>;
}

export const calculators: CalculatorMeta[] = [
  {
    slug: 'percentage-calculator',
    category: 'finance',
    also: ['math'],
    icon: '％',
    popular: true,
    faqCount: 3,
  },
  {
    slug: 'discount-calculator',
    category: 'finance',
    icon: '🏷️',
    popular: true,
    faqCount: 2,
    load: () => import('./finance/discount.ts'),
  },
  {
    slug: 'vat-calculator',
    category: 'finance',
    icon: '🧾',
    faqCount: 2,
    load: () => import('./finance/vat.ts'),
  },
  {
    slug: 'area-calculator',
    category: 'construction',
    icon: '📐',
    popular: true,
    faqCount: 2,
    load: () => import('./construction/area.ts'),
  },
  {
    slug: 'volume-calculator',
    category: 'construction',
    icon: '📦',
    faqCount: 2,
    load: () => import('./construction/volume.ts'),
  },
  {
    slug: 'length-converter',
    category: 'conversion',
    icon: '📏',
    popular: true,
    faqCount: 2,
    load: () => import('./conversion/length.ts'),
  },
  {
    slug: 'mass-converter',
    category: 'conversion',
    icon: '⚖️',
    faqCount: 2,
    load: () => import('./conversion/mass.ts'),
  },
  {
    slug: 'fuel-consumption-calculator',
    category: 'automotive',
    icon: '⛽',
    popular: true,
    faqCount: 2,
    load: () => import('./automotive/fuel-consumption.ts'),
  },
  {
    slug: 'trip-cost-calculator',
    category: 'automotive',
    icon: '🧭',
    faqCount: 2,
    load: () => import('./automotive/trip-cost.ts'),
  },
  {
    slug: 'loan-calculator',
    category: 'finance',
    icon: '🏦',
    popular: true,
    faqCount: 2,
    load: () => import('./finance/loan.ts'),
  },
  {
    slug: 'concrete-calculator',
    category: 'construction',
    icon: '🧱',
    faqCount: 2,
    load: () => import('./construction/concrete.ts'),
  },
  {
    slug: 'tile-calculator',
    category: 'construction',
    icon: '🔲',
    faqCount: 2,
    load: () => import('./construction/tile.ts'),
  },
  {
    slug: 'paint-calculator',
    category: 'construction',
    icon: '🎨',
    faqCount: 2,
    load: () => import('./construction/paint.ts'),
  },
];

export function calculatorUrl(lang: string, c: CalculatorMeta): string {
  return `/${lang}/${c.category}/${c.slug}/`;
}

export function calculatorsInCategory(category: CategorySlug): CalculatorMeta[] {
  return calculators.filter((c) => c.category === category || c.also?.includes(category));
}
