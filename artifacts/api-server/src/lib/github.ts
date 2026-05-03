interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

interface GitHubPR {
  id: number;
  number: number;
  title: string;
  state: string;
  createdAt: string;
  updatedAt: string;
}

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: string;
  createdAt: string;
}

export interface GitHubActivity {
  commits: GitHubCommit[];
  prs: GitHubPR[];
  issues: GitHubIssue[];
}

export interface VelocityDay {
  date: string;
  commits: number;
  prs: number;
}

async function ghFetch(token: string, path: string) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "DevPulse-App",
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function listRepos(token: string) {
  const repos = await ghFetch(token, "/user/repos?sort=updated&per_page=100&type=all");
  return repos.map((r: Record<string, unknown>) => ({
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    description: r.description || null,
    private: r.private,
    language: r.language || null,
    updatedAt: r.updated_at,
  }));
}

export async function getActivity(token: string, repo: string, since?: string): Promise<GitHubActivity> {
  const sinceDate = since || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  let commits: GitHubCommit[] = [];
  let prs: GitHubPR[] = [];
  let issues: GitHubIssue[] = [];

  try {
    const rawCommits = await ghFetch(token, `/repos/${repo}/commits?since=${sinceDate}&per_page=50`);
    commits = rawCommits.map((c: Record<string, unknown>) => {
      const commit = c.commit as Record<string, unknown>;
      const commitAuthor = commit?.author as Record<string, unknown> | null;
      return {
        sha: (c.sha as string).slice(0, 7),
        message: commit?.message as string || "",
        author: (commitAuthor?.name as string) || "Unknown",
        date: (commitAuthor?.date as string) || new Date().toISOString(),
      };
    });
  } catch {
    commits = [];
  }

  try {
    const rawPRs = await ghFetch(token, `/repos/${repo}/pulls?state=all&sort=updated&per_page=20`);
    prs = rawPRs.map((p: Record<string, unknown>) => ({
      id: p.id as number,
      number: p.number as number,
      title: p.title as string,
      state: p.state as string,
      createdAt: p.created_at as string,
      updatedAt: p.updated_at as string,
    }));
  } catch {
    prs = [];
  }

  try {
    const rawIssues = await ghFetch(token, `/repos/${repo}/issues?state=open&per_page=20`);
    issues = rawIssues
      .filter((i: Record<string, unknown>) => !i.pull_request)
      .map((i: Record<string, unknown>) => ({
        id: i.id as number,
        number: i.number as number,
        title: i.title as string,
        state: i.state as string,
        createdAt: i.created_at as string,
      }));
  } catch {
    issues = [];
  }

  return { commits, prs, issues };
}

export async function getVelocity(token: string, repo: string): Promise<VelocityDay[]> {
  const days: VelocityDay[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    let commits = 0;
    let prs = 0;

    try {
      const rawCommits = await ghFetch(
        token,
        `/repos/${repo}/commits?since=${dayStart.toISOString()}&until=${dayEnd.toISOString()}&per_page=100`
      );
      commits = rawCommits.length;
    } catch {
      commits = 0;
    }

    try {
      const rawPRs = await ghFetch(
        token,
        `/repos/${repo}/pulls?state=all&sort=updated&per_page=100`
      );
      prs = rawPRs.filter((p: Record<string, unknown>) => {
        const updated = new Date(p.updated_at as string);
        return updated >= dayStart && updated <= dayEnd;
      }).length;
    } catch {
      prs = 0;
    }

    days.push({
      date: day.toISOString().slice(0, 10),
      commits,
      prs,
    });
  }

  return days;
}
