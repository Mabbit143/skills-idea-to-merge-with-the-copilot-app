import { describe, expect, it } from 'vitest';
import {
  formatBookmark,
  normalizeUrl,
  parseStoredBookmarks,
} from '../src/lib/bookmarks';

describe('bookmark helpers', () => {
  it('normalizes URLs with and without https:// to the same value', () => {
    expect(normalizeUrl('www.example.com')).toBe('https://www.example.com');
    expect(normalizeUrl('https://www.example.com')).toBe('https://www.example.com');
  });

  it.each([
    ['empty', ''],
    ['corrupted', '{not json'],
    ['legacy', '[{"url":"https://example.com"}]'],
    ['non-array', '{"url":"https://example.com","slug":"mona-7fk2"}'],
  ])('recovers from %s stored values without throwing', (_label, value) => {
    expect(parseStoredBookmarks(value)).toEqual([]);
  });

  it('drops malformed entries while retaining valid bookmarks', () => {
    expect(
      parseStoredBookmarks(
        JSON.stringify([
          { url: 'https://example.com', slug: 'mona-7fk2' },
          { url: 'https://bad.example', slug: 'not-a-mona-slug' },
          null,
        ]),
      ),
    ).toEqual([{ url: 'https://example.com', slug: 'mona-7fk2' }]);
  });

  it('formats a bookmark with the exact separator', () => {
    expect(formatBookmark({ url: 'https://www.example.com', slug: 'mona-7fk2' })).toBe(
      'https://www.example.com :: mona-7fk2',
    );
  });
});
