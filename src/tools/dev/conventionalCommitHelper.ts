export interface CommitTypeOption {
  type: string;
  label: string;
  desc: string;
  badge: string;
}

export const COMMIT_TYPES: CommitTypeOption[] = [
  { type: 'feat', label: 'Feature (feat)', desc: 'A new feature for the user', badge: 'bg-[#D4AF37] text-black' },
  { type: 'fix', label: 'Bugfix (fix)', desc: 'A bug fix', badge: 'bg-white text-black' },
  { type: 'docs', label: 'Documentation (docs)', desc: 'Documentation only changes', badge: 'bg-[#18191B] text-slate-300' },
  { type: 'style', label: 'Style (style)', desc: 'Formatting, white-space, missing semi', badge: 'bg-[#18191B] text-slate-300' },
  { type: 'refactor', label: 'Refactor (refactor)', desc: 'Code change that neither fixes bug nor adds feature', badge: 'bg-[#18191B] text-slate-300' },
  { type: 'perf', label: 'Performance (perf)', desc: 'A code change that improves performance', badge: 'bg-[#18191B] text-slate-300' },
  { type: 'test', label: 'Test (test)', desc: 'Adding missing tests or correcting existing tests', badge: 'bg-[#18191B] text-slate-300' },
  { type: 'build', label: 'Build (build)', desc: 'Changes affecting build system or dependencies', badge: 'bg-[#18191B] text-slate-300' },
  { type: 'ci', label: 'CI/CD (ci)', desc: 'Changes to CI configuration files and scripts', badge: 'bg-[#18191B] text-slate-300' },
  { type: 'chore', label: 'Chore (chore)', desc: 'Other changes that do not modify src or test', badge: 'bg-[#18191B] text-slate-300' },
  { type: 'revert', label: 'Revert (revert)', desc: 'Reverts a previous commit', badge: 'bg-red-500/20 text-red-300' },
];

export interface FormatCommitOptions {
  type: string;
  scope?: string;
  isBreaking?: boolean;
  description: string;
  body?: string;
  footerKey?: string;
  footerValue?: string;
}

export const formatConventionalCommit = ({
  type,
  scope = '',
  isBreaking = false,
  description,
  body = '',
  footerKey = '',
  footerValue = '',
}: FormatCommitOptions): string => {
  const scopePart = scope.trim() ? `(${scope.trim()})` : '';
  const breakingMark = isBreaking ? '!' : '';
  const header = `${type}${scopePart}${breakingMark}: ${description.trim()}`;

  const parts = [header];
  if (body.trim()) parts.push(body.trim());
  if (footerKey.trim() && footerValue.trim()) {
    parts.push(`${footerKey.trim()}: ${footerValue.trim()}`);
  }

  return parts.join('\n\n');
};

export const formatGitCommitCommand = ({
  type,
  scope = '',
  isBreaking = false,
  description,
  body = '',
  footerKey = '',
  footerValue = '',
}: FormatCommitOptions): string => {
  const scopePart = scope.trim() ? `(${scope.trim()})` : '';
  const breakingMark = isBreaking ? '!' : '';
  const header = `${type}${scopePart}${breakingMark}: ${description.trim()}`;
  let cmd = `git commit -m "${header}"`;
  if (body.trim()) cmd += ` -m "${body.trim()}"`;
  if (footerKey.trim() && footerValue.trim()) cmd += ` -m "${footerKey.trim()}: ${footerValue.trim()}"`;
  return cmd;
};

export interface LintIssue {
  text: string;
  severity: 'error' | 'warning';
}

export const lintConventionalCommit = (
  description: string,
  scope: string = ''
): LintIssue[] => {
  const issues: LintIssue[] = [];
  const trimmedDesc = description.trim();

  if (!trimmedDesc) {
    issues.push({ text: 'Subject description cannot be empty.', severity: 'error' });
  } else {
    if (trimmedDesc.length > 72) {
      issues.push({ text: 'Header exceeds 72 characters (recommended ≤ 50).', severity: 'warning' });
    }
    if (trimmedDesc.endsWith('.')) {
      issues.push({ text: 'Subject line should not end with trailing punctuation (period).', severity: 'error' });
    }
    if (/^[A-Z]/.test(trimmedDesc)) {
      issues.push({ text: 'Subject should start in lowercase imperative mood (e.g. "add" instead of "Add").', severity: 'warning' });
    }
  }

  if (scope.includes(' ') || scope.includes('_')) {
    issues.push({ text: 'Scope should be kebab-case or single words without spaces.', severity: 'warning' });
  }

  return issues;
};
