// src/index.ts
import { Hono } from 'hono';
import type { Env } from './types/bindings';
import statsRoute from './routes/stats';
import langsRoute from './routes/langs';
import streakRoute from './routes/streak';
import activityRoute from './routes/activity';
import profileRoute from './routes/profile';
import repoRoute from './routes/repo';
import productiveTimeRoute from './routes/productive-time';
import activityGraphRoute from './routes/activity-graph';

const app = new Hono<{ Bindings: Env }>();

// ── Landing / Builder page ────────────────────────────────────────────────────
app.get('/', (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>GitHub Stats Card Builder</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📊</text></svg>"/>
<style>
:root{
  --bg:#0d1117;--surface:#161b22;--surface2:#21262d;--surface3:#2d333b;
  --border:#30363d;--border2:#444c56;
  --text:#e6edf3;--muted:#8b949e;--muted2:#6e7681;
  --accent:#58a6ff;--accent-dim:rgba(88,166,255,.12);
  --success:#3fb950;--danger:#f85149;--warning:#e3b341;--info:#79c0ff;
  --purple:#bc8cff;--orange:#ffa657;
  --radius:8px;--radius-sm:6px;--radius-lg:12px;
  --mono:'SF Mono','Fira Code','Cascadia Code',monospace;
  --sans:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
  --shadow:0 10px 30px -10px rgba(0,0,0,0.5);
  --shadow-lg:0 20px 40px -15px rgba(0,0,0,0.6);
  --transition:0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --glass-bg: rgba(13, 17, 23, 0.8);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{height:100%;scroll-behavior:smooth}
body{font-family:var(--sans);background:var(--bg);color:var(--text);min-height:100vh;display:flex;flex-direction:column;font-size:14px;line-height:1.5;overflow-x:hidden}

/* ── Scrollbar ── */
::-webkit-scrollbar{width:8px;height:8px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:10px;border:2px solid var(--bg)}
::-webkit-scrollbar-thumb:hover{background:var(--muted2)}

/* ── Header ── */
header{
  position:sticky;top:0;z-index:200;
  height:60px;padding:0 24px;
  background:var(--glass-bg);
  backdrop-filter:blur(12px) saturate(180%);
  -webkit-backdrop-filter:blur(12px) saturate(180%);
  border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
  gap:16px;
}
.hd-logo{display:flex;align-items:center;gap:10px;font-size:16px;font-weight:700;color:var(--text);text-decoration:none;white-space:nowrap;letter-spacing:-0.01em}
.hd-logo svg{color:var(--accent);filter:drop-shadow(0 0 8px var(--accent-dim))}
.hd-links{display:flex;align-items:center;gap:8px}
.hd-link{
  display:flex;align-items:center;gap:6px;padding:6px 12px;
  border-radius:var(--radius-sm);font-size:13px;color:var(--muted);
  text-decoration:none;transition:all var(--transition);white-space:nowrap;
}
.hd-link:hover{color:var(--text);background:var(--surface2)}
.hd-badge{
  font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;
  background:var(--accent-dim);color:var(--accent);margin-left:4px;
  text-transform:uppercase;letter-spacing:0.02em;
}
.hd-token-btn{
  display:flex;align-items:center;gap:6px;padding:6px 14px;
  border:1px solid var(--border);border-radius:var(--radius-sm);
  font-size:13px;color:var(--muted);background:var(--surface);
  cursor:pointer;transition:all var(--transition);font-family:var(--sans);
}
.hd-token-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-dim)}
.hd-token-btn.has-token{border-color:var(--success);color:var(--success);background:rgba(63,185,80,0.1)}

/* ── Main layout ── */
main{flex:1;display:flex;overflow:hidden;height:calc(100vh - 60px)}

/* ── Sidebar ── */
aside{
  width:340px;min-width:300px;max-width:400px;
  flex-shrink:0;overflow-y:auto;
  background:var(--surface);
  border-right:1px solid var(--border);
  display:flex;flex-direction:column;
  box-shadow:4px 0 24px rgba(0,0,0,0.2);
  z-index:10;
}
.aside-inner{padding:24px;flex:1}

/* ── Right panel ── */
section{flex:1;min-width:0;overflow-y:auto;background:var(--bg);display:flex;flex-direction:column}
.section-inner{padding:40px 48px;flex:1;max-width:1200px;margin:0 auto;width:100%}

/* ── Hero ── */
.hero{margin-bottom:32px;animation:fadeIn 0.6s ease-out}
.hero h1{font-size:28px;font-weight:800;letter-spacing:-0.03em;margin-bottom:8px;background:linear-gradient(135deg,#fff 0%,#8b949e 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero p{font-size:15px;color:var(--muted);max-width:600px;line-height:1.6}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

/* ── Panel section title ── */
.pt{
  font-size:11px;font-weight:700;text-transform:uppercase;
  letter-spacing:.1em;color:var(--muted2);
  margin:24px 0 12px;padding-bottom:8px;
  border-bottom:1px solid var(--border);
}
.pt:first-child{margin-top:0}

/* ── Form Controls ── */
.fg{margin-bottom:16px}
.fl{display:block;font-size:12px;font-weight:600;color:var(--muted);margin-bottom:6px}

.iw{position:relative;display:flex;align-items:center}
.iw .ii{position:absolute;left:10px;color:var(--muted2);pointer-events:none;flex-shrink:0}

input[type=text],input[type=number],select,textarea{
  width:100%;padding:9px 12px 9px 34px;
  background:var(--bg);border:1px solid var(--border);
  border-radius:var(--radius-sm);color:var(--text);
  font-family:var(--sans);font-size:14px;outline:none;
  transition:all var(--transition);
  appearance:none;
}
input[type=text].no-icon,input[type=number].no-icon,select.no-icon{padding-left:12px}
input[type=text]:focus,input[type=number]:focus,select:focus,textarea:focus{
  border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-dim);
  background:var(--surface2);
}
input.valid{border-color:var(--success)!important;box-shadow:0 0 0 3px rgba(63,185,80,0.1)!important}
input.invalid{border-color:var(--danger)!important;box-shadow:0 0 0 3px rgba(248,81,73,0.1)!important}
.istat{position:absolute;right:10px;font-size:14px}
.errmsg{font-size:12px;color:var(--danger);margin-top:6px;display:none;font-weight:500}
.errmsg.show{display:block}

/* ── Card type grid ── */
.ct-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:4px}
.ct-btn{
  padding:14px 8px;border:1px solid var(--border);
  border-radius:var(--radius);background:var(--surface2);
  color:var(--muted);cursor:pointer;font-size:12px;
  font-family:var(--sans);text-align:center;transition:all var(--transition);
  line-height:1.4;display:flex;flex-direction:column;align-items:center;justify-content:center;
}
.ct-btn:hover{
  border-color:var(--accent);color:var(--text);
  transform:translateY(-2px);
  box-shadow:0 4px 12px rgba(0,0,0,0.3);
  background:var(--surface3);
}
.ct-btn.active{
  border-color:var(--accent);
  background:var(--accent-dim);
  color:var(--accent);
  font-weight:700;
  box-shadow:0 0 0 1px var(--accent), 0 0 16px var(--accent-dim);
}
.ct-icon{display:block;font-size:20px;margin-bottom:4px;filter:grayscale(0.2);transition:all var(--transition)}
.ct-btn:hover .ct-icon{filter:grayscale(0) scale(1.1);transform:rotate(3deg)}
.ct-btn.active .ct-icon{filter:grayscale(0) drop-shadow(0 0 4px var(--accent))}

/* ── Theme swatches ── */
.th-row{display:flex;gap:10px;overflow-x:auto;padding-bottom:8px;scrollbar-width:none;mask-image:linear-gradient(to right, black 85%, transparent)}
.th-row::-webkit-scrollbar{display:none}
.th-sw{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;flex-shrink:0;padding:4px;border-radius:var(--radius-sm);transition:all var(--transition)}
.th-sw:hover{background:var(--surface2)}
.sw-c{
  width:32px;height:32px;border-radius:50%;
  border:2px solid transparent;transition:all var(--transition);
  box-shadow:0 4px 8px rgba(0,0,0,0.2);
}
.th-sw.active .sw-c{border-color:var(--accent);transform:scale(1.15);box-shadow:0 0 0 2px var(--bg), 0 0 0 4px var(--accent)}
.sw-n{font-size:10px;color:var(--muted);text-align:center;line-height:1.2;font-weight:500}
.th-sw.active .sw-n{color:var(--text);font-weight:700}

/* ── Toggle ── */
.tog-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding:8px;border-radius:var(--radius-sm);transition:background var(--transition)}
.tog-row:hover{background:var(--surface2)}
.tog-lbl{font-size:13px;font-weight:500;color:var(--text)}
.tog-sub{font-size:11px;color:var(--muted2);display:block;margin-top:2px}
input.tog{display:none}
.tog-sw{
  width:38px;height:20px;background:var(--border2);border-radius:10px;
  position:relative;cursor:pointer;transition:background var(--transition);flex-shrink:0;
}
.tog-sw::after{
  content:'';position:absolute;width:14px;height:14px;border-radius:50%;
  background:#fff;top:3px;left:3px;transition:transform var(--transition);
  box-shadow:0 2px 4px rgba(0,0,0,0.2);
}
input.tog:checked+.tog-sw{background:var(--success)}
input.tog:checked+.tog-sw::after{transform:translateX(18px)}

