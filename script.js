const CYCLES = [6, 5, 4, 3, 2, 1];

// Rating faces (stroke uses currentColor, so CSS colors them per rating)
const FACE_ATTRS = 'xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"';
const FACES = {
  good: `<svg ${FACE_ATTRS}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>`,
  ok: `<svg ${FACE_ATTRS}><circle cx="12" cy="12" r="10"/><path d="M8 15h8M9 9h.01M15 9h.01"/></svg>`,
  low: `<svg ${FACE_ATTRS}><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2m1-7h.01M15 9h.01"/></svg>`,
};
// Recommended sleep hours per age range (NSF guidelines).
const AGE_HOURS = { child: [9, 11], teen: [8, 10], adult: [7, 9], senior: [7, 8] };

const TIPS = [
  'Keep the same sleep schedule every day — even on weekends.',
  'Avoid caffeine in the 6 hours before bedtime.',
  'Put screens away 1 hour before bed — blue light delays melatonin.',
  'A cool room (18–19 °C) helps you fall and stay asleep.',
  'Get bright daylight in the morning — it anchors your body clock.',
  'Alcohol before bed fragments sleep and cuts REM.',
  'Keep naps under 20 minutes and before mid-afternoon.',
  'If you can\'t sleep after ~20 minutes, get up and do something calm until drowsy.',
];

const KEYS = { mode: 'sleepCalc.mode', wakeTime: 'sleepCalc.wakeTime', bedTime: 'sleepCalc.bedTime', age: 'sleepCalc.age', latency: 'sleepCalc.latency', fmt: 'sleepCalc.fmt' };
const DEFAULTS = { mode: 'wake', wakeTime: '07:00', bedTime: '23:00', age: 'adult', latency: '15', fmt: '24' };

const hh = document.getElementById('hh');
const mm = document.getElementById('mm');
const ampmBtn = document.getElementById('ampm');
const lead = document.getElementById('lead');
const cards = document.getElementById('cards');
const hint = document.getElementById('hint');
const age = document.getElementById('age');
const latency = document.getElementById('latency');
const fmt = document.getElementById('fmt');
const settings = document.getElementById('settings');
const sleepNowBtn = document.getElementById('sleepNow');
const results = document.getElementById('results');
const modeButtons = [...document.querySelectorAll('.mode button')];

let mode = DEFAULTS.mode;
let timeValue = DEFAULTS.wakeTime; // canonical "HH:MM", always 24-hour
let calculated = false; // results stay hidden until first Calculate / Sleep now

function store(key, value) {
  try { localStorage.setItem(key, value); } catch { /* private mode */ }
}

