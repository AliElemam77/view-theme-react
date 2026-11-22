import { describe, it, expect } from 'vitest';
import { linkUrl, optionValue } from '../../app/lib/fieldValue';

describe('optionValue', () => {
  it('reads a bare value', () => {
    expect(optionValue('fast')).toBe('fast');
  });

  it('reads a picked option', () => {
    expect(optionValue({ label: 'سريع', value: 'fast', key: 'k' })).toBe('fast');
  });

  it('reads the first of a list of picked options', () => {
    expect(optionValue([{ label: 'بطيء', value: 'slow' }, { value: 'fast' }])).toBe('slow');
  });

  it('is empty for nothing', () => {
    expect(optionValue(undefined)).toBe('');
    expect(optionValue(null)).toBe('');
    expect(optionValue([])).toBe('');
  });
});

describe('linkUrl', () => {
  it('reads a string URL', () => {
    expect(linkUrl('https://store.test/c/1')).toBe('https://store.test/c/1');
  });

  it('reads an object carrying `url`', () => {
    expect(linkUrl({ type: 'categories', url: '/c/1' })).toBe('/c/1');
  });

  it('is undefined for empty values', () => {
    expect(linkUrl('')).toBeUndefined();
    expect(linkUrl('   ')).toBeUndefined();
    expect(linkUrl(null)).toBeUndefined();
    expect(linkUrl({ url: null })).toBeUndefined();
  });
});