/* ── Segmented ── */
.seg{
  display:flex;background:var(--bg);border:1px solid var(--border);
  border-radius:var(--radius-sm);overflow:hidden;margin-bottom:12px;
}
.seg-i{display:none}
.seg-l{
  flex:1;text-align:center;padding:8px 4px;font-size:12px;
  color:var(--muted);cursor:pointer;transition:all var(--transition);
  border-right:1px solid var(--border);font-weight:500;
}
.seg-l:last-of-type{border-right:none}
.seg-l:hover{background:var(--surface2);color:var(--text)}
.seg-i:checked+.seg-l{background:var(--accent);color:#fff;font-weight:700}

/* ── Accordion ── */
.acc{border:1px solid var(--border);border-radius:var(--radius);margin-bottom:16px;overflow:hidden;background:var(--surface2)}
.acc-h{
  display:flex;align-items:center;justify-content:space-between;
  padding:12px 16px;cursor:pointer;user-select:none;
  background:var(--surface2);transition:all var(--transition);
}
.acc-h:hover{background:var(--surface3)}
.acc-ht{font-size:13px;font-weight:600;color:var(--text);display:flex;align-items:center;gap:8px}
.acc-arr{font-size:10px;color:var(--muted2);transition:transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)}
.acc-arr.open{transform:rotate(180deg)}
.acc-b{display:none;padding:16px;background:var(--surface);border-top:1px solid var(--border);animation:slideDown 0.3s ease-out}
@keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
.acc-b.open{display:block}

/* ── Color pickers ── */
.cr-row{display:flex;align-items:center;gap:12px;margin-bottom:10px}
.cr-lbl{font-size:12px;font-weight:500;color:var(--muted);flex:1}
input[type=color]{
  width:32px;height:32px;padding:2px;border:1px solid var(--border);
  border-radius:50%;background:var(--bg);cursor:pointer;flex-shrink:0;
  transition:all var(--transition);
}
input[type=color]:hover{transform:scale(1.1);border-color:var(--muted)}
input[type=color]::-webkit-color-swatch-wrapper{padding:0}
input[type=color]::-webkit-color-swatch{border:none;border-radius:50%}
.hex-in{width:90px!important;font-family:var(--mono)!important;font-size:12px!important;padding:6px 10px!important;text-align:center}
.hex-in.no-icon{padding-left:10px!important}

/* ── Size inputs ── */
.size-row{display:flex;gap:12px;margin-bottom:12px}
.size-row .fg{flex:1;margin-bottom:0}

/* ── Info badges ── */
.badges{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px}
.badge{
  font-size:12px;padding:4px 12px;border:1px solid var(--border);
  border-radius:20px;color:var(--muted);background:var(--surface2);
  transition:all var(--transition);
}
.badge:hover{border-color:var(--muted2);color:var(--text)}
.badge strong{color:var(--text);font-weight:700}

/* ── Note box ── */
.note{
  background:rgba(227,179,65,.1);border:1px solid rgba(227,179,65,.3);
  border-radius:var(--radius-sm);padding:10px 14px;font-size:12px;color:var(--warning);
  margin-bottom:16px;line-height:1.6;
}
.note a{color:var(--accent);font-weight:600;text-decoration:none}
.note a:hover{text-decoration:underline}

/* ── Reset btn ── */
.reset-btn{
  width:100%;padding:8px;background:transparent;border:1px solid var(--border);
  border-radius:var(--radius-sm);color:var(--muted);font-size:12px;
  font-family:var(--sans);cursor:pointer;transition:all var(--transition);margin-top:8px;
  font-weight:500;
}
.reset-btn:hover{background:var(--surface3);color:var(--text);border-color:var(--muted2)}

/* ── Right: preview ── */
.rtitle{font-size:14px;font-weight:700;color:var(--text);margin-bottom:16px;display:flex;align-items:center;gap:10px}
.rtitle-badge{font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:var(--surface3);color:var(--accent);text-transform:uppercase;letter-spacing:0.02em}

.preview-box{
  border:1px solid var(--border);border-radius:var(--radius-lg);
  background:var(--surface);min-height:300px;
  display:flex;align-items:center;justify-content:center;
  position:relative;overflow:hidden;margin-bottom:16px;padding:48px;
  box-shadow:var(--shadow-lg);
  transition:all var(--transition);
}
.preview-box.checkered{
  background-image:repeating-conic-gradient(var(--surface2) 0% 25%,var(--surface) 0% 50%);
  background-size:24px 24px;
}
#prev-img{max-width:100%;height:auto;display:block;border-radius:var(--radius);position:relative;z-index:1;box-shadow:0 10px 40px rgba(0,0,0,0.4);transition:transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)}
.preview-box:hover #prev-img{transform:scale(1.02)}

