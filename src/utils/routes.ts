import { categories } from './categories.ts';
import { calculators, calculatorUrl } from '../calculators/registry.ts';

export interface PageRoute {
  id: string;
  /** Адреса сторінки для заданої мови */
  path: (lang: string) => string;
}

/** Усі індексовані сторінки сайту (без мов — мови додаються при використанні). */
export function pageRoutes(): PageRoute[] {
  return [
    { id: 'home', path: (l) => `/${l}/` },
    { id: 'catalog', path: (l) => `/${l}/calculators/` },
    ...categories.map((c) => ({ id: `category:${c.slug}`, path: (l: string) => `/${l}/${c.slug}/` })),
    ...calculators.map((c) => ({ id: `calculator:${c.slug}`, path: (l: string) => calculatorUrl(l, c) })),
  ];
}
