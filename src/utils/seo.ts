export const ogLocales: Record<string, string> = {
  uk: 'uk_UA',
  en: 'en_GB',
  sv: 'sv_SE',
};

export function absoluteUrl(path: string, site: URL | string): string {
  return new URL(path, site).href;
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbLd(items: Crumb[], site: URL | string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path, site),
    })),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

export function webAppLd(opts: { name: string; description: string; url: string; lang: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    inLanguage: opts.lang,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    isAccessibleForFree: true,
  };
}

export function webSiteLd(opts: { name: string; url: string; lang: string; description: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: opts.name,
    url: opts.url,
    inLanguage: opts.lang,
    description: opts.description,
  };
}

/** Безпечний JSON для вставки в <script type="application/ld+json"> (екранує "<"). */
export function jsonLdString(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