.lov{
  position:absolute;inset:0;background:rgba(22, 27, 34, 0.7);
  backdrop-filter:blur(4px);
  display:flex;align-items:center;justify-content:center;
  opacity:0;pointer-events:none;transition:opacity .3s;z-index:5;
}
.lov.active{opacity:1;pointer-events:auto}
.spin{
  width:32px;height:32px;border:3px solid var(--border);
  border-top-color:var(--accent);border-radius:50%;animation:spin .8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
@keyframes spin{to{transform:rotate(360deg)}}

.eov{
  position:absolute;inset:0;background:rgba(13,17,23,.98);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:12px;opacity:0;pointer-events:none;transition:opacity .3s;z-index:6;padding:32px;text-align:center;
}
.eov.active{opacity:1;pointer-events:auto}
.eov .ei{font-size:32px}
.eov .et{font-size:16px;font-weight:700;color:var(--danger)}
.eov .em{font-size:13px;color:var(--muted);max-width:320px;line-height:1.5}

.card-info{font-size:12px;color:var(--muted);display:flex;gap:20px;flex-wrap:wrap;margin-bottom:32px;background:var(--surface);padding:12px 20px;border-radius:20px;border:1px solid var(--border);width:fit-content}
.card-info strong{color:var(--text);font-weight:700}

/* ── Tabs ── */
.tabs{margin-bottom:0}
.tab-ctrls{display:flex;border-bottom:1px solid var(--border);margin-bottom:20px;gap:8px}
.tab-r{display:none}
.tab-l{
  padding:10px 20px;font-size:13px;color:var(--muted);cursor:pointer;
  border-bottom:2px solid transparent;margin-bottom:-1px;transition:all var(--transition);
  font-weight:600;
}
.tab-l:hover{color:var(--text);background:var(--surface2);border-radius:var(--radius-sm) var(--radius-sm) 0 0}
#t-md:checked~.tab-ctrls .tl-md,
#t-html:checked~.tab-ctrls .tl-html,
#t-url:checked~.tab-ctrls .tl-url{color:var(--accent);border-bottom-color:var(--accent);background:var(--accent-dim);border-radius:var(--radius-sm) var(--radius-sm) 0 0}
.tab-p{display:none;animation:fadeIn 0.3s ease-out}
#t-md:checked~.tab-panels .tp-md,
#t-html:checked~.tab-panels .tp-html,
#t-url:checked~.tab-panels .tp-url{display:block}

.code-blk{
  background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);
  padding:14px;font-family:var(--mono);font-size:12px;line-height:1.6;
  overflow-x:auto;color:var(--text);word-break:break-all;white-space:pre-wrap;margin-bottom:12px;
  max-height:150px;overflow-y:auto;
  box-shadow:inset 0 2px 8px rgba(0,0,0,0.2);
}

/* ── Buttons ── */
.btn{
  display:inline-flex;align-items:center;gap:8px;padding:8px 16px;
  border-radius:var(--radius-sm);font-size:13px;font-family:var(--sans);
  cursor:pointer;transition:all var(--transition);border:1px solid var(--border);
  background:var(--surface2);color:var(--text);text-decoration:none;white-space:nowrap;
  font-weight:600;
}
.btn:hover{background:var(--surface3);border-color:var(--muted2);transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.2)}
.btn:active{transform:translateY(0)}
.btn-p{background:var(--accent);border-color:var(--accent);color:#fff}
.btn-p:hover{background:#79c0ff;border-color:#79c0ff;color:#0d1117}
.btn-row{display:flex;gap:10px;flex-wrap:wrap}

/* ── Token modal ── */
.modal-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,0.8);
  backdrop-filter:blur(8px);
  display:flex;align-items:center;justify-content:center;
  z-index:999;opacity:0;pointer-events:none;transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-overlay.open{opacity:1;pointer-events:auto}
.modal{
  background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius-lg);
  padding:32px;width:520px;max-width:calc(100vw - 32px);box-shadow:var(--shadow-lg);
  transform:scale(0.9);transition:transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-overlay.open .modal{transform:scale(1)}
.modal-title{font-size:18px;font-weight:800;color:var(--text);margin-bottom:12px;display:flex;align-items:center;gap:10px}
.modal-desc{font-size:13px;color:var(--muted);margin-bottom:24px;line-height:1.7}
.modal-footer{display:flex;justify-content:flex-end;gap:12px;margin-top:24px}

/* ── Repo selector ── */
.repo-sel-wrap{position:relative}
.repo-dropdown{
  position:absolute;top:100%;left:0;right:0;z-index:50;
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);
  max-height:200px;overflow-y:auto;display:none;margin-top:6px;
  box-shadow:var(--shadow-lg);animation:slideDown 0.2s ease-out;
}
.repo-dropdown.open{display:block}
.repo-item{
  padding:10px 14px;font-size:13px;color:var(--text);cursor:pointer;
  transition:background var(--transition);
}
.repo-item:hover{background:var(--surface2);color:var(--accent)}

/* ── UTC slider ── */
.utc-wrap{display:flex;gap:12px;align-items:center}
input[type=range]{
  flex:1;accent-color:var(--accent);height:6px;cursor:pointer;background:var(--surface2);border-radius:3px;appearance:none;
}
input[type=range]::-webkit-slider-thumb{appearance:none;width:16px;height:16px;background:var(--accent);border-radius:50%;border:3px solid var(--bg);box-shadow:0 0 8px var(--accent-dim)}
.utc-val{
  font-size:13px;font-weight:700;color:var(--accent);
  min-width:64px;text-align:center;
  background:var(--accent-dim);border-radius:var(--radius-sm);padding:6px 8px;
  box-shadow:0 0 0 1px var(--accent-dim);
}

