// src/index.ts
import { Hono } from "hono";
import { handle } from "hono/vercel";
import stats from './routes/stats';
import langs from './routes/langs';
import streak from './routes/streak';
import activity from './routes/activity';

// ── Runtime declaration (Vercel Edge) ─────────────────────────────────────────
// Vercel reads this export to select the Edge runtime for this function.
export const config = { runtime: "edge" };

// ── App ───────────────────────────────────────────────────────────────────────

const app = new Hono();

// Health check
app.get("/", (c) =>
  c.json({
    status: "OK",
    endpoints: [
      "/api/stats",
      "/api/top-langs",
      "/api/streak",
      "/api/commit-activity",
    ],
  })
);

// Card routes
app.route("/api/stats", stats);
app.route("/api/top-langs", langs);
app.route("/api/streak", streak);
app.route("/api/commit-activity", activity);

// ── Local dev (Node.js) ───────────────────────────────────────────────────────
// Only runs when executed directly via `npm run dev` (tsx watch).
if (process.env.NODE_ENV !== "production") {
  import("@hono/node-server").then(({ serve }) => {
    const port = Number(process.env.PORT ?? 3000);
    serve({ fetch: app.fetch, port }, () =>
      console.log(`▲ Local dev server running at http://localhost:${port}`)
    );
  });
}

// ── Vercel Edge export ────────────────────────────────────────────────────────
export default handle(app);
