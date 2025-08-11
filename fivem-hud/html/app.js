const root = document.getElementById('root');
const compass = document.getElementById('compass');
const street = document.getElementById('street');
const voice = document.getElementById('voice');
const voiceLevelText = document.getElementById('voiceLevel');
const hpText = document.getElementById('hpText');
const armorText = document.getElementById('armorText');
const speedEl = document.getElementById('speed');
const speedUnitEl = document.getElementById('speedUnit');
const gearEl = document.getElementById('gear');
const rpmEl = document.getElementById('rpm');
const seatbeltEl = document.getElementById('seatbelt');
const vehicleBlock = document.getElementById('vehicleBlock');
const stressBar = document.getElementById('stressBar');
const stressText = document.getElementById('stressText');
const northIndicator = document.getElementById('northIndicator');
const minimapFrame = document.getElementById('minimapFrame');

// Settings elements
const panel = document.getElementById('settings');
const optVisible = document.getElementById('optVisible');
const optMetric = document.getElementById('optMetric');
const optCompass = document.getElementById('optCompass');
const optStreet = document.getElementById('optStreet');
const optVoice = document.getElementById('optVoice');
const optStress = document.getElementById('optStress');
const optMinimap = document.getElementById('optMinimap');
const optCircle = document.getElementById('optCircle');
const optRadarOnFoot = document.getElementById('optRadarOnFoot');
const btnSave = document.getElementById('btnSave');
const btnClose = document.getElementById('btnClose');

let currentPrefs = {
  visible: true,
  metric: false,
  showCompass: true,
  showStreetZone: true,
  useVoice: true,
  useStress: true,
  useMinimap: true,
  circleMinimap: true,
  radarOnFoot: false,
};

window.addEventListener('message', (e) => {
  const data = e.data || {};
  if (data.action === 'setVisible') {
    root.classList.toggle('hidden', !data.visible);
    currentPrefs.visible = !!data.visible;
    if (optVisible) optVisible.checked = currentPrefs.visible;
    return;
  }
  if (data.action === 'config') {
    currentPrefs.metric = !!data.metric;
    currentPrefs.showCompass = !!data.showCompass;
    currentPrefs.showStreetZone = !!data.showStreetZone;
    currentPrefs.useVoice = !!data.useVoice;
    currentPrefs.useStress = !!data.useStress;
    currentPrefs.useMinimap = !!data.useMinimap;

    speedUnitEl.textContent = currentPrefs.metric ? 'KMH' : 'MPH';
    document.getElementById('voice').style.display = currentPrefs.useVoice ? 'flex' : 'none';
    document.getElementById('compass').style.display = currentPrefs.showCompass ? 'block' : 'none';
    document.getElementById('street').style.display = currentPrefs.showStreetZone ? 'block' : 'none';
    if (stressBar) stressBar.style.display = currentPrefs.useStress ? 'block' : 'none';
    if (minimapFrame) minimapFrame.style.display = currentPrefs.useMinimap ? 'block' : 'none';

    // Reflect in panel if open
    if (panel && !panel.classList.contains('hidden')) populateSettings();
    return;
  }
  if (data.action === 'openSettings') {
    if (panel) {
      populateSettings();
      panel.classList.remove('hidden');
    }
    return;
  }
  if (data.action === 'street') {
    street.textContent = `${data.street} • ${data.zone}`;
    return;
  }
  if (data.action === 'voice') {
    voice.classList.toggle('talking', !!data.talking);
    voiceLevelText.textContent = ['W','N','S','X'][Math.min(3, Math.max(0, data.level || 0))] || 'N';
    return;
  }
  if (data.action === 'seatbelt') {
    seatbeltEl.classList.toggle('on', !!data.on);
    return;
  }
  if (data.action === 'tick') {
    // Health/armor
    hpText.textContent = `${Math.max(0, Math.min(100, Math.round(data.hp || 0)))}`;
    armorText.textContent = `${Math.max(0, Math.min(100, Math.round(data.armor || 0)))}`;
    document.querySelector('.bar.hp').style.setProperty('--hpw', `${Math.max(0, Math.min(100, data.hp || 0))}%`);
    document.querySelector('.bar.armor').style.setProperty('--armw', `${Math.max(0, Math.min(100, data.armor || 0))}%`);

    // Stress
    if (stressBar) {
      const s = Math.max(0, Math.min(100, Math.round(data.stress || 0)));
      stressText.textContent = `${s}`;
      stressBar.style.setProperty('--stw', `${s}%`);
    }

    // Vehicle
    vehicleBlock.style.display = data.inVehicle ? 'flex' : 'none';
    speedUnitEl.textContent = (currentPrefs.metric || false) ? 'KMH' : 'MPH';
    speedEl.textContent = `${data.speed || 0}`;

    const speedWrap = document.querySelector('.speed');
    speedWrap.classList.remove('warn', 'danger');
    if (data.speed >= (window.speedDanger || 120)) speedWrap.classList.add('danger');
    else if (data.speed >= (window.speedWarn || 80)) speedWrap.classList.add('warn');

    gearEl.textContent = data.gear === 0 ? 'N' : `${data.gear}`;
    rpmEl.textContent = (data.rpm || 0).toFixed(1);

    // Compass + minimap north
    const heading = data.heading || 0;
    compass.textContent = headingToCardinal(heading);
    if (northIndicator) {
      northIndicator.style.transform = `translateX(-50%) rotate(${heading}deg)`;
    }

    seatbeltEl.classList.toggle('on', !!data.seatbelt);
    return;
  }
});

function populateSettings() {
  if (!panel) return;
  optVisible.checked = !!currentPrefs.visible;
  optMetric.checked = !!currentPrefs.metric;
  optCompass.checked = !!currentPrefs.showCompass;
  optStreet.checked = !!currentPrefs.showStreetZone;
  optVoice.checked = !!currentPrefs.useVoice;
  optStress.checked = !!currentPrefs.useStress;
  optMinimap.checked = !!currentPrefs.useMinimap;
  // best effort for circle/radarOnFoot from config until we persist
  optCircle.checked = true;
  optRadarOnFoot.checked = false;
}

btnSave?.addEventListener('click', () => {
  const payload = {
    visible: !!optVisible.checked,
    metric: !!optMetric.checked,
    showCompass: !!optCompass.checked,
    showStreetZone: !!optStreet.checked,
    useVoice: !!optVoice.checked,
    useStress: !!optStress.checked,
    useMinimap: !!optMinimap.checked,
    circleMinimap: !!optCircle.checked,
    radarOnFoot: !!optRadarOnFoot.checked,
  };
  fetch(`https://fivem-hud/applySettings`, { method: 'POST', body: JSON.stringify(payload) })
    .then(() => {
      panel.classList.add('hidden');
      fetch(`https://fivem-hud/close`, { method: 'POST', body: '{}' }).catch(() => {});
    })
    .catch(() => {});
});

btnClose?.addEventListener('click', () => {
  panel.classList.add('hidden');
  fetch(`https://fivem-hud/close`, { method: 'POST', body: '{}' }).catch(() => {});
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    panel.classList.add('hidden');
    fetch(`https://fivem-hud/close`, { method: 'POST', body: '{}' }).catch(() => {});
  }
});

function headingToCardinal(h) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW','N'];
  const idx = Math.round(h / 45);
  return dirs[idx];
}

// Notify Lua we're ready
window.addEventListener('DOMContentLoaded', () => {
  fetch(`https://fivem-hud/ready`, { method: 'POST', body: '{}' }).catch(() => {});
});

// Defaults still used for speed coloring
window.speedWarn = 80;
window.speedDanger = 120;