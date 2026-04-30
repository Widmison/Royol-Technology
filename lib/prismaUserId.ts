/**
 * Cheap format check for Prisma `@id` strings (e.g. `cuid()`, UUID) so the edge layer
 * does not treat arbitrary cookie bytes as a session.
 */
export function looksLikePrismaUserId(raw: string): boolean {
  const id = raw.trim();
  if (id.length < 15 || id.length > 36) return false;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return true;
  }
  return /^[a-z][a-z0-9_-]{14,35}$/i.test(id);
}
