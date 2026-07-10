import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TARGET_FILE = path.resolve('./CONTRIBUTORS.md');
const BOTS = [
  'github-actions[bot]',
  'dependabot[bot]',
  'github-actions',
  'dependabot',
  'action@github.com'
];

/**
 * Escapes special HTML characters to prevent XSS injection.
 * @param {string} str 
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, (tag) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag;
  });
}

/**
 * Checks if a contributor is a bot.
 * @param {string} name 
 * @param {string} email 
 * @returns {boolean}
 */
function isBot(name, email = '') {
  const lowercaseName = name.toLowerCase();
  const lowercaseEmail = email.toLowerCase();
  return BOTS.some(bot => lowercaseName.includes(bot) || lowercaseEmail.includes(bot));
}

/**
 * Get repo owner and name from environment or git remote URL.
 * @returns {{owner: string, repo: string}|null}
 */
function getRepoInfo() {
  if (process.env.GITHUB_REPOSITORY) {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    if (owner && repo) {
      return { owner, repo };
    }
  }

  try {
    const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim();
    // Matches patterns like:
    // https://github.com/owner/repo.git
    // git@github.com:owner/repo.git
    const match = remoteUrl.match(/github\.com[/:]([^/]+)\/([^.]+)/);
    if (match) {
      const owner = match[1];
      const repo = match[2].replace(/\.git$/, '');
      return { owner, repo };
    }
  } catch (error) {
    console.warn('⚠️ Could not determine repository info from git remote.');
  }

  return null;
}

/**
 * Fetch contributors from GitHub REST API.
 * @param {string} owner 
 * @param {string} repo 
 * @returns {Promise<Array<{name: string, login: string, avatar_url: string, html_url: string, commits: number}>>}
 */
async function fetchGitHubContributors(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contributors`;
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
  const headers = {
    'User-Agent': 'node-contributors-generator'
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  console.log(`🤖 Fetching contributors from GitHub API: ${url}...`);
  let response = await fetch(url, { headers });

  // If unauthorized/forbidden (possibly due to a dummy/expired token), retry without authorization header
  if ((response.status === 401 || response.status === 403) && token) {
    console.warn(`⚠️ GitHub API request returned status ${response.status} using token. Retrying without token...`);
    const headersWithoutToken = {
      'User-Agent': 'node-contributors-generator'
    };
    response = await fetch(url, { headers: headersWithoutToken });
  }

  if (!response.ok) {
    throw new Error(`GitHub API returned status ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Invalid response format from GitHub API');
  }

  return data
    .filter(c => !isBot(c.login))
    .map(c => ({
      name: c.login,
      login: c.login,
      avatar_url: c.avatar_url,
      html_url: c.html_url,
      commits: c.contributions
    }));
}

/**
 * Fallback: get contributors list from local git shortlog.
 * @returns {Array<{name: string, email: string, commits: number}>}
 */
function getGitLogContributors() {
  console.log('🤖 Getting contributors from git shortlog...');
  try {
    // Run git shortlog to get count, name, and email. Add HEAD to prevent hanging in non-tty shells.
    let output = '';
    try {
      output = execSync('git shortlog -sne HEAD', { encoding: 'utf-8' }).trim();
    } catch (e) {
      output = execSync('git shortlog -sne', { encoding: 'utf-8' }).trim();
    }
    if (!output) return [];

    return output
      .split('\n')
      .map(line => {
        // Line format: "   150  Name <email>"
        const match = line.trim().match(/^(\d+)\s+(.*?)\s+<([^>]+)>/);
        if (!match) return null;
        return {
          commits: parseInt(match[1], 10),
          name: match[2].trim(),
          email: match[3].trim()
        };
      })
      .filter(c => c !== null && !isBot(c.name, c.email))
      .sort((a, b) => b.commits - a.commits);
  } catch (error) {
    console.error('❌ Failed to get contributors from git log:', error.message);
    return [];
  }
}

/**
 * Generate the beautiful contributors grid using HTML table.
 * @param {Array<{name: string, avatar_url: string, html_url: string, commits: number}>} contributors 
 * @returns {string}
 */
function generateHtmlGrid(contributors) {
  const columns = 5;
  let html = '<table>\n  <tr>\n';

  contributors.forEach((c, index) => {
    if (index > 0 && index % columns === 0) {
      html += '  </tr>\n  <tr>\n';
    }

    const escapedName = escapeHtml(c.name);
    const escapedAvatar = escapeHtml(c.avatar_url);
    const escapedUrl = escapeHtml(c.html_url);
    const escapedCommits = escapeHtml(String(c.commits));

    html += `    <td align="center" valign="top" width="${100 / columns}%">
      <a href="${escapedUrl}" target="_blank">
        <img src="${escapedAvatar}" width="80px;" style="border-radius: 50%; border: 2px solid #5c6bc0;" alt="${escapedName}"/>
        <br />
        <sub><b>${escapedName}</b></sub>
      </a>
      <br />
      <sub>${escapedCommits} ${c.commits === 1 ? 'commit' : 'commits'}</sub>
    </td>\n`;
  });

  // Pad the last row with empty cells if not complete
  const remainder = contributors.length % columns;
  if (remainder > 0) {
    for (let i = remainder; i < columns; i++) {
      html += `    <td align="center" valign="top" width="${100 / columns}%"></td>\n`;
    }
  }

  html += '  </tr>\n</table>';
  return html;
}

/**
 * Generate fallback text markdown table.
 * @param {Array<{name: string, email: string, commits: number}>} contributors 
 * @returns {string}
 */
function generateTextTable(contributors) {
  let md = '| Contributor | Commits |\n| :--- | :---: |\n';
  contributors.forEach(c => {
    const escapedName = escapeHtml(c.name);
    const escapedCommits = escapeHtml(String(c.commits));
    md += `| **${escapedName}** | ${escapedCommits} |\n`;
  });
  return md;
}

async function main() {
  console.log('👥 Starting contributors list generation...');
  const repoInfo = getRepoInfo();
  let contributors = [];
  let isApiSource = false;

  if (repoInfo) {
    try {
      contributors = await fetchGitHubContributors(repoInfo.owner, repoInfo.repo);
      isApiSource = true;
      console.log(`✅ Successfully fetched ${contributors.length} contributors from GitHub API.`);
    } catch (error) {
      console.warn(`⚠️ GitHub API fetch failed (${error.message}). Falling back to git log...`);
    }
  } else {
    console.warn('⚠️ Could not determine repository owner/name. Falling back to git log...');
  }

  if (contributors.length === 0) {
    contributors = getGitLogContributors();
  }

  if (contributors.length === 0) {
    console.warn('⚠️ No contributors found.');
  }

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let content = `# 👥 Project Contributors

We are incredibly grateful to everyone who has contributed to the growth and development of **DomoDomo**! Thank you for making this project better.

`;

  if (isApiSource && contributors.length > 0) {
    content += generateHtmlGrid(contributors);
  } else if (contributors.length > 0) {
    content += generateTextTable(contributors);
  } else {
    content += '*No contributors registered yet. Be the first to contribute!*\n';
  }

  content += `

---

## 🛠️ How to Contribute

Want to see your name here? Check out our [CONTRIBUTING.md](CONTRIBUTING.md) to get started on your contribution journey!

*Last updated on ${today} | Automated via GitHub Actions*
`;

  fs.writeFileSync(TARGET_FILE, content.trim() + '\n', 'utf-8');
  console.log(`🎉 Successfully wrote contributors to ${TARGET_FILE}`);
}

main().catch(error => {
  console.error('❌ Critical error in generator:', error);
  process.exit(1);
});