function load(key, fallback) {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

function latencyMinutes() {
  const n = Number.parseInt(latency.value, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

// Reflect canonical timeValue into the hour/minute boxes (12- or 24-hour display).
function writeInputs() {
  let [h, m] = timeValue.split(':').map(Number);
  const h12 = fmt.value === '12';
  ampmBtn.classList.toggle('hidden', !h12);
  if (h12) {
    ampmBtn.textContent = h < 12 ? 'AM' : 'PM';
    h = h % 12 || 12;
  }
  hh.value = pad(h);
  mm.value = pad(m);
}

// Parse the boxes back into canonical 24-hour timeValue.
function readInputs() {
  const h12 = fmt.value === '12';
  const maxH = h12 ? 12 : 23;
  let h = Math.min(Math.max(Number.parseInt(hh.value, 10) || 0, 0), maxH);
  const m = Math.min(Math.max(Number.parseInt(mm.value, 10) || 0, 0), 59);
  if (h12) h = (h % 12) + (ampmBtn.textContent === 'PM' ? 12 : 0);
  timeValue = `${pad(h)}:${pad(m)}`;
}

function formatTime(date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: fmt.value === '12' ? 'numeric' : '2-digit',
    minute: '2-digit',
    hourCycle: fmt.value === '12' ? 'h12' : 'h23',
  }).format(date);
}

function rating(hours) {
  const [lo, hi] = AGE_HOURS[age.value] ?? AGE_HOURS.adult;
  if (hours >= lo && hours <= hi) return 'good';
  if (hours >= lo - 1.5 && hours <= hi + 1.5) return 'ok';
  if (hours === 4.5) return 'ok'; // 3 full cycles: short, but a decent cycle-aligned fallback
  return 'low';
}

function render() {
  hint.textContent = `1 cycle = 90 min · includes ${latencyMinutes()} min to fall asleep`;
  if (!calculated) return;

  const [h, m] = timeValue.split(':').map(Number);
  const base = new Date();
  base.setHours(h, m, 0, 0);
  const sign = mode === 'wake' ? -1 : 1;
  const wait = latencyMinutes();

  lead.textContent = mode === 'wake' ? 'Go to bed at one of these times' : 'Wake up at one of these times';

  cards.innerHTML = '';
  for (const [i, cycle] of CYCLES.entries()) {
    const when = new Date(base.getTime() + sign * (wait + cycle * 90) * 60000);
    const hours = cycle * 1.5;
    const card = document.createElement('article');
    const rate = rating(hours);
    card.className = `card ${rate}`;
    card.style.animationDelay = `${i * 60}ms`;
    card.innerHTML = `
      <span class="face" aria-hidden="true">${FACES[rate]}</span>
      <span class="time">${formatTime(when)}</span>
      <span class="meta">${cycle} cycle${cycle > 1 ? 's' : ''} · ${hours} h</span>`;
    cards.append(card);
  }
}

function calculate() {
  calculated = true;
  results.classList.remove('hidden');
  document.getElementById('tip').textContent = `💡 ${TIPS[Math.floor(Math.random() * TIPS.length)]}`;
  render();
  results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function setMode(next) {
  mode = next;
  document.body.dataset.mode = mode; // drives per-mode accent colors in CSS
  store(KEYS.mode, mode);
  for (const btn of modeButtons) btn.setAttribute('aria-pressed', String(btn.dataset.mode === mode));
  sleepNowBtn.classList.toggle('hidden', mode !== 'bed');
  timeValue = load(KEYS[mode + 'Time'], DEFAULTS[mode + 'Time']);
  writeInputs();
  render();
}

// "Sleep now" = go to bed at the current time.
function sleepNow() {
  setMode('bed');
  const now = new Date();
  timeValue = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  store(KEYS.bedTime, timeValue);
  writeInputs();
  calculate();
}

function onTimeEdit() {
  readInputs();
  store(KEYS[mode + 'Time'], timeValue);
  render();
}

for (const btn of modeButtons) {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
}

sleepNowBtn.addEventListener('click', sleepNow);
document.getElementById('calc').addEventListener('click', calculate);

document.getElementById('back').addEventListener('click', () => {
  calculated = false;
  results.classList.add('hidden');
});

for (const el of [hh, mm]) {
  el.addEventListener('input', () => {
    el.value = el.value.replace(/\D/g, '');
    if (el === hh && el.value.length === 2) mm.select(); // auto-advance to minutes
    onTimeEdit();
  });
  el.addEventListener('focus', () => el.select()); // type over, no manual clearing
  el.addEventListener('blur', writeInputs); // re-pad and clamp display
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') calculate();
  });
}

ampmBtn.addEventListener('click', () => {
  ampmBtn.textContent = ampmBtn.textContent === 'AM' ? 'PM' : 'AM';
  onTimeEdit();
});

age.addEventListener('change', () => { store(KEYS.age, age.value); render(); });
latency.addEventListener('input', () => { store(KEYS.latency, latency.value); render(); });
fmt.addEventListener('change', () => { store(KEYS.fmt, fmt.value); writeInputs(); render(); });

document.getElementById('settingsBtn').addEventListener('click', () => settings.showModal());
document.getElementById('settingsClose').addEventListener('click', () => settings.close());

const about = document.getElementById('about');
document.getElementById('aboutBtn').addEventListener('click', () => about.showModal());
document.getElementById('aboutClose').addEventListener('click', () => about.close());

age.value = load(KEYS.age, DEFAULTS.age);
latency.value = load(KEYS.latency, DEFAULTS.latency);
fmt.value = load(KEYS.fmt, DEFAULTS.fmt);

const startMode = load(KEYS.mode, DEFAULTS.mode);
setMode(startMode === 'bed' ? 'bed' : 'wake');
if (new URLSearchParams(location.search).get('mode') === 'sleep-now') sleepNow();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').catch(() => { });
}