/* ── Copy success animation ── */
@keyframes copySuccess {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
.copy-success { animation: copySuccess 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

/* ── Responsive ── */
@media(max-width:1024px){
  .section-inner{padding:32px}
}
@media(max-width:768px){
  main{flex-direction:column;height:auto;overflow:visible}
  aside{
    width:100%;max-width:100%;border-right:none;border-bottom:1px solid var(--border);
    height:auto;max-height:60vh;
  }
  section{height:auto;overflow:visible}
  .section-inner{padding:24px 20px}
  .hero h1{font-size:24px}
  .preview-box{padding:24px;min-height:240px}
}

/* ── Focus ── */
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
</style>
</head>
<body>

<!-- ══ TOKEN MODAL ══ -->
<div class="modal-overlay" id="token-modal">
  <div class="modal">
    <div class="modal-title">🔑 GitHub Personal Access Token</div>
    <div class="modal-desc">
      A token increases your API rate limit from <strong>60 → 5,000 req/hr</strong> and enables the
      <strong>Streak Stats</strong> card (requires GraphQL).<br/><br/>
      Your token is stored <strong>only in this browser tab's memory</strong> — it is never sent anywhere except directly to GitHub's API via this server.
      <br/><br/>
      Create a token at <a href="https://github.com/settings/tokens" target="_blank" style="color:var(--accent)">github.com/settings/tokens</a> with scopes: <code>read:user</code>, <code>repo</code>.
    </div>
    <div class="fg">
      <label class="fl">Personal Access Token</label>
      <div class="iw">
        <svg class="ii" width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M10.5 0a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM6.5 11.5a5.47 5.47 0 003.5 1.27v1.5l-2.5 2.23V14H5.75a.75.75 0 01-.75-.75v-1.25a.75.75 0 01.75-.75H6.5v-1.5l-.75-.75H4.5V7.5l2-2zM5 5.5a.5.5 0 110-1 .5.5 0 010 1z"/></svg>
        <input type="text" id="token-input" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" autocomplete="off" spellcheck="false"/>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn" id="token-cancel-btn">Cancel</button>
      <button class="btn btn-p" id="token-save-btn">💾 Save Token</button>
    </div>
  </div>
</div>

<!-- ══ HEADER ══ -->
<header>
  <a class="hd-logo" href="#">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
    </svg>
    GitHub Stats Card Builder
    <span class="hd-badge">v2.0</span>
  </a>
  <div class="hd-links">
    <a class="hd-link" href="https://github.com/ajit421/github_status" target="_blank" rel="noopener">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
      Source
    </a>
    <a class="hd-link" href="https://github.com/ajit421/github_status#readme" target="_blank" rel="noopener">📖 Docs</a>
    <button class="hd-token-btn" id="open-token-btn">🔑 Add Token</button>
  </div>
</header>

<!-- ══ MAIN ══ -->
<main>

<!-- ══ LEFT SIDEBAR ══ -->
<aside>
<div class="aside-inner">

  <!-- USERNAME -->
  <div class="pt">GitHub Username</div>
  <div class="fg">
    <div class="iw">
      <svg class="ii" width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M10.561 8.073a6.005 6.005 0 013.432 5.142.75.75 0 11-1.498.07 4.5 4.5 0 00-8.99 0 .75.75 0 01-1.498-.07 6.004 6.004 0 013.431-5.142 3.999 3.999 0 115.123 0zM10.5 5a2.5 2.5 0 10-5 0 2.5 2.5 0 005 0z"/></svg>
      <input type="text" id="u-inp" value="ajit421" placeholder="GitHub username…" autocomplete="off" spellcheck="false"/>
      <span class="istat" id="u-stat"></span>
    </div>
    <div class="errmsg" id="u-err">⚠ Invalid username format</div>
  </div>

  <!-- CARD TYPE -->
  <div class="pt">Card Type</div>
  <div class="ct-grid" id="ct-grid">
    <button class="ct-btn active" data-card="stats"><span class="ct-icon">📊</span>GitHub Stats</button>
    <button class="ct-btn" data-card="top-langs"><span class="ct-icon">🌐</span>Top Languages</button>
    <button class="ct-btn" data-card="streak"><span class="ct-icon">🔥</span>Streak Stats</button>
    <button class="ct-btn" data-card="commit-activity"><span class="ct-icon">📈</span>Commit Activity</button>
    <button class="ct-btn" data-card="profile"><span class="ct-icon">👤</span>Profile Card</button>
    <button class="ct-btn" data-card="repo"><span class="ct-icon">📦</span>Repository Card</button>
    <button class="ct-btn" data-card="productive-time"><span class="ct-icon">⏰</span>Productive Time</button>
    <button class="ct-btn" data-card="activity-graph"><span class="ct-icon">📈</span>Contribution Graph</button>
  </div>

  <!-- THEME -->
  <div class="pt">Theme</div>
  <div class="th-row" id="th-row">
    <div class="th-sw active" data-theme="tokyonight"><div class="sw-c" style="background:#1a1b26"></div><span class="sw-n">tokyo<br>night</span></div>
    <div class="th-sw" data-theme="default"><div class="sw-c" style="background:#fff;border:1px solid #ccc"></div><span class="sw-n">default</span></div>
    <div class="th-sw" data-theme="dark"><div class="sw-c" style="background:#0d1117"></div><span class="sw-n">dark</span></div>
    <div class="th-sw" data-theme="radical"><div class="sw-c" style="background:#141321"></div><span class="sw-n">radical</span></div>
  </div>

  <!-- DYNAMIC OPTIONS -->
  <div class="pt" id="opts-title">Card Options</div>
  <div id="dyn-opts"></div>

  <!-- SIZE CUSTOMIZATION -->
  <div class="pt">Card Size</div>
  <div class="size-row">
    <div class="fg">
      <label class="fl">Width (px)</label>
      <div class="iw"><input type="number" id="sz-w" class="no-icon" value="495" min="300" max="900"/></div>
    </div>
    <div class="fg">
      <label class="fl">Height (px)</label>
      <div class="iw"><input type="number" id="sz-h" class="no-icon" value="195" min="140" max="600"/></div>
    </div>
  </div>

  <!-- COLORS accordion -->
  <div class="acc">
    <div class="acc-h" id="col-acc-h">
      <span class="acc-ht">🎨 Custom Colors <small style="font-size:10px;color:var(--muted);margin-left:4px">(optional)</small></span>
      <span class="acc-arr" id="col-acc-arr">▼</span>
    </div>
    <div class="acc-b" id="col-acc-b">
      <div id="col-pickers"></div>
      <button class="reset-btn" id="reset-col">↺ Reset Colors</button>
    </div>
  </div>

  <!-- CARD INFO -->
  <div class="pt">Card Info</div>
  <div class="badges">
    <span class="badge">📐 <strong id="inf-dim">495 × 195 px</strong></span>
    <span class="badge">⏱ Cache: <strong id="inf-ttl">4h</strong></span>
    <span class="badge">🎨 <strong id="inf-theme">tokyonight</strong></span>
  </div>

</div><!-- /aside-inner -->
</aside>

<!-- ══ RIGHT PANEL ══ -->
<section>
<div class="section-inner">

  <!-- Hero -->
  <div class="hero">
    <h1>Build your GitHub profile's aesthetic</h1>
    <p>Create beautiful, dynamic cards to showcase your GitHub stats, languages, streaks, and more. Optimized for your README, website, or portfolio.</p>
  </div>

  <div class="rtitle">
    Live Preview
    <span class="rtitle-badge" id="preview-badge">GitHub Stats</span>
  </div>

  <!-- Preview box -->
  <div class="preview-box checkered" id="prev-box">
    <div class="lov active" id="lov"><div class="spin"></div></div>
    <div class="eov" id="eov">
      <span class="ei">⚠️</span>
      <span class="et">Preview Error</span>
      <span class="em" id="eov-msg">Failed to load card.</span>
    </div>
    <img id="prev-img" alt="Card Preview" crossorigin="anonymous"/>
  </div>

  <!-- Card info bar -->
  <div class="card-info">
    <span>📐 <strong id="bar-dim">495 × 195 px</strong></span>
    <span>⏱ Cache: <strong id="bar-ttl">4h</strong></span>
    <span>🎨 <strong id="bar-theme">tokyonight</strong></span>
    <span id="bar-extra"></span>
  </div>

  <!-- Embed Code Tabs -->
  <div class="rtitle" style="margin-top:4px">Embed Code</div>
  <div class="tabs">
    <input type="radio" name="tab" id="t-md" class="tab-r" checked/>
    <input type="radio" name="tab" id="t-html" class="tab-r"/>
    <input type="radio" name="tab" id="t-url" class="tab-r"/>
    <div class="tab-ctrls">
      <label class="tab-l tl-md" for="t-md">Markdown</label>
      <label class="tab-l tl-html" for="t-html">HTML</label>
      <label class="tab-l tl-url" for="t-url">Direct URL</label>
    </div>
    <div class="tab-panels">
      <div class="tab-p tp-md">
        <div class="code-blk" id="code-md"></div>
        <div class="btn-row"><button class="btn btn-p" id="cp-md">📋 Copy Markdown</button></div>
      </div>
      <div class="tab-p tp-html">
        <div class="code-blk" id="code-html"></div>
        <div class="btn-row"><button class="btn btn-p" id="cp-html">📋 Copy HTML</button></div>
      </div>
      <div class="tab-p tp-url">
        <div class="code-blk" id="code-url"></div>
        <div class="btn-row">
          <button class="btn btn-p" id="cp-url">📋 Copy URL</button>
          <button class="btn" id="open-url">↗ Open in Tab</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Share -->
  <div style="margin-top:18px;padding:14px 16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius)">
    <div style="font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">🔗 Share Config</div>
    <div style="font-size:11px;color:var(--muted);margin-bottom:8px">Copy a link with all your settings — anyone can open it and see the same config.</div>
    <div class="btn-row">
      <button class="btn" id="share-btn">🔗 Copy Share Link</button>
    </div>
  </div>

</div><!-- /section-inner -->
</section>
</main>

<script>
// ═══════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════
const S = {
  username:'ajit421', cardType:'stats', theme:'tokyonight',
  hideBorder:false, cardWidth:495, cardHeight:195,
  // stats
  customTitle:'', hideRank:false, showIcons:true,
  // langs
  layout:'normal',
  // profile
  showAvatar:true, showBio:true, showLanguages:true, showStats:true,
  // repo
  repoName:'', showDesc:true, showLang:true, showStars:true,
  showForks:true, showIssues:true, showTopics:true, showLicense:true,
  // productive-time
  utcOffset:5.5,
  // streak
  borderRadius:'4.5', streakMode:'daily',
  // activity-graph
  lineColor:'', pointColor:'', areaColor:'', hideTitle:false,
  // colors
  bgColor:'', textColor:'', titleColor:'', iconColor:'', borderColor:'',
};

// In-memory token (never persisted)
let GH_TOKEN = '';

const API = window.location.origin;

const ENDPOINTS = {
  'stats':'/api/stats','top-langs':'/api/top-langs',
  'streak':'/api/streak','commit-activity':'/api/commit-activity',
  'profile':'/api/profile','repo':'/api/repo',
  'productive-time':'/api/productive-time',
  'activity-graph':'/api/activity-graph',
};

const DIMS = {
  'stats':{w:495,h:195},'top-langs':{w:495,h:195},
  'streak':{w:495,h:195},'commit-activity':{w:495,h:260},
  'profile':{w:495,h:220},'repo':{w:495,h:195},
  'productive-time':{w:495,h:195},'activity-graph':{w:495,h:195},
};

const TTLS = {
  'stats':'4h','top-langs':'2h','streak':'2h',
  'commit-activity':'2h','profile':'4h','repo':'2h','productive-time':'2h','activity-graph':'2h',
};

const LABELS = {
  'stats':'GitHub Stats','top-langs':'Top Languages',
  'streak':'Streak Stats','commit-activity':'Commit Activity',
  'profile':'Profile Card','repo':'Repository Card',
  'productive-time':'Productive Time',
  'activity-graph':'Contribution Graph',
};

const COL_FIELDS = [
  {key:'bgColor',param:'bg_color',label:'Background'},
  {key:'textColor',param:'text_color',label:'Text Color'},
  {key:'titleColor',param:'title_color',label:'Title Color'},
  {key:'iconColor',param:'icon_color',label:'Icon Color'},
  {key:'borderColor',param:'border_color',label:'Border Color'},
  {key:'lineColor',param:'line_color',label:'Line Color'},
  {key:'pointColor',param:'point_color',label:'Point Color'},
  {key:'areaColor',param:'area_color',label:'Area Fill'},
];

const UN_RE = /^[a-zA-Z0-9][a-zA-Z0-9\-]{0,38}$/;
const HEX_RE = /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/;

// ═══════════════════════════════════════════════════════════
// URL BUILDER
// ═══════════════════════════════════════════════════════════
function buildUrl(){
  if(!UN_RE.test(S.username)) return null;
  const ep = ENDPOINTS[S.cardType];
  if(!ep) return null;
  const url = new URL(API + ep);
  url.searchParams.set('username', S.username);
  if(S.theme && S.theme!=='default') url.searchParams.set('theme', S.theme);
  if(S.hideBorder) url.searchParams.set('hide_border','true');
  if(S.cardWidth !== DIMS[S.cardType]?.w) url.searchParams.set('card_width', String(S.cardWidth));
  if(S.cardHeight !== DIMS[S.cardType]?.h) url.searchParams.set('card_height', String(S.cardHeight));
  if(GH_TOKEN) url.searchParams.set('token', GH_TOKEN);

  if(S.cardType==='stats'){
    if(S.customTitle) url.searchParams.set('custom_title', S.customTitle);
    if(S.hideRank) url.searchParams.set('hide_rank','true');
    if(!S.showIcons) url.searchParams.set('show_icons','false');
  }
  if(S.cardType==='top-langs' && S.layout!=='normal') url.searchParams.set('layout',S.layout);
  if(S.cardType==='profile'){
    if(!S.showAvatar) url.searchParams.set('show_avatar','false');
    if(!S.showBio) url.searchParams.set('show_bio','false');
    if(!S.showLanguages) url.searchParams.set('show_languages','false');
    if(!S.showStats) url.searchParams.set('show_stats','false');
  }
  if(S.cardType==='repo'){
    if(S.repoName) url.searchParams.set('repo', S.repoName);
    if(!S.showDesc) url.searchParams.set('show_description','false');
    if(!S.showLang) url.searchParams.set('show_language','false');
    if(!S.showStars) url.searchParams.set('show_stars','false');
    if(!S.showForks) url.searchParams.set('show_forks','false');
    if(!S.showIssues) url.searchParams.set('show_issues','false');
    if(!S.showTopics) url.searchParams.set('show_topics','false');
    if(!S.showLicense) url.searchParams.set('show_license','false');
  }
  if(S.cardType==='productive-time'){
    url.searchParams.set('utc_offset', String(S.utcOffset));
  }
  if(S.cardType==='activity-graph'){
    if(S.customTitle) url.searchParams.set('custom_title', S.customTitle);
    if(S.hideTitle) url.searchParams.set('hide_title','true');
  }
  if(S.cardType==='streak'){
    if(S.borderRadius!=='4.5') url.searchParams.set('border_radius',S.borderRadius);
  }
  for(const {key,param} of COL_FIELDS){
    const v = S[key];
    if(v && HEX_RE.test(v.replace('#',''))){
      url.searchParams.set(param, v.replace('#',''));
    }
  }
  // Remove token from embed URLs for security
  const embedUrl = new URL(url.toString());
  embedUrl.searchParams.delete('token');
  return { fullUrl: url.toString(), embedUrl: embedUrl.toString() };
}

// ═══════════════════════════════════════════════════════════
// PREVIEW ENGINE
// ═══════════════════════════════════════════════════════════
let debTimer = null;
const prevImg = document.getElementById('prev-img');
const lov = document.getElementById('lov');
const eov = document.getElementById('eov');
const eovMsg = document.getElementById('eov-msg');

function trigger(delay=400){
  clearTimeout(debTimer);
  debTimer = setTimeout(updateAll, delay);
}

function updateAll(){
  updateBars();
  updateCodes();
  updatePreview();
}

function updateBars(){
  const dim = DIMS[S.cardType]||{w:S.cardWidth,h:S.cardHeight};
  const dStr = S.cardWidth+'×'+S.cardHeight+' px';
  const ttl = TTLS[S.cardType]||'—';
  document.getElementById('inf-dim').textContent = dStr;
  document.getElementById('inf-ttl').textContent = ttl;
  document.getElementById('inf-theme').textContent = S.theme;
  document.getElementById('bar-dim').textContent = dStr;
  document.getElementById('bar-ttl').textContent = ttl;
  document.getElementById('bar-theme').textContent = S.theme;
  document.getElementById('preview-badge').textContent = LABELS[S.cardType]||S.cardType;

  // Extra info
  let extra = '';
  if(S.cardType==='productive-time') extra = 'UTC '+(S.utcOffset>=0?'+':'')+S.utcOffset;
  if(S.cardType==='repo' && S.repoName) extra = '📦 '+S.repoName;
  document.getElementById('bar-extra').textContent = extra;
}

function updateCodes(){
  const res = buildUrl();
  if(!res) return;
  const {embedUrl} = res;
  const lbl = LABELS[S.cardType]||S.cardType;
  document.getElementById('code-md').textContent = '!['+lbl+']('+embedUrl+')';
  document.getElementById('code-html').textContent = '<img src="'+embedUrl+'" alt="'+lbl+'" width="'+S.cardWidth+'" />';
  document.getElementById('code-url').textContent = embedUrl;
}

function updatePreview(){
  const res = buildUrl();
  if(!res){ showError('Invalid username or missing repo name'); return; }
  const {fullUrl} = res;

  lov.classList.add('active');
  eov.classList.remove('active');

  const ni = new Image();
  ni.crossOrigin='anonymous';
  ni.onload=()=>{ prevImg.src=ni.src; lov.classList.remove('active'); };
  ni.onerror=()=>{
    lov.classList.remove('active');
    showError('Failed to load card. Check username/repo or try again.');
  };
  ni.src = fullUrl+'&_t='+Date.now();
}

function showError(msg){
  eovMsg.textContent = msg;
  eov.classList.add('active');
}

// ═══════════════════════════════════════════════════════════
// DYNAMIC OPTIONS RENDERER
// ═══════════════════════════════════════════════════════════
function renderOpts(){
  const c = document.getElementById('dyn-opts');
  c.innerHTML = '';

  const tog = (id, stateKey, label, sub='')=>\`
    <div class="tog-row">
      <div><span class="tog-lbl">\${label}</span>\${sub?'<span class="tog-sub">'+sub+'</span>':''}</div>
      <label><input type="checkbox" id="\${id}" class="tog" \${S[stateKey]?'checked':''}><span class="tog-sw"></span></label>
    </div>\`;

  const hbToggle = tog('opt-hb','hideBorder','Hide Border');

  if(S.cardType==='stats'){
    c.innerHTML = \`
      <div class="fg"><label class="fl">Custom Title</label>
        <div class="iw"><svg class="ii" width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 2h13a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-13a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5z"/></svg>
        <input type="text" id="opt-ct" placeholder="e.g. My Stats" value="\${escA(S.customTitle)}"/></div></div>
      \${tog('opt-hr','hideRank','Hide Rank')}
      \${tog('opt-si','showIcons','Show Icons')}
      \${hbToggle}\`;
  } else if(S.cardType==='top-langs'){
    c.innerHTML = \`
      <label class="fl">Layout</label>
      <div class="seg">
        <input type="radio" name="opt-layout" id="lo-n" class="seg-i" value="normal" \${S.layout==='normal'?'checked':''}>
        <label class="seg-l" for="lo-n">Normal</label>
        <input type="radio" name="opt-layout" id="lo-c" class="seg-i" value="compact" \${S.layout==='compact'?'checked':''}>
        <label class="seg-l" for="lo-c">Compact</label>
        <input type="radio" name="opt-layout" id="lo-p" class="seg-i" value="pie" \${S.layout==='pie'?'checked':''}>
        <label class="seg-l" for="lo-p">Pie</label>
      </div>
      \${hbToggle}\`;
  } else if(S.cardType==='streak'){
    c.innerHTML = \`
      <div class="note">🔑 Streak requires <strong>GitHub Token</strong>. <a href="#" id="streak-token-link">Add token →</a></div>
      <div class="fg"><label class="fl">Border Radius</label>
        <div class="iw"><input type="number" id="opt-br" class="no-icon" value="\${S.borderRadius}" min="0" max="20" step="0.5"/></div></div>
      \${hbToggle}\`;
  } else if(S.cardType==='commit-activity'){
    c.innerHTML = hbToggle;
  } else if(S.cardType==='profile'){
    c.innerHTML = \`
      \${tog('opt-av','showAvatar','Show Avatar')}
      \${tog('opt-bio','showBio','Show Bio')}
      \${tog('opt-lang','showLanguages','Show Languages')}
      \${tog('opt-stats','showStats','Show Stats')}
      \${hbToggle}\`;
  } else if(S.cardType==='repo'){
    c.innerHTML = \`
      <div class="fg">
        <label class="fl">Repository Name</label>
        <div class="repo-sel-wrap">
          <div class="iw">
            <svg class="ii" width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z"/></svg>
            <input type="text" id="opt-repo" placeholder="repo-name" value="\${escA(S.repoName)}"/>
          </div>
          <div class="repo-dropdown" id="repo-dd"></div>
        </div>
        <div style="margin-top:4px"><button class="btn" id="load-repos-btn" style="font-size:11px;padding:4px 8px">📋 Load my repos</button></div>
      </div>
      \${tog('opt-sdesc','showDesc','Show Description')}
      \${tog('opt-slang','showLang','Show Language')}
      \${tog('opt-sstars','showStars','Show Stars')}
      \${tog('opt-sforks','showForks','Show Forks')}
      \${tog('opt-sissues','showIssues','Show Issues')}
      \${tog('opt-stopics','showTopics','Show Topics')}
      \${tog('opt-slicense','showLicense','Show License')}
      \${hbToggle}\`;
  } else if(S.cardType==='productive-time'){
    const sign = S.utcOffset>=0?'+':'';
    c.innerHTML = \`
      <div class="fg">
        <label class="fl">UTC Offset (your timezone)</label>
        <div class="utc-wrap">
          <input type="range" id="opt-utc" min="-12" max="14" step="0.5" value="\${S.utcOffset}"/>
          <span class="utc-val" id="utc-val">UTC \${sign}\${S.utcOffset}</span>
        </div>
      </div>
      \${hbToggle}\`;
  } else if(S.cardType==='activity-graph'){
      c.innerHTML = \`
      <div class="fg"><label class="fl">Custom Title</label>
        <div class="iw"><input type="text" id="opt-ct" placeholder="e.g. Activity Graph" value="\${escA(S.customTitle)}"/></div></div>
      \${tog('opt-ht','hideTitle','Hide Title')}
      \${hbToggle}\`;
  }

      bindOpts();
}

function bindOpts(){
  const on = (id, fn)=>{ const el=document.getElementById(id); if(el) el.addEventListener('input',fn); };
  const onChk = (id, fn)=>{ const el=document.getElementById(id); if(el) el.addEventListener('change',fn); };
  const onClk = (id, fn)=>{ const el=document.getElementById(id); if(el) el.addEventListener('click',fn); };

  on('opt-ct', e=>{ S.customTitle=e.target.value; trigger(); });
  onChk('opt-ht', e=>{ S.hideTitle=e.target.checked; trigger(); });
  onChk('opt-hr', e=>{ S.hideRank=e.target.checked; trigger(); });
  onChk('opt-si', e=>{ S.showIcons=e.target.checked; trigger(); });
  onChk('opt-hb', e=>{ S.hideBorder=e.target.checked; trigger(); });
  onChk('opt-av', e=>{ S.showAvatar=e.target.checked; trigger(); });
  onChk('opt-bio', e=>{ S.showBio=e.target.checked; trigger(); });
  onChk('opt-lang', e=>{ S.showLanguages=e.target.checked; trigger(); });
  onChk('opt-stats', e=>{ S.showStats=e.target.checked; trigger(); });
  onChk('opt-sdesc', e=>{ S.showDesc=e.target.checked; trigger(); });
  onChk('opt-slang', e=>{ S.showLang=e.target.checked; trigger(); });
  onChk('opt-sstars', e=>{ S.showStars=e.target.checked; trigger(); });
  onChk('opt-sforks', e=>{ S.showForks=e.target.checked; trigger(); });
  onChk('opt-sissues', e=>{ S.showIssues=e.target.checked; trigger(); });
  onChk('opt-stopics', e=>{ S.showTopics=e.target.checked; trigger(); });
  onChk('opt-slicense', e=>{ S.showLicense=e.target.checked; trigger(); });
  on('opt-br', e=>{ S.borderRadius=e.target.value; trigger(); });
  on('opt-repo', e=>{ S.repoName=e.target.value; trigger(); });

  // UTC slider
  on('opt-utc', e=>{
    S.utcOffset=parseFloat(e.target.value);
    const sign=S.utcOffset>=0?'+':'';
    const el=document.getElementById('utc-val');
    if(el) el.textContent='UTC '+sign+S.utcOffset;
    trigger();
  });

  // Layout radio
  document.querySelectorAll('input[name="opt-layout"]').forEach(r=>{
    r.addEventListener('change', e=>{ if(e.target.checked){ S.layout=e.target.value; trigger(); }});
  });

  // Repo dropdown
  const repoInput = document.getElementById('opt-repo');
  const repoDd = document.getElementById('repo-dd');
  if(repoInput && repoDd){
    repoInput.addEventListener('focus', ()=>{ if(repoDd.children.length>0) repoDd.classList.add('open'); });
    repoInput.addEventListener('blur', ()=>setTimeout(()=>repoDd.classList.remove('open'),150));
    repoInput.addEventListener('input', e=>{
      S.repoName=e.target.value;
      filterRepoDD(e.target.value);
      trigger();
    });
  }

  onClk('load-repos-btn', async()=>{
    const btn=document.getElementById('load-repos-btn');
    if(btn){ btn.textContent='⏳ Loading…'; btn.disabled=true; }
    try{
      const res = await fetch(API+'/api/repo/list?username='+encodeURIComponent(S.username));
      const json = await res.json();
      window._repos = json.repos||[];
      populateRepoDD(window._repos);
      if(repoDd) repoDd.classList.add('open');
    }catch(e){ console.error(e); }
    if(btn){ btn.textContent='📋 Load my repos'; btn.disabled=false; }
  });

  // Streak token link
  onClk('streak-token-link', e=>{ e.preventDefault(); openTokenModal(); });
}

let _allRepos = [];
function populateRepoDD(repos){
  _allRepos = repos;
  filterRepoDD('');
}
function filterRepoDD(q){
  const dd = document.getElementById('repo-dd');
  if(!dd) return;
  const filtered = q ? _allRepos.filter(r=>r.toLowerCase().includes(q.toLowerCase())) : _allRepos;
  dd.innerHTML = filtered.slice(0,20).map(r=>'<div class="repo-item">'+escH(r)+'</div>').join('');
  dd.querySelectorAll('.repo-item').forEach(item=>{
    item.addEventListener('mousedown', e=>{
      e.preventDefault();
      const name = item.textContent;
      S.repoName = name;
      const inp = document.getElementById('opt-repo');
      if(inp) inp.value = name;
      dd.classList.remove('open');
      trigger(0);
    });
  });
  dd.classList.toggle('open', filtered.length>0);
}

// ═══════════════════════════════════════════════════════════
// COLOR PICKERS
// ═══════════════════════════════════════════════════════════
function renderColors(){
  const c = document.getElementById('col-pickers');
  const showIcon = ['stats','streak','profile','repo'].includes(S.cardType);
  const fields = COL_FIELDS.filter(f=>showIcon||f.key!=='iconColor');

  c.innerHTML = fields.map(({key,label})=>{
    const hex = S[key]?S[key].replace('#',''):'';
    const col = hex.length===6?'#'+hex:'#000000';
    return \`<div class="cr-row">
      <span class="cr-lbl">\${label}</span>
      <input type="color" data-key="\${key}" data-kind="picker" value="\${col}"/>
      <input type="text" class="hex-in no-icon" data-key="\${key}" data-kind="hex" placeholder="hex" value="\${hex}" maxlength="6"/>
    </div>\`;
  }).join('');

  c.querySelectorAll('input[data-key]').forEach(el=>{
    el.addEventListener('input', e=>{
      const k=e.target.dataset.key, kind=e.target.dataset.kind;
      if(kind==='picker'){
        const hex=e.target.value.slice(1); S[k]=hex;
        const hx=c.querySelector(\`input[data-key="\${k}"][data-kind="hex"]\`);
        if(hx) hx.value=hex;
      } else {
        const hex=e.target.value.replace(/[^a-fA-F0-9]/g,''); S[k]=hex;
        if(hex.length===6){ const pk=c.querySelector(\`input[data-key="\${k}"][data-kind="picker"]\`); if(pk) pk.value='#'+hex; }
      }
      trigger();
    });
  });
}

// ═══════════════════════════════════════════════════════════
// CLIPBOARD + SHARE
// ═══════════════════════════════════════════════════════════
async function copy(text, btn, orig){
  try{
    if(navigator.clipboard?.writeText){ await navigator.clipboard.writeText(text); }
    else{
      const ta=document.createElement('textarea');
      ta.value=text;ta.style.cssText='position:fixed;top:-9999px';
      document.body.appendChild(ta);ta.select();
      document.execCommand('copy');document.body.removeChild(ta);
    }
    btn.textContent='✓ Copied!';
    btn.classList.add('copy-success');
    setTimeout(()=>{ btn.textContent=orig; btn.classList.remove('copy-success'); },2000);
  }catch(e){ console.error(e); }
}

function encState(){
  const p=new URLSearchParams();
  p.set('u',S.username);p.set('card',S.cardType);p.set('theme',S.theme);
  if(S.hideBorder) p.set('hb','1');
  if(S.hideRank) p.set('hr','1');
  if(!S.showIcons) p.set('si','0');
  if(S.customTitle) p.set('ct',S.customTitle);
  if(S.layout!=='normal') p.set('layout',S.layout);
  if(S.repoName) p.set('repo',S.repoName);
  if(S.utcOffset!==0) p.set('utc',String(S.utcOffset));
  if(S.cardWidth!==495) p.set('w',String(S.cardWidth));
  if(S.cardHeight!==195) p.set('h',String(S.cardHeight));
  for(const {key,param} of COL_FIELDS){ if(S[key]) p.set(param,S[key].replace('#','')); }
  return window.location.href.split('?')[0]+'?'+p.toString();
}

function decState(search){
  const p=new URLSearchParams(search);
  if(p.has('u')) S.username=p.get('u');
  if(p.has('card')) S.cardType=p.get('card');
  if(p.has('theme')) S.theme=p.get('theme');
  S.hideBorder=p.get('hb')==='1';
  S.hideRank=p.get('hr')==='1';
  S.showIcons=p.get('si')!=='0';
  if(p.has('ct')) S.customTitle=p.get('ct');
  if(p.has('layout')) S.layout=p.get('layout');
  if(p.has('repo')) S.repoName=p.get('repo');
  if(p.has('utc')) S.utcOffset=parseFloat(p.get('utc'));
  if(p.has('w')) S.cardWidth=parseInt(p.get('w'));
  if(p.has('h')) S.cardHeight=parseInt(p.get('h'));
  for(const {key,param} of COL_FIELDS){ if(p.has(param)) S[key]=p.get(param); }
}

// ═══════════════════════════════════════════════════════════
// TOKEN MODAL
// ═══════════════════════════════════════════════════════════
function openTokenModal(){
  document.getElementById('token-input').value=GH_TOKEN;
  document.getElementById('token-modal').classList.add('open');
}
function closeTokenModal(){ document.getElementById('token-modal').classList.remove('open'); }

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
function escA(s){ return (s||'').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function escH(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded',()=>{

  // Decode URL params
  if(window.location.search) decState(window.location.search);

  // Username input
  const uInp=document.getElementById('u-inp');
  const uErr=document.getElementById('u-err');
  const uStat=document.getElementById('u-stat');
  uInp.value=S.username;

  uInp.addEventListener('input', e=>{
    const v=e.target.value.trim(); S.username=v;
    if(!v||UN_RE.test(v)){
      uInp.classList.remove('invalid'); uErr.classList.remove('show');
      uStat.textContent=v?'✓':''; uInp.classList.toggle('valid',!!v);
    } else {
      uInp.classList.add('invalid'); uInp.classList.remove('valid');
      uErr.classList.add('show'); uStat.textContent='';
    }
    trigger();
  });

  // Card type buttons
  document.getElementById('ct-grid').addEventListener('click', e=>{
    const btn=e.target.closest('.ct-btn'); if(!btn) return;
    document.querySelectorAll('.ct-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    S.cardType=btn.dataset.card;
    S.hideBorder=false;
    // Set default size for this card type
    const dim=DIMS[S.cardType];
    if(dim){ S.cardWidth=dim.w; S.cardHeight=dim.h; }
    document.getElementById('sz-w').value=S.cardWidth;
    document.getElementById('sz-h').value=S.cardHeight;
    renderOpts(); renderColors(); trigger(0);
  });

  // Theme swatches
  document.getElementById('th-row').addEventListener('click', e=>{
    const sw=e.target.closest('.th-sw'); if(!sw) return;
    document.querySelectorAll('.th-sw').forEach(s=>s.classList.remove('active'));
    sw.classList.add('active'); S.theme=sw.dataset.theme; trigger();
  });

  // Size inputs
  document.getElementById('sz-w').addEventListener('input', e=>{ S.cardWidth=parseInt(e.target.value)||495; trigger(); });
  document.getElementById('sz-h').addEventListener('input', e=>{ S.cardHeight=parseInt(e.target.value)||195; trigger(); });

  // Color accordion
  document.getElementById('col-acc-h').addEventListener('click',()=>{
    document.getElementById('col-acc-b').classList.toggle('open');
    document.getElementById('col-acc-arr').classList.toggle('open');
  });

  // Reset colors
  document.getElementById('reset-col').addEventListener('click',()=>{
    for(const {key} of COL_FIELDS) S[key]='';
    renderColors(); trigger();
  });

  // Copy buttons
  document.getElementById('cp-md').addEventListener('click',function(){ copy(document.getElementById('code-md').textContent,this,'📋 Copy Markdown'); });
  document.getElementById('cp-html').addEventListener('click',function(){ copy(document.getElementById('code-html').textContent,this,'📋 Copy HTML'); });
  document.getElementById('cp-url').addEventListener('click',function(){ copy(document.getElementById('code-url').textContent,this,'📋 Copy URL'); });
  document.getElementById('open-url').addEventListener('click',()=>{ const u=document.getElementById('code-url').textContent; if(u) window.open(u,'_blank','noopener'); });
  document.getElementById('share-btn').addEventListener('click',function(){ copy(encState(),this,'🔗 Copy Share Link'); });

  // Token modal
  document.getElementById('open-token-btn').addEventListener('click', openTokenModal);
  document.getElementById('token-cancel-btn').addEventListener('click', closeTokenModal);
  document.getElementById('token-save-btn').addEventListener('click',()=>{
    GH_TOKEN=document.getElementById('token-input').value.trim();
    const btn=document.getElementById('open-token-btn');
    if(GH_TOKEN){ btn.textContent='🔑 Token Set ✓'; btn.classList.add('has-token'); }
    else{ btn.textContent='🔑 Add Token'; btn.classList.remove('has-token'); }
    closeTokenModal(); trigger(0);
  });
  document.getElementById('token-modal').addEventListener('click', e=>{
    if(e.target===e.currentTarget) closeTokenModal();
  });

  // Sync UI from decoded state
  document.querySelectorAll('.th-sw').forEach(s=>s.classList.toggle('active',s.dataset.theme===S.theme));
  document.querySelectorAll('.ct-btn').forEach(b=>b.classList.toggle('active',b.dataset.card===S.cardType));
  document.getElementById('sz-w').value=S.cardWidth;
  document.getElementById('sz-h').value=S.cardHeight;

  // Initial render
  renderOpts(); renderColors(); updateAll();
});
</script>
</body>
</html>`;
  return c.html(html);
});

// ── API routes ─────────────────────────────────────────────────────────────────
app.route('/api/stats', statsRoute);
app.route('/api/top-langs', langsRoute);
app.route('/api/streak', streakRoute);
app.route('/api/commit-activity', activityRoute);
app.route('/api/profile', profileRoute);
app.route('/api/repo', repoRoute);
app.route('/api/productive-time', productiveTimeRoute);
app.route('/api/activity-graph', activityGraphRoute);

export default app;