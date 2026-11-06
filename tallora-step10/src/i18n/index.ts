import uk from './uk.json';
import en from './en.json';
import sv from './sv.json';

// Перша мова в списку показується першою в перемикачі
export const languages = {
  sv: 'Svenska',
  en: 'English',
  uk: 'Українська',
} as const;

export type Lang = keyof typeof languages;
export const langCodes = Object.keys(languages) as Lang[];
export const defaultLang: Lang = 'sv';

const dictionaries = { uk, en, sv };

function lookup(dict: unknown, key: string): string | undefined {
  const value = key
    .split('.')
    .reduce<any>((obj, part) => (obj ? obj[part] : undefined), dict);
  return typeof value === 'string' ? value : undefined;
}

/** Повертає функцію t('home.title') для потрібної мови. */
export function useTranslations(lang: Lang) {
  return (key: string): string =>
    lookup(dictionaries[lang], key) ??
    lookup(dictionaries[defaultLang], key) ??
    key;
}

export function getLangFromUrl(url: URL): Lang {
  const first = url.pathname.split('/')[1] ?? '';
  return first in languages ? (first as Lang) : defaultLang;
}

/** /uk/finance/x/ -> /en/finance/x/ */
export function switchLangPath(pathname: string, target: Lang): string {
  const parts = pathname.split('/');
  if (parts[1] && parts[1] in languages) {
    parts[1] = target;
    return parts.join('/');
  }
  return `/${target}/`;
}
