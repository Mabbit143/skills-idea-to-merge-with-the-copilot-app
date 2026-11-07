export interface Bookmark {
  url: string;
  slug: string;
}

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SLUG_LENGTH = 4;

export function normalizeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const candidate = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    if (!url.hostname) return null;
    if (url.pathname === '/' && !url.search && !url.hash) {
      return url.href.slice(0, -1);
    }
    return url.href;
  } catch {
    return null;
  }
}

export function parseStoredBookmarks(value: string | null): Bookmark[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isBookmark);
  } catch {
    return [];
  }
}

export function formatBookmark(bookmark: Bookmark): string {
  return `${bookmark.url} :: ${bookmark.slug}`;
}

export function generateSlug(existingSlugs: Iterable<string> = []): string {
  const existing = new Set(existingSlugs);

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const slug = `mona-${randomBase62(SLUG_LENGTH)}`;
    if (!existing.has(slug)) return slug;
  }

  let suffix = existing.size;
  let fallback = `mona-${suffix.toString(36)}`;
  while (existing.has(fallback)) {
    suffix += 1;
    fallback = `mona-${suffix.toString(36)}`;
  }
  return fallback;
}

function isBookmark(value: unknown): value is Bookmark {
  if (!value || typeof value !== 'object') return false;
  const bookmark = value as Record<string, unknown>;
  return (
    typeof bookmark.url === 'string' &&
    bookmark.url.trim().length > 0 &&
    typeof bookmark.slug === 'string' &&
    /^mona-[0-9a-zA-Z]+$/.test(bookmark.slug)
  );
}

function randomBase62(length: number): string {
  const values = new Uint32Array(length);
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(values);
  } else {
    for (let index = 0; index < length; index += 1) {
      values[index] = Math.floor(Math.random() * 2 ** 32);
    }
  }

  return Array.from(values, (value) => BASE62[value % BASE62.length]).join('');
}
