# GitHub Stats API

> Dynamic GitHub stats cards — built with **Hono** + **Satori**, running on **Cloudflare Workers** free tier 24/7.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ajit421/github_status)

---

## 📊 Cards

| Card | Endpoint | Auth Required |
| :--- | :--- | :--- |
| GitHub Stats | `/api/stats` | Optional |
| Top Languages | `/api/top-langs` | Optional |
| Streak Stats | `/api/streak` | **Yes** (GraphQL) |
| Commit Activity | `/api/commit-activity` | Optional |

---

## 🚀 Deploy Your Own

### Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier is enough)
- [Node.js](https://nodejs.org) ≥ 18
- A [GitHub Personal Access Token](https://github.com/settings/tokens) with `read:user` and `repo` scopes

### Step 1 — Clone & Install

```bash
git clone https://github.com/ajit421/github_status.git
cd github_status
npm install
```

### Step 2 — Set your GitHub Token

```bash
npx wrangler secret put GITHUB_TOKEN
# Paste your token when prompted — it is encrypted at rest, never in code.
```

### Step 3 — Run locally

```bash
npm run dev
# → http://localhost:8787
```

Create `.dev.vars` in the project root for local development:

```ini
GITHUB_TOKEN="ghp_your_token_here"
```

> `.dev.vars` is git-ignored. Never commit it.

### Step 4 — Deploy

```bash
npm run deploy
# Your live URL: https://github-stats-api.421mrdark.workers.dev
```

---

## 📈 Usage

Replace `YOUR_USERNAME` with your GitHub username and `https://github-stats-api.421mrdark.workers.dev` with your deployed Worker URL.

### 1. GitHub Stats Card

```markdown
![GitHub Stats](https://github-stats-api.421mrdark.workers.dev/api/stats?username=ajit421&theme=tokyonight&show_icons=true&hide_border=true)
```

| Parameter | Description | Default |
| :--- | :--- | :--- |
| `username` | **Required.** GitHub username | — |
| `theme` | Color theme (see [Themes](#-themes)) | `default` |
| `hide_rank` | Hide the rank circle | `false` |
| `show_icons` | Show stat icons | `true` |
| `hide_border` | Hide card border | `false` |
| `custom_title` | Override card title text | `[Name]'s GitHub Stats` |
| `bg_color` | Background hex (no `#`) | theme default |
| `text_color` | Text hex | theme default |
| `title_color` | Title hex | theme default |
| `icon_color` | Icon hex | theme default |
| `border_color` | Border hex | theme default |

---

### 2. Top Languages Card

```markdown
![Top Languages](https://github-stats-api.421mrdark.workers.dev/api/top-langs?username=ajit421&theme=tokyonight&layout=pie&hide_border=true)
```

| Parameter | Description | Default |
| :--- | :--- | :--- |
| `username` | **Required.** GitHub username | — |
| `theme` | Color theme | `default` |
| `layout` | `normal` · `compact` · `pie` | `normal` |
| `hide_border` | Hide card border | `false` |

---

### 3. Streak Stats Card

> ⚠️ Requires `GITHUB_TOKEN` — uses the GitHub GraphQL API.

```markdown
![GitHub Streak](https://github-stats-api.421mrdark.workers.dev/api/streak?username=ajit421&theme=tokyonight&hide_border=true)
```

| Parameter | Description | Default |
| :--- | :--- | :--- |
| `username` | **Required.** GitHub username | — |
| `theme` | Color theme | `default` |
| `hide_border` | Hide card border | `false` |

---

### 4. Commit Activity Card

```markdown
![Commit Activity](https://github-stats-api.421mrdark.workers.dev/api/commit-activity?username=ajit421&theme=tokyonight&hide_border=true)
```

| Parameter | Description | Default |
| :--- | :--- | :--- |
| `username` | **Required.** GitHub username | — |
| `theme` | Color theme | `default` |
| `hide_border` | Hide card border | `false` |

---

## 🎨 Themes

| Theme | Preview |
| :--- | :--- |
| `default` | Light, clean |
| `dark` | Dark background |
| `tokyonight` | Purple/blue dark mode |
| `radical` | Pink/orange gradient |

Pass as `?theme=tokyonight` on any endpoint.

### Custom Colors

Override individual colors with hex codes (no `#`):

```markdown
![Custom Stats](https://github-stats-api.421mrdark.workers.dev/api/stats?username=ajit421&bg_color=0d1117&text_color=58a6ff&title_color=58a6ff&icon_color=58a6ff&hide_border=true)
```

---

## ⚙️ How It Works

```
GitHub API → Service → Cloudflare Cache API → Satori (JSX → SVG) → Response
```

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| Runtime | Cloudflare Workers | Serverless edge compute |
| Router | Hono | Lightweight HTTP framework |
| Renderer | Satori | JSX → SVG conversion |
| Cache | `caches.default` | Edge cache, zero config, zero cost |
| Font cache | CF Cache API (30-day TTL) | Avoids CDN round-trips for Inter font |

### Caching TTLs

| Endpoint | TTL |
| :--- | :--- |
| `/api/stats` | 4 hours |
| `/api/top-langs` | 2 hours |
| `/api/streak` | 2 hours |
| `/api/commit-activity` | 2 hours |

---

## 🛠️ Local Development

```bash
npm run dev        # Start wrangler dev server at :8787
npm run deploy     # Bundle and deploy to Cloudflare
npm run type-check # Run tsc --noEmit
```
