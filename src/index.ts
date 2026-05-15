// src/index.ts
import { Hono } from 'hono';
import type { Env } from './types/bindings';
import statsRoute from './routes/stats';
import langsRoute from './routes/langs';
import streakRoute from './routes/streak';
import activityRoute from './routes/activity';

const app = new Hono<{ Bindings: Env }>();

// ── Landing page ──────────────────────────────────────────────────────────────
app.get('/', (c) => {
  const html = `<!DOCTYPE html>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GitHub Stats Card Builder</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📊</text></svg>" />
  <style>
    /* ── Design Tokens ── */
    :root {
      --bg:       #0d1117;
      --surface:  #161b22;
      --surface2: #21262d;
      --border:   #30363d;
      --text:     #e6edf3;
      --muted:    #8b949e;
      --accent:   #58a6ff;
      --success:  #3fb950;
      --danger:   #f85149;
      --warning:  #e3b341;
      --radius:   8px;
      --mono:     'SF Mono','Fira Code','Cascadia Code',monospace;
      --sans:     -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { height: 100%; }

    body {
      font-family: var(--sans);
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* ── Header ── */
    header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(13,17,23,0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 0 24px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 15px;
      font-weight: 600;
      color: var(--text);
      text-decoration: none;
    }

    .header-logo svg { color: var(--accent); }

    .header-links {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-links a {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--muted);
      text-decoration: none;
      font-size: 13px;
      padding: 5px 10px;
      border-radius: var(--radius);
      transition: color 0.15s, background 0.15s;
    }
    .header-links a:hover { color: var(--text); background: var(--surface); }

    /* ── Main layout ── */
    main {
      flex: 1;
      display: flex;
    }

    /* ── Left panel ── */
    aside {
      width: 380px;
      flex-shrink: 0;
      background: var(--surface);
      border-right: 1px solid var(--border);
      overflow-y: auto;
      padding: 24px;
    }

    /* ── Right panel ── */
    section {
      flex: 1;
      min-width: 0;
      overflow-y: auto;
      padding: 24px 28px;
    }

    @media (max-width: 768px) {
      main { flex-direction: column; }
      aside { width: 100%; border-right: none; border-bottom: 1px solid var(--border); }
    }

    /* ── Typography ── */
    .panel-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
      margin-bottom: 12px;
      margin-top: 24px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }
    .panel-title:first-of-type { margin-top: 0; }

    /* ── Form Controls ── */
    .form-group { margin-bottom: 16px; }

    label.field-label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: var(--muted);
      margin-bottom: 6px;
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-wrap .input-icon {
      position: absolute;
      left: 10px;
      color: var(--muted);
      pointer-events: none;
    }

    input[type="text"] {
      width: 100%;
      padding: 9px 12px 9px 34px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--text);
      font-family: var(--sans);
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    input[type="text"]:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(88,166,255,0.12);
    }
    input[type="text"].valid { border-color: var(--success); }
    input[type="text"].invalid { border-color: var(--danger); }

    .input-status {
      position: absolute;
      right: 10px;
      font-size: 14px;
    }

    .error-msg {
      font-size: 11px;
      color: var(--danger);
      margin-top: 5px;
      display: none;
    }
    .error-msg.show { display: block; }

    /* ── Card type grid ── */
    .card-type-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 4px;
    }

    .card-type-btn {
      padding: 10px 8px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg);
      color: var(--muted);
      cursor: pointer;
      font-size: 12px;
      font-family: var(--sans);
      text-align: center;
      transition: all 0.15s;
      line-height: 1.4;
    }
    .card-type-btn:hover {
      border-color: var(--accent);
      color: var(--text);
    }
    .card-type-btn.active {
      border-color: var(--accent);
      background: rgba(88,166,255,0.08);
      color: var(--accent);
      font-weight: 600;
    }
    .card-type-btn .btn-icon { display: block; font-size: 18px; margin-bottom: 3px; }

    /* ── Theme swatches ── */
    .theme-row {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: none;
    }
    .theme-row::-webkit-scrollbar { display: none; }

    .theme-swatch {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      cursor: pointer;
    }

    .swatch-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid transparent;
      transition: border-color 0.15s, transform 0.15s;
    }
    .theme-swatch.active .swatch-circle {
      border-color: var(--accent);
      transform: scale(1.1);
    }

    .swatch-name {
      font-size: 10px;
      color: var(--muted);
      text-align: center;
    }
    .theme-swatch.active .swatch-name { color: var(--accent); }

    /* ── Toggle switch ── */
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .toggle-label { font-size: 13px; color: var(--text); }

    .toggle-input { display: none; }
    .toggle-switch {
      width: 36px;
      height: 20px;
      background: var(--border);
      border-radius: 10px;
      position: relative;
      cursor: pointer;
      transition: background 0.15s;
      flex-shrink: 0;
    }
    .toggle-switch::after {
      content: '';
      position: absolute;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #fff;
      top: 3px;
      left: 3px;
      transition: transform 0.15s;
    }
    .toggle-input:checked + .toggle-switch { background: var(--accent); }
    .toggle-input:checked + .toggle-switch::after { transform: translateX(16px); }

    /* ── Segmented control ── */
    .seg-control {
      display: flex;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      margin-bottom: 12px;
    }
    .seg-input { display: none; }
    .seg-label {
      flex: 1;
      text-align: center;
      padding: 7px 4px;
      font-size: 12px;
      color: var(--muted);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      border-right: 1px solid var(--border);
    }
    .seg-label:last-of-type { border-right: none; }
    .seg-input:checked + .seg-label {
      background: var(--accent);
      color: #fff;
      font-weight: 600;
    }

    /* ── Color pickers ── */
    .accordion-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      padding: 10px 0;
      user-select: none;
    }
    .accordion-header span { font-size: 13px; color: var(--text); font-weight: 500; }
    .accordion-arrow {
      font-size: 11px;
      color: var(--muted);
      transition: transform 0.2s;
    }
    .accordion-body { display: none; }
    .accordion-body.open { display: block; }
    .accordion-arrow.open { transform: rotate(180deg); }

    .color-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .color-row-label { font-size: 12px; color: var(--muted); flex: 1; }

    input[type="color"] {
      width: 30px;
      height: 30px;
      padding: 1px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--bg);
      cursor: pointer;
      flex-shrink: 0;
    }
    input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
    input[type="color"]::-webkit-color-swatch { border: none; border-radius: 4px; }

    .hex-input {
      width: 88px !important;
      font-family: var(--mono) !important;
      font-size: 12px !important;
      padding: 7px 10px !important;
    }

    .reset-colors-btn {
      width: 100%;
      padding: 7px;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--muted);
      font-size: 12px;
      font-family: var(--sans);
      cursor: pointer;
      transition: all 0.15s;
      margin-top: 8px;
    }
    .reset-colors-btn:hover { background: var(--surface2); color: var(--text); }

    /* ── Dimensions badge ── */
    .info-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 4px;
    }
    .badge {
      font-size: 11px;
      padding: 3px 8px;
      border: 1px solid var(--border);
      border-radius: 20px;
      color: var(--muted);
      background: var(--bg);
    }
    .badge strong { color: var(--text); }

    /* ── Note box ── */
    .note-box {
      background: rgba(227,179,65,0.1);
      border: 1px solid rgba(227,179,65,0.3);
      border-radius: var(--radius);
      padding: 8px 12px;
      font-size: 12px;
      color: var(--warning);
      margin-bottom: 12px;
    }

    /* ── Right panel ── */
    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 16px;
    }

    /* ── Preview area ── */
    .preview-box {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
      min-height: 220px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      margin-bottom: 12px;
      padding: 20px;
    }

    #preview-img {
      max-width: 100%;
      height: auto;
      display: block;
      border-radius: 4px;
    }

    /* Loading skeleton */
    .loading-overlay {
      position: absolute;
      inset: 0;
      background: var(--surface);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
      z-index: 5;
    }
    .loading-overlay.active { opacity: 1; pointer-events: auto; }

    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Error overlay */
    .error-overlay {
      position: absolute;
      inset: 0;
      background: rgba(13,17,23,0.93);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
      z-index: 6;
      padding: 20px;
      text-align: center;
    }
    .error-overlay.active { opacity: 1; pointer-events: auto; }
    .error-overlay .err-icon { font-size: 28px; }
    .error-overlay .err-title { font-size: 14px; font-weight: 600; color: var(--danger); }
    .error-overlay .err-msg { font-size: 12px; color: var(--muted); max-width: 320px; }

    /* Card info bar */
    .card-info-bar {
      font-size: 12px;
      color: var(--muted);
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }
    .card-info-bar span strong { color: var(--text); }

    /* ── Output tabs ── */
    .tabs-wrap { margin-bottom: 12px; }

    .tab-controls {
      display: flex;
      border-bottom: 1px solid var(--border);
      margin-bottom: 16px;
    }

    .tab-radio { display: none; }
    .tab-label {
      padding: 8px 16px;
      font-size: 13px;
      color: var(--muted);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: color 0.15s, border-color 0.15s;
    }
    .tab-label:hover { color: var(--text); }
    #tab-md:checked   ~ .tab-controls .label-md,
    #tab-html:checked ~ .tab-controls .label-html,
    #tab-url:checked  ~ .tab-controls .label-url {
      color: var(--accent);
      border-bottom-color: var(--accent);
      font-weight: 600;
    }

    .tab-panel { display: none; }
    #tab-md:checked   ~ .tab-panels .panel-md,
    #tab-html:checked ~ .tab-panels .panel-html,
    #tab-url:checked  ~ .tab-panels .panel-url { display: block; }

    .code-block {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 12px 14px;
      font-family: var(--mono);
      font-size: 12px;
      line-height: 1.6;
      overflow-x: auto;
      color: var(--text);
      word-break: break-all;
      white-space: pre-wrap;
      margin-bottom: 10px;
    }

    /* ── Buttons ── */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: var(--radius);
      font-size: 13px;
      font-family: var(--sans);
      cursor: pointer;
      transition: all 0.15s;
      border: 1px solid var(--border);
      background: var(--surface2);
      color: var(--text);
      text-decoration: none;
    }
    .btn:hover { background: var(--border); }
    .btn-primary { background: #238636; border-color: rgba(255,255,255,0.1); color: #fff; }
    .btn-primary:hover { background: #2ea043; }
    .btn-sm { padding: 5px 10px; font-size: 12px; }

    .btn-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }

    /* ── Share section ── */
    .share-box {
      margin-top: 24px;
      padding: 16px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }
    .share-box-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 8px;
    }
    .share-box p {
      font-size: 12px;
      color: var(--muted);
      margin-bottom: 10px;
    }

    /* ── Focus visible ── */
    :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  </style>
</head>
<body>

<!-- ══ HEADER ══ -->
<header>
  <a class="header-logo" href="#">
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
    </svg>
    GitHub Stats Card Builder
  </a>
  <div class="header-links">
    <a href="https://github.com/ajit421/github_status" target="_blank" rel="noopener">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
      Source
    </a>
    <a href="https://github.com/ajit421/github_status#readme" target="_blank" rel="noopener">
      📖 Docs
    </a>
  </div>
</header>

<!-- ══ MAIN ══ -->
<main>

  <!-- ══ LEFT PANEL: CONTROLS ══ -->
  <aside>

    <!-- ① USERNAME -->
    <div class="panel-title">GitHub Username</div>
    <div class="form-group">
      <div class="input-wrap">
        <svg class="input-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0zM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0z"/>
        </svg>
        <input type="text" id="username-input" value="ajit421" placeholder="Enter GitHub username..." autocomplete="off" spellcheck="false" />
        <span class="input-status" id="username-status"></span>
      </div>
      <div class="error-msg" id="username-error">⚠ Invalid GitHub username format</div>
    </div>

    <!-- ② CARD TYPE -->
    <div class="panel-title">Card Type</div>
    <div class="card-type-grid" id="card-type-grid">
      <button class="card-type-btn active" data-card="stats"><span class="btn-icon">📊</span>GitHub Stats</button>
      <button class="card-type-btn" data-card="top-langs"><span class="btn-icon">🌐</span>Top Languages</button>
      <button class="card-type-btn" data-card="streak"><span class="btn-icon">🔥</span>Streak Stats</button>
      <button class="card-type-btn" data-card="commit-activity"><span class="btn-icon">📈</span>Commit Activity</button>
    </div>

    <!-- ③ THEME -->
    <div class="panel-title">Theme</div>
    <div class="theme-row" id="theme-row">
      <div class="theme-swatch active" data-theme="tokyonight">
        <div class="swatch-circle" style="background:#1a1b26;"></div>
        <span class="swatch-name">tokyo<br>night</span>
      </div>
      <div class="theme-swatch" data-theme="default">
        <div class="swatch-circle" style="background:#ffffff; border: 1px solid #ccc;"></div>
        <span class="swatch-name">default</span>
      </div>
      <div class="theme-swatch" data-theme="dark">
        <div class="swatch-circle" style="background:#0d1117;"></div>
        <span class="swatch-name">dark</span>
      </div>
      <div class="theme-swatch" data-theme="radical">
        <div class="swatch-circle" style="background:#141321;"></div>
        <span class="swatch-name">radical</span>
      </div>
    </div>

    <!-- ④ CARD OPTIONS (dynamic) -->
    <div class="panel-title">Card Options</div>
    <div id="dynamic-options"></div>

    <!-- ⑤ CUSTOM COLORS (accordion) -->
    <div style="border: 1px solid var(--border); border-radius: var(--radius); padding: 0 14px; margin-bottom: 16px;">
      <div class="accordion-header" id="color-accordion-header">
        <span>🎨 Custom Colors <small style="font-size:10px;color:var(--muted)">(optional)</small></span>
        <span class="accordion-arrow" id="color-accordion-arrow">▼</span>
      </div>
      <div class="accordion-body" id="color-accordion-body">
        <div id="color-pickers"></div>
        <button class="reset-colors-btn" id="reset-colors-btn">↺ Reset Colors</button>
      </div>
    </div>

    <!-- ⑥ DIMENSIONS -->
    <div class="panel-title">Card Info</div>
    <div class="info-badges">
      <span class="badge">📐 <strong id="info-dimensions">495 × 195 px</strong></span>
      <span class="badge">⏱ Cache: <strong id="info-ttl">4h</strong></span>
      <span class="badge">🎨 <strong id="info-theme">tokyonight</strong></span>
    </div>

  </aside>

  <!-- ══ RIGHT PANEL: PREVIEW + OUTPUT ══ -->
  <section>

    <div class="section-title">Live Preview</div>

    <!-- Preview box -->
    <div class="preview-box" id="preview-box">
      <div class="loading-overlay active" id="loading-overlay">
        <div class="spinner"></div>
      </div>
      <div class="error-overlay" id="error-overlay">
        <span class="err-icon">⚠️</span>
        <span class="err-title">Preview Error</span>
        <span class="err-msg" id="error-msg-text">Something went wrong loading the card.</span>
      </div>
      <img id="preview-img" alt="Card Preview" crossorigin="anonymous" />
    </div>

    <!-- Card info bar -->
    <div class="card-info-bar">
      <span>📐 <strong id="bar-dim">495 × 195 px</strong></span>
      <span>⏱ Cache: <strong id="bar-ttl">4h</strong></span>
      <span>🎨 <strong id="bar-theme">tokyonight</strong></span>
    </div>

    <!-- ══ OUTPUT TABS ══ -->
    <div class="section-title">Embed Code</div>
    <div class="tabs-wrap">
      <input type="radio" name="tab" id="tab-md" class="tab-radio" checked />
      <input type="radio" name="tab" id="tab-html" class="tab-radio" />
      <input type="radio" name="tab" id="tab-url" class="tab-radio" />

      <div class="tab-controls">
        <label class="tab-label label-md" for="tab-md">Markdown</label>
        <label class="tab-label label-html" for="tab-html">HTML</label>
        <label class="tab-label label-url" for="tab-url">Direct URL</label>
      </div>

      <div class="tab-panels">
        <div class="tab-panel panel-md">
          <div class="code-block" id="code-markdown"></div>
          <div class="btn-row">
            <button class="btn btn-primary" id="copy-md-btn">📋 Copy Markdown</button>
          </div>
        </div>
        <div class="tab-panel panel-html">
          <div class="code-block" id="code-html"></div>
          <div class="btn-row">
            <button class="btn btn-primary" id="copy-html-btn">📋 Copy HTML</button>
          </div>
        </div>
        <div class="tab-panel panel-url">
          <div class="code-block" id="code-url"></div>
          <div class="btn-row">
            <button class="btn btn-primary" id="copy-url-btn">📋 Copy URL</button>
            <button class="btn" id="open-url-btn">↗ Open in Tab</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ SHARE ══ -->
    <div class="share-box">
      <div class="share-box-title">🔗 Share This Config</div>
      <p>Copy a link with all your settings encoded — anyone who opens it will see the same configuration.</p>
      <div class="btn-row">
        <button class="btn" id="share-btn">🔗 Copy Share Link</button>
      </div>
    </div>

  </section>
</main>

<script>
// ══════════════════════════════════════
// STATE
// ══════════════════════════════════════
const state = {
  username:    'ajit421',
  cardType:    'stats',
  theme:       'tokyonight',
  hideBorder:  false,
  // stats
  customTitle: '',
  hideRank:    false,
  showIcons:   true,
  // langs
  layout:      'normal',
  // colors
  bgColor:     '',
  textColor:   '',
  titleColor:  '',
  iconColor:   '',
  borderColor: '',
};

// ══════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════
const API_BASE = 'https://github-stats-api.421mrdark.workers.dev';

const ENDPOINTS = {
  stats:           '/api/stats',
  'top-langs':     '/api/top-langs',
  streak:          '/api/streak',
  'commit-activity': '/api/commit-activity',
};

const CARD_DIMENSIONS = {
  stats:             { w: 495, h: 195 },
  'top-langs':       { w: 495, h: 195 },
  streak:            { w: 495, h: 195 },
  'commit-activity': { w: 495, h: 260 },
};

const CACHE_TTLS = {
  stats:             '4h',
  'top-langs':       '2h',
  streak:            '2h',
  'commit-activity': '2h',
};

const CARD_LABELS = {
  stats:             'GitHub Stats',
  'top-langs':       'Top Languages',
  streak:            'Streak Stats',
  'commit-activity': 'Commit Activity',
};

const USERNAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9\-]{0,38}$/;
const HEX_REGEX = /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/;

const COLOR_FIELDS = [
  { key: 'bgColor',     param: 'bg_color',     label: 'Background' },
  { key: 'textColor',   param: 'text_color',   label: 'Text Color' },
  { key: 'titleColor',  param: 'title_color',  label: 'Title Color' },
  { key: 'iconColor',   param: 'icon_color',   label: 'Icon Color' },
  { key: 'borderColor', param: 'border_color', label: 'Border Color' },
];

// ══════════════════════════════════════
// URL BUILDER
// ══════════════════════════════════════
function buildApiUrl() {
  if (!USERNAME_REGEX.test(state.username)) return null;
  const url = new URL(API_BASE + ENDPOINTS[state.cardType]);
  url.searchParams.set('username', state.username);
  if (state.theme && state.theme !== 'default') url.searchParams.set('theme', state.theme);
  if (state.hideBorder) url.searchParams.set('hide_border', 'true');

  if (state.cardType === 'stats') {
    if (state.customTitle) url.searchParams.set('custom_title', state.customTitle);
    if (state.hideRank)    url.searchParams.set('hide_rank', 'true');
    if (!state.showIcons)  url.searchParams.set('show_icons', 'false');
  }
  if (state.cardType === 'top-langs' && state.layout !== 'normal') {
    url.searchParams.set('layout', state.layout);
  }

  for (const { key, param } of COLOR_FIELDS) {
    const val = state[key];
    if (val && HEX_REGEX.test(val.replace('#', ''))) {
      url.searchParams.set(param, val.replace('#', ''));
    }
  }
  return url.toString();
}

// ══════════════════════════════════════
// PREVIEW ENGINE
// ══════════════════════════════════════
let debounceTimer = null;
const img = document.getElementById('preview-img');
const loadingOverlay = document.getElementById('loading-overlay');
const errorOverlay = document.getElementById('error-overlay');
const errorMsgEl = document.getElementById('error-msg-text');

function triggerUpdate() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(updateAll, 400);
}

function updateAll() {
  updateInfoBars();
  updateOutputCodes();
  updatePreview();
}

function updateInfoBars() {
  const dim = CARD_DIMENSIONS[state.cardType];
  const dimStr = \`\${dim.w} × \${dim.h} px\`;
  const ttl = CACHE_TTLS[state.cardType];
  document.getElementById('info-dimensions').textContent = dimStr;
  document.getElementById('info-ttl').textContent = ttl;
  document.getElementById('info-theme').textContent = state.theme;
  document.getElementById('bar-dim').textContent = dimStr;
  document.getElementById('bar-ttl').textContent = ttl;
  document.getElementById('bar-theme').textContent = state.theme;
}

function updateOutputCodes() {
  const url = buildApiUrl();
  if (!url) return;
  const label = CARD_LABELS[state.cardType];
  const dim = CARD_DIMENSIONS[state.cardType];
  document.getElementById('code-markdown').textContent = \`![\${label}](\${url})\`;
  document.getElementById('code-html').textContent = \`<img src="\${url}" alt="\${label}" width="\${dim.w}" />\`;
  document.getElementById('code-url').textContent = url;
}

function updatePreview() {
  const url = buildApiUrl();
  if (!url) return;

  loadingOverlay.classList.add('active');
  errorOverlay.classList.remove('active');

  const newImg = new Image();
  newImg.crossOrigin = 'anonymous';
  newImg.onload = () => {
    img.src = newImg.src;
    loadingOverlay.classList.remove('active');
  };
  newImg.onerror = () => {
    loadingOverlay.classList.remove('active');
    errorMsgEl.textContent = 'Failed to load card from API. Check username or try again.';
    errorOverlay.classList.add('active');
  };
  // Cache-bust to avoid stale previews during same session
  newImg.src = url + '&_t=' + Date.now();
}

// ══════════════════════════════════════
// OUTPUT GENERATOR
// ══════════════════════════════════════
// (handled inline in updateOutputCodes above)

// ══════════════════════════════════════
// SHARE / DEEP LINK
// ══════════════════════════════════════
function encodeStateToUrl() {
  const params = new URLSearchParams();
  params.set('u', state.username);
  params.set('card', state.cardType);
  params.set('theme', state.theme);
  if (state.hideBorder)  params.set('hb', '1');
  if (state.hideRank)    params.set('hr', '1');
  if (!state.showIcons)  params.set('si', '0');
  if (state.customTitle) params.set('ct', state.customTitle);
  if (state.layout !== 'normal') params.set('layout', state.layout);
  for (const { key, param } of COLOR_FIELDS) {
    if (state[key]) params.set(param, state[key].replace('#', ''));
  }
  return window.location.href.split('?')[0] + '?' + params.toString();
}

function decodeUrlToState(search) {
  const p = new URLSearchParams(search);
  if (p.has('u'))      state.username    = p.get('u');
  if (p.has('card'))   state.cardType    = p.get('card');
  if (p.has('theme'))  state.theme       = p.get('theme');
  state.hideBorder  = p.get('hb') === '1';
  state.hideRank    = p.get('hr') === '1';
  state.showIcons   = p.get('si') !== '0';
  if (p.has('ct'))     state.customTitle = p.get('ct');
  if (p.has('layout')) state.layout      = p.get('layout');
  for (const { key, param } of COLOR_FIELDS) {
    if (p.has(param)) state[key] = p.get(param);
  }
}

// ══════════════════════════════════════
// DOM RENDERERS
// ══════════════════════════════════════
function renderCardOptions() {
  const container = document.getElementById('dynamic-options');
  let html = '';

  if (state.cardType === 'stats') {
    html = \`
      <div class="form-group">
        <label class="field-label" for="opt-custom-title">Custom Title</label>
        <div class="input-wrap">
          <svg class="input-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 2h13a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm.25 5h11.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5zm0 4h8a.75.75 0 0 1 0 1.5h-8a.75.75 0 0 1 0-1.5z"/></svg>
          <input type="text" id="opt-custom-title" placeholder="e.g. My GitHub Stats" value="\${escapeAttr(state.customTitle)}" />
        </div>
      </div>
      <div class="toggle-row">
        <span class="toggle-label">Hide Rank</span>
        <label><input type="checkbox" id="opt-hide-rank" class="toggle-input" \${state.hideRank ? 'checked' : ''}><span class="toggle-switch"></span></label>
      </div>
      <div class="toggle-row">
        <span class="toggle-label">Show Icons</span>
        <label><input type="checkbox" id="opt-show-icons" class="toggle-input" \${state.showIcons ? 'checked' : ''}><span class="toggle-switch"></span></label>
      </div>
      <div class="toggle-row">
        <span class="toggle-label">Hide Border</span>
        <label><input type="checkbox" id="opt-hide-border" class="toggle-input" \${state.hideBorder ? 'checked' : ''}><span class="toggle-switch"></span></label>
      </div>\`;
  } else if (state.cardType === 'top-langs') {
    html = \`
      <label class="field-label">Layout</label>
      <div class="seg-control">
        <input type="radio" name="opt-layout" id="layout-normal" class="seg-input" value="normal" \${state.layout === 'normal' ? 'checked' : ''}>
        <label class="seg-label" for="layout-normal">Normal</label>
        <input type="radio" name="opt-layout" id="layout-compact" class="seg-input" value="compact" \${state.layout === 'compact' ? 'checked' : ''}>
        <label class="seg-label" for="layout-compact">Compact</label>
        <input type="radio" name="opt-layout" id="layout-pie" class="seg-input" value="pie" \${state.layout === 'pie' ? 'checked' : ''}>
        <label class="seg-label" for="layout-pie">Pie</label>
      </div>
      <div class="toggle-row">
        <span class="toggle-label">Hide Border</span>
        <label><input type="checkbox" id="opt-hide-border" class="toggle-input" \${state.hideBorder ? 'checked' : ''}><span class="toggle-switch"></span></label>
      </div>\`;
  } else if (state.cardType === 'streak') {
    html = \`
      <div class="note-box">⚠️ Streak endpoint requires <code>GITHUB_TOKEN</code> configured on the server.</div>
      <div class="toggle-row">
        <span class="toggle-label">Hide Border</span>
        <label><input type="checkbox" id="opt-hide-border" class="toggle-input" \${state.hideBorder ? 'checked' : ''}><span class="toggle-switch"></span></label>
      </div>\`;
  } else if (state.cardType === 'commit-activity') {
    html = \`
      <div class="toggle-row">
        <span class="toggle-label">Hide Border</span>
        <label><input type="checkbox" id="opt-hide-border" class="toggle-input" \${state.hideBorder ? 'checked' : ''}><span class="toggle-switch"></span></label>
      </div>\`;
  }

  container.innerHTML = html;
  bindOptionListeners();
}

function renderColorPickers() {
  const container = document.getElementById('color-pickers');
  const showIcon = state.cardType === 'stats' || state.cardType === 'streak';
  const fields = COLOR_FIELDS.filter(f => showIcon || f.key !== 'iconColor');

  container.innerHTML = fields.map(({ key, label }) => {
    const hexVal = state[key] ? state[key].replace('#', '') : '';
    const colorVal = hexVal.length === 6 ? '#' + hexVal : '#000000';
    return \`
      <div class="color-row">
        <span class="color-row-label">\${label}</span>
        <input type="color" data-key="\${key}" data-kind="picker" value="\${colorVal}" />
        <input type="text" class="hex-input" data-key="\${key}" data-kind="hex" placeholder="hex" value="\${hexVal}" maxlength="6" />
      </div>\`;
  }).join('');

  // Bind color inputs
  container.querySelectorAll('input[data-key]').forEach(el => {
    el.addEventListener('input', e => {
      const k = e.target.dataset.key;
      const kind = e.target.dataset.kind;
      if (kind === 'picker') {
        const hex = e.target.value.slice(1);
        state[k] = hex;
        const hexEl = container.querySelector(\`input[data-key="\${k}"][data-kind="hex"]\`);
        if (hexEl) hexEl.value = hex;
      } else {
        let hex = e.target.value.replace(/[^a-fA-F0-9]/g, '');
        state[k] = hex;
        if (hex.length === 6) {
          const pickerEl = container.querySelector(\`input[data-key="\${k}"][data-kind="picker"]\`);
          if (pickerEl) pickerEl.value = '#' + hex;
        }
      }
      triggerUpdate();
    });
  });
}

function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// ══════════════════════════════════════
// EVENT BINDING
// ══════════════════════════════════════
function bindOptionListeners() {
  const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('input', fn); };
  const bindChk = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('change', fn); };

  bind('opt-custom-title', e => { state.customTitle = e.target.value; triggerUpdate(); });
  bindChk('opt-hide-rank',   e => { state.hideRank = e.target.checked; triggerUpdate(); });
  bindChk('opt-show-icons',  e => { state.showIcons = e.target.checked; triggerUpdate(); });
  bindChk('opt-hide-border', e => { state.hideBorder = e.target.checked; triggerUpdate(); });

  document.querySelectorAll('input[name="opt-layout"]').forEach(r => {
    r.addEventListener('change', e => { if (e.target.checked) { state.layout = e.target.value; triggerUpdate(); } });
  });
}

// ══════════════════════════════════════
// CLIPBOARD
// ══════════════════════════════════════
async function copyToClipboard(text, btn, original) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:-9999px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    btn.textContent = '✓ Copied!';
    setTimeout(() => { btn.textContent = original; }, 2000);
  } catch (err) {
    console.error('Copy failed', err);
  }
}

// ══════════════════════════════════════
// INIT & BIND ALL EVENTS
// ══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

  // Decode URL params (deep link)
  if (window.location.search) {
    decodeUrlToState(window.location.search);
  }

  // Username input
  const usernameInput = document.getElementById('username-input');
  const usernameError = document.getElementById('username-error');
  const usernameStatus = document.getElementById('username-status');

  usernameInput.value = state.username;

  usernameInput.addEventListener('input', e => {
    const val = e.target.value.trim();
    state.username = val;
    if (!val || USERNAME_REGEX.test(val)) {
      usernameInput.classList.remove('invalid');
      usernameError.classList.remove('show');
      usernameStatus.textContent = val ? '✓' : '';
      usernameInput.classList.toggle('valid', !!val);
    } else {
      usernameInput.classList.add('invalid');
      usernameInput.classList.remove('valid');
      usernameError.classList.add('show');
      usernameStatus.textContent = '';
    }
    triggerUpdate();
  });

  // Card type buttons
  document.getElementById('card-type-grid').addEventListener('click', e => {
    const btn = e.target.closest('.card-type-btn');
    if (!btn) return;
    document.querySelectorAll('.card-type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.cardType = btn.dataset.card;
    state.hideBorder = false;
    renderCardOptions();
    renderColorPickers();
    triggerUpdate();
  });

  // Theme swatches
  document.getElementById('theme-row').addEventListener('click', e => {
    const sw = e.target.closest('.theme-swatch');
    if (!sw) return;
    document.querySelectorAll('.theme-swatch').forEach(s => s.classList.remove('active'));
    sw.classList.add('active');
    state.theme = sw.dataset.theme;
    triggerUpdate();
  });

  // Accordion
  document.getElementById('color-accordion-header').addEventListener('click', () => {
    const body = document.getElementById('color-accordion-body');
    const arrow = document.getElementById('color-accordion-arrow');
    body.classList.toggle('open');
    arrow.classList.toggle('open');
  });

  // Reset colors
  document.getElementById('reset-colors-btn').addEventListener('click', () => {
    for (const { key } of COLOR_FIELDS) state[key] = '';
    renderColorPickers();
    triggerUpdate();
  });

  // Copy buttons
  document.getElementById('copy-md-btn').addEventListener('click', function() {
    copyToClipboard(document.getElementById('code-markdown').textContent, this, '📋 Copy Markdown');
  });
  document.getElementById('copy-html-btn').addEventListener('click', function() {
    copyToClipboard(document.getElementById('code-html').textContent, this, '📋 Copy HTML');
  });
  document.getElementById('copy-url-btn').addEventListener('click', function() {
    copyToClipboard(document.getElementById('code-url').textContent, this, '📋 Copy URL');
  });
  document.getElementById('open-url-btn').addEventListener('click', () => {
    const url = document.getElementById('code-url').textContent;
    if (url) window.open(url, '_blank', 'noopener');
  });

  // Share button
  document.getElementById('share-btn').addEventListener('click', function() {
    copyToClipboard(encodeStateToUrl(), this, '🔗 Copy Share Link');
  });

  // Initial render
  renderCardOptions();
  renderColorPickers();

  // Sync theme swatch UI with decoded state
  document.querySelectorAll('.theme-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.theme === state.theme);
  });

  // Sync card type btn
  document.querySelectorAll('.card-type-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.card === state.cardType);
  });

  updateAll();
});
</script>

</body>
</html>`;

  return c.html(html);
});

// ── Card routes ───────────────────────────────────────────────────────────────
app.route('/api/stats', statsRoute);
app.route('/api/top-langs', langsRoute);
app.route('/api/streak', streakRoute);
app.route('/api/commit-activity', activityRoute);

export default app;