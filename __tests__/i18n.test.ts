import { format, translations } from '../lib/i18n';

describe('translations', () => {
  it('has identical key sets for nb and en', () => {
    expect(Object.keys(translations.en).sort()).toEqual(Object.keys(translations.nb).sort());
  });

  it('has no empty strings', () => {
    for (const lang of ['nb', 'en'] as const) {
      for (const [key, value] of Object.entries(translations[lang])) {
        expect(value.length).toBeGreaterThan(0);
        expect(`${lang}.${key}`).toBeTruthy();
      }
    }
  });

  it('uses the same {placeholders} in both languages', () => {
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const key of Object.keys(translations.nb) as (keyof typeof translations.nb)[]) {
      expect(placeholders(translations.en[key])).toEqual(placeholders(translations.nb[key]));
    }
  });
});

describe('format', () => {
  it('replaces placeholders', () => {
    expect(format('Hei {name}, {count} nye', { name: 'Kari', count: 3 })).toBe('Hei Kari, 3 nye');
  });

  it('leaves unknown placeholders untouched', () => {
    expect(format('Hei {name}', {})).toBe('Hei {name}');
  });

  it('returns the template when no params are given', () => {
    expect(format('Hei')).toBe('Hei');
  });
});
