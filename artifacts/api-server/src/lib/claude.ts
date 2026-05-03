import { anthropic } from "@workspace/integrations-anthropic-ai";
import type { GitHubActivity } from "./github.js";

interface StandupResult {
  yesterday: string;
  today: string;
  blockers: string[];
  nextPriorityTask: string;
  velocityScore: number;
}

export async function generateStandup(
  activity: GitHubActivity,
  tone: string = "professional"
): Promise<StandupResult> {
  const commitList = activity.commits.length > 0
    ? activity.commits.map((c) => `- [${c.sha}] ${c.message} (by ${c.author})`).join("\n")
    : "No commits in the last 24 hours";

  const prList = activity.prs.length > 0
    ? activity.prs.map((p) => `- PR #${p.number}: ${p.title} [${p.state}]`).join("\n")
    : "No recent pull requests";

  const issueList = activity.issues.length > 0
    ? activity.issues.map((i) => `- Issue #${i.number}: ${i.title}`).join("\n")
    : "No open issues";

  const prompt = `Based on this GitHub activity from the last 24 hours, generate a standup:

Commits:
${commitList}

Pull Requests:
${prList}

Open Issues:
${issueList}

User's tone preference: ${tone}

Respond ONLY with this JSON structure, no markdown or explanation:
{
  "yesterday": "What I did yesterday (2-3 sentences)",
  "today": "What I plan to do today (2-3 sentences)",
  "blockers": ["blocker 1 if any", "blocker 2 if any"],
  "next_priority_task": "Single most important task based on open issues/PRs",
  "velocity_score": 7
}

If there are no blockers, return an empty array for blockers. The velocity_score should be 1-10 based on productivity.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system:
        "You are a senior engineering standup assistant. Generate concise, professional daily standup updates from GitHub activity data. Always respond in valid JSON only. No markdown, no explanation — pure JSON.",
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const parsed = JSON.parse(content.text) as {
      yesterday: string;
      today: string;
      blockers: string[];
      next_priority_task: string;
      velocity_score: number;
    };

    return {
      yesterday: parsed.yesterday,
      today: parsed.today,
      blockers: Array.isArray(parsed.blockers) ? parsed.blockers : [],
      nextPriorityTask: parsed.next_priority_task || "",
      velocityScore: parsed.velocity_score || 5,
    };
  } catch {
    return {
      yesterday: "Worked on development tasks and code review.",
      today: "Continuing development work and addressing open issues.",
      blockers: [],
      nextPriorityTask: "Review and merge pending pull requests",
      velocityScore: 5,
    };
  }
}
