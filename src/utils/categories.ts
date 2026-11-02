export const categories = [
  { slug: 'finance', icon: '💰' },
  { slug: 'construction', icon: '🏗️' },
  { slug: 'automotive', icon: '🚗' },
  { slug: 'everyday', icon: '📅' },
  { slug: 'conversion', icon: '🔄' },
  { slug: 'math', icon: '➗' },
] as const;

export type CategorySlug = (typeof categories)[number]['slug'];
