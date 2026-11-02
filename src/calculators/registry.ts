import type { CategorySlug } from '../utils/categories';

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
];

export function calculatorUrl(lang: string, c: CalculatorMeta): string {
  return `/${lang}/${c.category}/${c.slug}/`;
}

export function calculatorsInCategory(category: CategorySlug): CalculatorMeta[] {
  return calculators.filter((c) => c.category === category || c.also?.includes(category));
}
