const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://gns-cms-production.up.railway.app';

export function resolveUrl(url: string | undefined | null, strapiUrl?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${strapiUrl || STRAPI_URL}${url}`;
}
