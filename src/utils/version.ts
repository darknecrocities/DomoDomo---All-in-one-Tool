// Compile-time injected global variables from Vite define
declare const __APP_VERSION__: string | undefined;
declare const __BUILD_TIME__: string | undefined;
declare const __COMMIT_HASH__: string | undefined;

export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '2.5.0';
export const BUILD_TIME = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : '2026-08-22T08:26:15.377Z';
export const COMMIT_HASH = typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : '6fea9d9';

/**
 * Compare two semver-like version strings (e.g., "2.5.0", "v2.5.1", "2.6.0").
 * Returns true ONLY if remoteVersion is strictly greater than currentVersion.
 */
export function isNewerVersion(remoteVersion?: string | null, currentVersion: string = APP_VERSION): boolean {
  if (!remoteVersion) return false;

  // Clean version strings (strip leading 'v' and extract base numerical version)
  const cleanRemote = remoteVersion.replace(/^v/i, '').trim();
  const cleanCurrent = currentVersion.replace(/^v/i, '').trim();

  if (cleanRemote === cleanCurrent) return false;

  const remoteParts = cleanRemote.split(/[-+]/)[0].split('.').map(part => parseInt(part, 10) || 0);
  const currentParts = cleanCurrent.split(/[-+]/)[0].split('.').map(part => parseInt(part, 10) || 0);

  const maxLen = Math.max(remoteParts.length, currentParts.length, 3);

  for (let i = 0; i < maxLen; i++) {
    const r = remoteParts[i] ?? 0;
    const c = currentParts[i] ?? 0;
    if (r > c) return true;
    if (r < c) return false;
  }

  return false;
}
