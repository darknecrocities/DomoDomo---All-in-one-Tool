export interface ParsedSemver {
  major: number;
  minor: number;
  patch: number;
  prerelease: string;
  build: string;
  raw: string;
}

export const SEMVER_REGEX = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

export const parseSemver = (version: string): ParsedSemver | null => {
  const match = version.trim().match(SEMVER_REGEX);
  if (!match) return null;
  return {
    raw: version.trim(),
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || '',
    build: match[5] || '',
  };
};

export const compareSemver = (a: ParsedSemver, b: ParsedSemver): number => {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;
  if (!a.prerelease && b.prerelease) return 1;
  if (a.prerelease && !b.prerelease) return -1;
  if (a.prerelease && b.prerelease) return a.prerelease.localeCompare(b.prerelease);
  return 0;
};

// Evaluates simple caret (^), tilde (~), or comparison (>=, <, <=, >) ranges against a semver
export const satisfiesRange = (version: ParsedSemver, rangeStr: string): boolean => {
  const clean = rangeStr.trim();
  if (clean === '*' || clean === 'x') return true;

  if (clean.startsWith('^')) {
    const base = parseSemver(clean.slice(1));
    if (!base) return false;
    if (compareSemver(version, base) < 0) return false;
    if (base.major > 0) return version.major === base.major;
    if (base.minor > 0) return version.minor === base.minor;
    return version.patch === base.patch;
  }

  if (clean.startsWith('~')) {
    const base = parseSemver(clean.slice(1));
    if (!base) return false;
    if (compareSemver(version, base) < 0) return false;
    return version.major === base.major && version.minor === base.minor;
  }

  if (clean.startsWith('>=')) {
    const base = parseSemver(clean.slice(2));
    return base ? compareSemver(version, base) >= 0 : false;
  }
  if (clean.startsWith('>')) {
    const base = parseSemver(clean.slice(1));
    return base ? compareSemver(version, base) > 0 : false;
  }
  if (clean.startsWith('<=')) {
    const base = parseSemver(clean.slice(2));
    return base ? compareSemver(version, base) <= 0 : false;
  }
  if (clean.startsWith('<')) {
    const base = parseSemver(clean.slice(1));
    return base ? compareSemver(version, base) < 0 : false;
  }

  const exact = parseSemver(clean);
  return exact ? compareSemver(version, exact) === 0 : false;
};

export const calculateBumps = (parsed: ParsedSemver) => {
  const { major, minor, patch } = parsed;
  return {
    patch: `${major}.${minor}.${patch + 1}`,
    minor: `${major}.${minor + 1}.0`,
    major: `${major + 1}.0.0`,
    prepatch: `${major}.${minor}.${patch + 1}-beta.0`,
    preminor: `${major}.${minor + 1}.0-beta.0`,
    premajor: `${major + 1}.0.0-beta.0`,
  };
};

export const calculateDiff = (current: ParsedSemver, target: ParsedSemver) => {
  const cmp = compareSemver(current, target);
  if (cmp === 0) return { type: 'identical', desc: 'Versions are identical.' };

  if (target.major > current.major) {
    return { type: 'breaking', desc: `MAJOR BUMP (+${target.major - current.major}): Breaking changes and API incompatibility likely.` };
  }
  if (target.minor > current.minor) {
    return { type: 'minor', desc: `MINOR BUMP (+${target.minor - current.minor}): Backward-compatible new features added.` };
  }
  if (target.patch > current.patch) {
    return { type: 'patch', desc: `PATCH BUMP (+${target.patch - current.patch}): Backward-compatible bug fixes.` };
  }
  return { type: 'downgrade', desc: 'Target version is older (Downgrade).' };
};
