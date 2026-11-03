import type { APIRoute } from 'astro';
import { langCodes, useTranslations, type Lang } from '../../i18n';
import { calculators, calculatorUrl } from '../../calculators/registry';

export function getStaticPaths() {
  return langCodes.map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = ({ params }) => {
  const lang = params.lang as Lang;
  const t = useTranslations(lang);

  const items = calculators.map((c) => ({
    name: t(`calculators.${c.slug}.name`),
    description: t(`calculators.${c.slug}.description`),
    keywords: t(`calculators.${c.slug}.keywords`),
    category: t(`categories.${c.category}.name`),
    icon: c.icon,
    url: calculatorUrl(lang, c),
  }));

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
