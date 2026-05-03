# DevPulse

## Overview

DevPulse is a full-stack SaaS web app — an AI-powered Daily Standup & Sprint Intelligence tool for developers. It connects to GitHub, analyzes your commits/PRs/issues from the last 24 hours, and uses Claude AI to generate professional daily standups.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + TailwindCSS (dark theme, orange accent)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: Anthropic Claude (via Replit AI Integrations — no user API key needed)
- **Auth**: GitHub OAuth via passport-github2 + express-session
- **Charts**: Recharts (velocity bar chart)

## Artifacts

- **devpulse** (`artifacts/devpulse/`) — React+Vite frontend at `/`
- **api-server** (`artifacts/api-server/`) — Express backend at `/api`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Database Schema

- **users** — GitHub OAuth users (id, githubId, username, avatarUrl, accessToken)
- **standups** — Generated standups (yesterday, today, blockers, velocityScore, sentToSlack)
- **preferences** — Per-user settings (slackWebhookUrl, standupTone, defaultRepo)

## Features

1. **GitHub OAuth Login** — Login with GitHub button → passport.js → session
2. **GitHub Activity Fetcher** — Lists repos, fetches commits/PRs/issues from last 24h
3. **AI Standup Generator** — Claude claude-sonnet-4-6 generates yesterday/today/blockers/velocity
4. **Dashboard** — Repo selector, generate button, StandupCard, velocity chart
5. **History** — Past standups list with expand
6. **Settings** — Slack webhook, standup tone, default repo
7. **Slack Integration** — POST standup to webhook

## Required Environment Variables

- `GITHUB_CLIENT_ID` — From GitHub OAuth App settings
- `GITHUB_CLIENT_SECRET` — From GitHub OAuth App settings
- `SESSION_SECRET` — Already configured
- `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` / `AI_INTEGRATIONS_ANTHROPIC_API_KEY` — Auto-configured via Replit AI Integrations
- `DATABASE_URL` — Auto-configured via Replit PostgreSQL

## GitHub OAuth Setup

1. Go to github.com/settings/developers → New OAuth App
2. Callback URL: `https://<your-replit-dev-domain>/api/auth/github/callback`
3. Add Client ID and Client Secret as secrets in Replit

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
