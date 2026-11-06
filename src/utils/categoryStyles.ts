import type { CategorySlug } from './categories';

export interface CategoryStyle {
  /** Колір плитки з іконкою */
  tile: string;
  /** Колір рамки картки при наведенні */
  hover: string;
}

// Класи записані повністю, щоб Tailwind їх помітив (динамічно складати не можна)
export const categoryStyles: Record<CategorySlug, CategoryStyle> = {
  finance: { tile: 'bg-emerald-100 text-emerald-800', hover: 'hover:border-emerald-500' },
  construction: { tile: 'bg-amber-100 text-amber-800', hover: 'hover:border-amber-500' },
  automotive: { tile: 'bg-rose-100 text-rose-800', hover: 'hover:border-rose-500' },
  everyday: { tile: 'bg-violet-100 text-violet-800', hover: 'hover:border-violet-500' },
  conversion: { tile: 'bg-cyan-100 text-cyan-800', hover: 'hover:border-cyan-600' },
  math: { tile: 'bg-indigo-100 text-indigo-800', hover: 'hover:border-indigo-500' },
};
