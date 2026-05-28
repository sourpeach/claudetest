// Injected into LinkedIn job pages — extracts company name and renders the panel

const PANEL_ID   = 'gd-preview-panel';
let lastUrl      = location.href;
let lastCompany  = '';
let updateTimer  = null;

// ── LinkedIn DOM selectors (multiple fallbacks — LinkedIn's DOM changes often) ──
const COMPANY_SELECTORS = [
  '.job-details-jobs-unified-top-card__company-name a',
  '.job-details-jobs-unified-top-card__company-name',
  '.jobs-unified-top-card__company-name a',
  '.jobs-unified-top-card__company-name',
  '.topcard__org-name-link',
  '.job-card-container__company-name',
  'a[data-tracking-control-name="public_jobs_topcard-org-name"]',
];

function getCompanyName() {
  for (const sel of COMPANY_SELECTORS) {
    const el   = document.querySelector(sel);
    const text = el?.textContent?.trim();
    if (text && text.length > 0 && text.length < 120) return text;
  }
  return null;
}

// ── Panel ──

function getOrCreatePanel() {
  const existing = document.getElementById(PANEL_ID);
  if (existing) return existing;

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <div class="gd-inner">
      <div class="gd-header">
        <div class="gd-wordmark">
          <svg width="18" height="18" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" fill="#fff"/>
            <text x="50" y="68" text-anchor="middle" font-size="58"
                  fill="#0CAA41" font-family="Georgia,serif" font-weight="bold">g</text>
          </svg>
          <span>glassdoor</span>
        </div>
        <button class="gd-toggle" title="Collapse">−</button>
      </div>
      <div class="gd-body">
        <div class="gd-loading"><div class="gd-spinner"></div><span>Loading…</span></div>
      </div>
    </div>
  `;

  panel.querySelector('.gd-toggle').addEventListener('click', () => {
    const body      = panel.querySelector('.gd-body');
    const btn       = panel.querySelector('.gd-toggle');
    const collapsed = body.style.display === 'none';
    body.style.display = collapsed ? '' : 'none';
    btn.textContent    = collapsed ? '−' : '+';
  });

  document.body.appendChild(panel);
  return panel;
}

// ── Rendering ──

function stars(rating) {
  const r = parseFloat(rating) || 0;
  return Array.from({ length: 5 }, (_, i) => {
    const v = r - i;
    const cls = v >= 0.75 ? 'full' : v >= 0.25 ? 'half' : 'empty';
    return `<span class="gd-star ${cls}">★</span>`;
  }).join('');
}

function fmt(n) {
  const num = parseInt(n, 10);
  if (!num) return '?';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000)     return (num / 1_000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function statRow(label, pct) {
  if (pct == null) return '';
  return `
    <div class="gd-stat-row">
      <span class="gd-stat-label">${label}</span>
      <div class="gd-bar-wrap"><div class="gd-bar" style="width:${pct}%"></div></div>
      <span class="gd-stat-val">${pct}%</span>
    </div>`;
}

function renderResult(panel, company, data) {
  const body = panel.querySelector('.gd-body');

  if (data.error === 'not_found' || (!data.rating && data.error)) {
    body.innerHTML = `
      <p class="gd-company">${company}</p>
      <p class="gd-not-found">No Glassdoor listing found</p>
      <a class="gd-btn" target="_blank" rel="noopener"
         href="https://www.glassdoor.com/Search/results.htm?keyword=${encodeURIComponent(company)}">
        Search on Glassdoor →
      </a>`;
    return;
  }

  body.innerHTML = `
    <p class="gd-company">${data.name || company}</p>
    <div class="gd-rating-row">
      <span class="gd-rating-num">${parseFloat(data.rating).toFixed(1)}</span>
      <div>
        <div class="gd-stars">${stars(data.rating)}</div>
        <div class="gd-review-count">${fmt(data.reviews)} reviews</div>
      </div>
    </div>
    ${statRow('Recommend', data.recommend)}
    ${statRow('CEO approval', data.ceoApproval)}
    <a class="gd-btn" href="${data.url}" target="_blank" rel="noopener">
      View full reviews on Glassdoor →
    </a>`;
}

// ── Main loop ──

function scheduleUpdate(delay = 1500) {
  clearTimeout(updateTimer);
  updateTimer = setTimeout(tryUpdate, delay);
}

function tryUpdate() {
  if (!/linkedin\.com\/jobs/.test(location.href)) return;

  const company = getCompanyName();
  if (!company) { scheduleUpdate(1000); return; }   // DOM not ready yet
  if (company === lastCompany) return;               // same job, no-op

  lastCompany = company;
  const panel = getOrCreatePanel();
  panel.querySelector('.gd-body').innerHTML =
    `<div class="gd-loading"><div class="gd-spinner"></div><span>Looking up ${company}…</span></div>`;

  chrome.runtime.sendMessage({ type: 'FETCH_GLASSDOOR', company }, data => {
    renderResult(panel, company, data ?? { error: 'no_response' });
  });
}

// Watch LinkedIn SPA navigation (URL changes without full page reload)
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl     = location.href;
    lastCompany = '';
    scheduleUpdate(1500);
  }
}).observe(document.documentElement, { subtree: true, childList: true });

// Initial run
scheduleUpdate(2000);
