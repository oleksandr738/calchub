import type { APIRoute } from 'astro';
import { langCodes } from '../i18n';
import { pageRoutes } from '../utils/routes';
import { absoluteUrl } from '../utils/seo';

export const GET: APIRoute = ({ site }) => {
  const base = site!;
  const urls = pageRoutes().flatMap((route) =>
    langCodes.map((lang) => {
      const alternates = [
        ...langCodes.map(
          (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${absoluteUrl(route.path(l), base)}"/>`,
        ),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(route.path(langCodes[0]!), base)}"/>`,
      ].join('\n');
      return `  <url>\n    <loc>${absoluteUrl(route.path(lang), base)}</loc>\n${alternates}\n  </url>`;
    }),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
