const CYCLES = [6, 5, 4, 3, 2, 1];
const MOONS = { 6: '🌕', 5: '🌔', 4: '🌓', 3: '🌒', 2: '🌘', 1: '🌑' };
// Recommended sleep hours per age range (NSF guidelines).
const AGE_HOURS = { child: [9, 11], teen: [8, 10], adult: [7, 9], senior: [7, 8] };

const KEYS = { mode: 'sleepCalc.mode', wakeTime: 'sleepCalc.wakeTime', bedTime: 'sleepCalc.bedTime', age: 'sleepCalc.age', latency: 'sleepCalc.latency' };
const DEFAULTS = { mode: 'wake', wakeTime: '07:00', bedTime: '23:00', age: 'adult', latency: '15' };

const time = document.getElementById('time');
const nowLabel = document.getElementById('nowLabel');
const lead = document.getElementById('lead');
const cards = document.getElementById('cards');
const hint = document.getElementById('hint');
const age = document.getElementById('age');
const latency = document.getElementById('latency');
const settings = document.getElementById('settings');
const modeButtons = [...document.querySelectorAll('.mode button')];

let mode = DEFAULTS.mode;

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

function fromTimeInput(value) {
  const [h, m] = value.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function formatTime(date) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);
}

function rating(hours) {
  const [lo, hi] = AGE_HOURS[age.value] ?? AGE_HOURS.adult;
  if (hours >= lo && hours <= hi) return 'good';
  if (hours >= lo - 1.5 && hours <= hi + 1.5) return 'ok';
  return 'low';
}

function render() {
  const now = new Date();
  const base = mode === 'wake' || mode === 'bed' ? fromTimeInput(time.value || DEFAULTS[mode + 'Time']) : now;
  const sign = mode === 'wake' ? -1 : 1;
  const wait = latencyMinutes();

  if (mode === 'now') nowLabel.textContent = formatTime(now);
  lead.textContent = mode === 'wake' ? 'Go to bed at one of these times' : 'Wake up at one of these times';
  hint.textContent = `1 cycle = 90 min · includes ${wait} min to fall asleep`;

  cards.innerHTML = '';
  for (const cycle of CYCLES) {
    const when = new Date(base.getTime() + sign * (wait + cycle * 90) * 60000);
    const hours = cycle * 1.5;
    const card = document.createElement('article');
    card.className = `card ${rating(hours)}`;
    card.innerHTML = `
      <span class="moon" aria-hidden="true">${MOONS[cycle]}</span>
      <span class="time">${formatTime(when)}</span>
      <span class="meta">${cycle} cycle${cycle > 1 ? 's' : ''} · ${hours} h</span>`;
    cards.append(card);
  }
}

function setMode(next) {
  mode = next;
  store(KEYS.mode, mode);
  for (const btn of modeButtons) btn.setAttribute('aria-pressed', String(btn.dataset.mode === mode));
  const isNow = mode === 'now';
  time.classList.toggle('hidden', isNow);
  nowLabel.classList.toggle('hidden', !isNow);
  if (!isNow) time.value = load(KEYS[mode + 'Time'], DEFAULTS[mode + 'Time']);
  render();
}

for (const btn of modeButtons) {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
}

time.addEventListener('input', () => {
  if (time.value) store(KEYS[mode + 'Time'], time.value);
  render();
});

age.addEventListener('change', () => { store(KEYS.age, age.value); render(); });
latency.addEventListener('input', () => { store(KEYS.latency, latency.value); render(); });

document.getElementById('settingsBtn').addEventListener('click', () => settings.showModal());
document.getElementById('settingsClose').addEventListener('click', () => settings.close());

// Keep "Sleep now" fresh as the clock moves.
setInterval(() => { if (mode === 'now') render(); }, 30000);

age.value = load(KEYS.age, DEFAULTS.age);
latency.value = load(KEYS.latency, DEFAULTS.latency);
const startMode = new URLSearchParams(location.search).get('mode') === 'sleep-now' ? 'now' : load(KEYS.mode, DEFAULTS.mode);
setMode(['wake', 'bed', 'now'].includes(startMode) ? startMode : DEFAULTS.mode);
