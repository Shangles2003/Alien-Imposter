/**
 * Extract a human-readable message from any thrown value.
 *
 * Supabase's postgrest client returns plain `{ message, details, hint }`
 * objects (not Error instances) for network-level failures, so a bare
 * `e instanceof Error` check swallows the real reason. This reads the
 * message off anything and adds a friendly hint for network failures.
 */
export function errorMessage(e: unknown, fallback = 'Something went wrong'): string {
  const raw =
    e instanceof Error
      ? e.message
      : typeof e === 'object' && e !== null && 'message' in e
        ? String((e as { message: unknown }).message)
        : typeof e === 'string'
          ? e
          : '';

  if (!raw) return fallback;

  if (/network request failed|fetch failed|failed to fetch/i.test(raw)) {
    return (
      'Could not reach the game server. Check your internet connection — and if you use a free Supabase project, it may be paused (supabase.com dashboard → Restore project).'
    );
  }

  return raw;
}
