// src/index.ts
import { Hono } from 'hono';
import type { Env } from './types/bindings';
import statsRoute    from './routes/stats';
import langsRoute    from './routes/langs';
import streakRoute   from './routes/streak';
import activityRoute from './routes/activity';

const app = new Hono<{ Bindings: Env }>();

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (c) =>
  c.json({
    status:  'OK',
    runtime: 'Cloudflare Workers',
    endpoints: [
      '/api/stats',
      '/api/top-langs',
      '/api/streak',
      '/api/commit-activity',
    ],
  })
);

// ── Card routes ───────────────────────────────────────────────────────────────
app.route('/api/stats',           statsRoute);
app.route('/api/top-langs',       langsRoute);
app.route('/api/streak',          streakRoute);
app.route('/api/commit-activity', activityRoute);

// ── Cloudflare Workers export ─────────────────────────────────────────────────
// Hono's `app` object exposes a `.fetch(request, env, ctx)` method that matches
// the Cloudflare Workers module handler signature exactly.
// DO NOT add a Node.js `serve()` call here — it will break in Workers.
export default app;
