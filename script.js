const CYCLES = [6, 5, 4, 3, 2, 1];
const DEFAULTS = {
  age: 'adult',
  wakeTime: '07:00',
  bedTime: '23:00',
  latency: '15'
};
const STORAGE_KEYS = {
  age: 'sleepCalc.age',
  wakeTime: 'sleepCalc.wakeTime',
  bedTime: 'sleepCalc.bedTime',
  latency: 'sleepCalc.latency'
};
const AGE_LABELS = {
  child: 'Child (6-13) → 9-11h',
  teen: 'Teen (14-17) → 8-10h',
  adult: 'Adult (18-64) → 7-9h',
  senior: 'Senior (65+) → 7-8h'
};

const wakeTime = document.getElementById('wakeTime');
const bedTime = document.getElementById('bedTime');
const age = document.getElementById('age');
const latency = document.getElementById('latency');
const result = document.getElementById('result');
const resultTitle = document.getElementById('resultTitle');
const resultLead = document.getElementById('resultLead');
const sleepSummary = document.getElementById('sleepSummary');
const cards = document.getElementById('cards');

function getStoredValue(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function setStoredValue(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures in private or restricted contexts.
  }
}

function fromTimeInput(value) {
  if (!value) return null;
  const [hour, minute] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

function plusMinutes(base, minutes) {
  return new Date(base.getTime() + minutes * 60000);
}

function formatTime(date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function cardStyle(cycle) {
  if (cycle >= 5) {
    return { cls: 'good', message: 'Best range (5-6 cycles) for a full night of rest.' };
  }
  if (cycle === 4) {
    return { cls: 'ok', message: 'Acceptable rest, but you may still feel a bit tired.' };
  }
  return { cls: 'low', message: 'Short sleep window. Useful only when needed.' };
}

function updateSummary() {
  const label = AGE_LABELS[age.value] ?? AGE_LABELS[DEFAULTS.age];
  sleepSummary.textContent = `Age range: ${label}. Time to fall asleep: ${latency.value || DEFAULTS.latency} minutes.`;
}

function render(options) {
  cards.innerHTML = '';
  for (const option of options) {
    const style = cardStyle(option.cycle);
    const card = document.createElement('article');
    card.className = `card ${style.cls}`;

    const title = document.createElement('h3');
    title.textContent = option.time;
    const text = document.createElement('p');
    text.textContent = `${option.cycle} cycle${option.cycle > 1 ? 's' : ''} - ${style.message}`;

    card.append(title, text);
    cards.append(card);
  }
  result.classList.remove('hidden');
}

function sleepLatencyMinutes() {
  const parsed = Number.parseInt(latency.value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function calculateFromWakeup() {
  const selected = fromTimeInput(wakeTime.value);
  if (!selected) {
    resultTitle.textContent = 'Pick a wake-up time first.';
    resultLead.textContent = 'Then we can suggest bedtime options.';
    cards.innerHTML = '';
    result.classList.remove('hidden');
    return;
  }

  const fallAsleep = sleepLatencyMinutes();
  const options = CYCLES.map(cycle => {
    const when = plusMinutes(selected, -(fallAsleep + cycle * 90));
    return { cycle, time: formatTime(when) };
  });

  resultTitle.textContent = 'If you want to wake up at this time, try going to bed at:';
  resultLead.textContent = 'These times help you wake between 90-minute cycles.';
  updateSummary();
  render(options);
}

function calculateFromBedtime() {
  const selected = fromTimeInput(bedTime.value);
  if (!selected) {
    resultTitle.textContent = 'Pick a bedtime first.';
    resultLead.textContent = 'Then we can suggest wake-up options.';
    cards.innerHTML = '';
    result.classList.remove('hidden');
    return;
  }

  const fallAsleep = sleepLatencyMinutes();
  const options = CYCLES.map(cycle => {
    const when = plusMinutes(selected, fallAsleep + cycle * 90);
    return { cycle, time: formatTime(when) };
  });

  resultTitle.textContent = 'If you go to bed at this time, try waking up at:';
  resultLead.textContent = 'A good night of sleep is usually 5-6 complete cycles.';
  updateSummary();
  render(options);
}

function calculateSleepNow() {
  const now = new Date();
  const fallAsleep = sleepLatencyMinutes();
  const options = CYCLES.map(cycle => {
    const when = plusMinutes(now, fallAsleep + cycle * 90);
    return { cycle, time: formatTime(when) };
  });

  resultTitle.textContent = 'If you go to sleep right now, you should try to wake up at:';
  resultLead.textContent = 'If you wake at one of these times, you will rise between 90-minute cycles.';
  updateSummary();
  render(options);
}

function bindPersistence() {
  age.addEventListener('change', () => {
    setStoredValue(STORAGE_KEYS.age, age.value);
    updateSummary();
  });

  wakeTime.addEventListener('input', () => setStoredValue(STORAGE_KEYS.wakeTime, wakeTime.value));
  bedTime.addEventListener('input', () => setStoredValue(STORAGE_KEYS.bedTime, bedTime.value));
  latency.addEventListener('input', () => {
    setStoredValue(STORAGE_KEYS.latency, latency.value);
    updateSummary();
  });
}

function restoreState() {
  age.value = getStoredValue(STORAGE_KEYS.age, DEFAULTS.age);
  wakeTime.value = getStoredValue(STORAGE_KEYS.wakeTime, DEFAULTS.wakeTime);
  bedTime.value = getStoredValue(STORAGE_KEYS.bedTime, DEFAULTS.bedTime);
  latency.value = getStoredValue(STORAGE_KEYS.latency, DEFAULTS.latency);
  updateSummary();
}

restoreState();
bindPersistence();

document.getElementById('wakeBtn').addEventListener('click', calculateFromWakeup);
document.getElementById('bedBtn').addEventListener('click', calculateFromBedtime);
document.getElementById('nowBtn').addEventListener('click', calculateSleepNow);
document.getElementById('backBtn').addEventListener('click', () => {
  result.classList.add('hidden');
  cards.innerHTML = '';
  wakeTime.focus();
});