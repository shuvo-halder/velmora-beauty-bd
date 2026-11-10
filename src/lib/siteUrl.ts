/**
 * Shared helper to get the canonical public storefront URL.
 * Reads process.env.NEXT_PUBLIC_SITE_URL only, strips trailing slash.
 * If the environment variable is missing, logs a clear warning and returns an empty string.
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!envUrl || !envUrl.trim()) {
    console.warn(
      'NEXT_PUBLIC_SITE_URL is not defined in environment variables. Absolute URLs cannot be constructed and will be omitted.'
    );
    return '';
  }
  return envUrl.trim().replace(/\/+$/, '');
}
