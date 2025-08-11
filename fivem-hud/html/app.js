const root = document.getElementById('root');
const compass = document.getElementById('compass');
const street = document.getElementById('street');
const voice = document.getElementById('voice');
const voiceLevelText = document.getElementById('voiceLevel');
const northIndicator = document.getElementById('northIndicator');
const minimapFrame = document.getElementById('minimapFrame');

// Minimap overlay elements
const minimapOverlay = document.getElementById('minimapOverlay');
const minimapStreet = document.getElementById('minimapStreet');
const minimapZone = document.getElementById('minimapZone');

// top-left
const clockEl = document.getElementById('clock');
const playerIdEl = document.getElementById('playerId');
const cashEl = document.getElementById('cash');
const bankEl = document.getElementById('bank');

// circular speedo
const speedo = document.getElementById('speedo');
const speedArc = document.getElementById('speedArc');
const speedNum = document.getElementById('speedNum');
const speedUnitEl = document.getElementById('speedUnit');
const speedGearEl = document.getElementById('speedGear');

// Fuel and engine indicators
const fuelFill = document.getElementById('fuelFill');
const fuelText = document.getElementById('fuelText');
const engineFill = document.getElementById('engineFill');
const engineText = document.getElementById('engineText');

// right rings
const ringHp = document.getElementById('ringHp');
const ringArmor = document.getElementById('ringArmor');
const ringHunger = document.getElementById('ringHunger');
const ringThirst = document.getElementById('ringThirst');
const hpVal = document.getElementById('hpVal');
const armorVal = document.getElementById('armorVal');
const hungerVal = document.getElementById('hungerVal');
const thirstVal = document.getElementById('thirstVal');

// Settings elements
const panel = document.getElementById('settings');
const optVisible = document.getElementById('optVisible');
const optMetric = document.getElementById('optMetric');
const optCompass = document.getElementById('optCompass');
const optStreet = document.getElementById('optStreet');
const optVoice = document.getElementById('optVoice');
const optStress = document.getElementById('optStress');
const optMinimap = document.getElementById('optMinimap');
const optClock = document.getElementById('optClock');
const optFuel = document.getElementById('optFuel');
const optEngine = document.getElementById('optEngine');
const optIndicators = document.getElementById('optIndicators');
const optCircle = document.getElementById('optCircle');
const optRadarOnFoot = document.getElementById('optRadarOnFoot');
const btnSave = document.getElementById('btnSave');
const btnClose = document.getElementById('btnClose');

let currentPrefs = {
  visible: true,
  metric: false,
  showCompass: true,
  showStreetZone: true,
  showClock: true,
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
    currentPrefs.showClock = !!data.showClock;
    currentPrefs.useVoice = !!data.useVoice;
    currentPrefs.useStress = !!data.useStress;
    currentPrefs.useMinimap = !!data.useMinimap;

    speedUnitEl.textContent = currentPrefs.metric ? 'KMH' : 'MPH';
    document.getElementById('voice').style.display = currentPrefs.useVoice ? 'flex' : 'none';
    compass.style.display = currentPrefs.showCompass ? 'block' : 'none';
    street.style.display = currentPrefs.showStreetZone ? 'block' : 'none';
    if (minimapFrame) minimapFrame.style.display = currentPrefs.useMinimap ? 'block' : 'none';
    if (minimapOverlay) minimapOverlay.style.display = currentPrefs.useMinimap ? 'flex' : 'none';
    if (clockEl) clockEl.style.display = currentPrefs.showClock ? 'block' : 'none';

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
  if (data.action === 'wallet') {
    if (data.playerId !== undefined) playerIdEl.textContent = `${data.playerId}`;
    if (data.cash !== undefined) cashEl.textContent = `${data.cash}`;
    if (data.bank !== undefined) bankEl.textContent = `${data.bank}`;
    return;
  }
  if (data.action === 'street') {
    street.textContent = `${data.street} • ${data.zone}`;
    // Update minimap overlay
    if (minimapStreet) minimapStreet.textContent = data.street;
    if (minimapZone) minimapZone.textContent = data.zone;
    return;
  }
  if (data.action === 'minimapUpdate') {
    // Update minimap overlay independently
    if (minimapStreet) minimapStreet.textContent = data.street;
    if (minimapZone) minimapZone.textContent = data.zone;
    // Update north indicator rotation
    if (northIndicator) {
      northIndicator.style.transform = `translateX(-50%) rotate(${data.heading || 0}deg)`;
    }
    return;
  }
  if (data.action === 'vehicleStateChanged') {
    // Show/hide vehicle-related UI elements
    const speedo = document.getElementById('speedo');
    if (speedo) {
      speedo.style.display = data.inVehicle ? 'flex' : 'none';
    }
    
    // Show/hide minimap when not in vehicle (if configured)
    if (minimapOverlay && !Config.RadarOnFoot) {
      minimapOverlay.style.display = data.inVehicle ? 'flex' : 'none';
    }
    return;
  }
  if (data.action === 'playerStats') {
    // Update player stats (health, armor, stress, clock)
    if (hpVal) hpVal.textContent = `${Math.max(0, Math.min(100, Math.round(data.hp || 0)))}`;
    if (armorVal) armorVal.textContent = `${Math.max(0, Math.min(100, Math.round(data.armor || 0)))}`;
    
    // Update ring visual states
    if (ringHp) ringHp.style.setProperty('--hp', `${Math.max(0, Math.min(100, data.hp || 0))}%`);
    if (ringArmor) ringArmor.style.setProperty('--arm', `${Math.max(0, Math.min(100, data.armor || 0))}%`);
    
    // Hunger and thirst placeholders (if not wired to QBCore)
    const hun = Math.max(0, Math.min(100, Math.round(data.hunger ?? 100)));
    const thr = Math.max(0, Math.min(100, Math.round(data.thirst ?? 100)));
    if (hungerVal) hungerVal.textContent = `${hun}`;
    if (thirstVal) thirstVal.textContent = `${thr}`;
    if (ringHunger) ringHunger.style.setProperty('--hun', `${hun}%`);
    if (ringThirst) ringThirst.style.setProperty('--thr', `${thr}%`);
    
    // Update compass and minimap north
    const heading = data.heading || 0;
    if (compass) compass.textContent = headingToCardinal(heading);
    if (northIndicator) northIndicator.style.transform = `translateX(-50%) rotate(${heading}deg)`;
    
    // Update minimap overlay north indicator
    if (minimapOverlay && currentPrefs.useMinimap) {
      const minimapNorth = minimapOverlay.querySelector('.minimap-north');
      if (minimapNorth) {
        minimapNorth.style.transform = `translateX(-50%) rotate(${heading}deg)`;
      }
    }
    
    // Update clock
    if (clockEl && currentPrefs.showClock) {
      const hh = String(data.hour ?? 0).padStart(2, '0');
      const mm = String(data.minute ?? 0).padStart(2, '0');
      clockEl.textContent = `${hh}:${mm}`;
    }
    return;
  }
  if (data.action === 'voice') {
    voice.classList.toggle('talking', !!data.talking);
    voiceLevelText.textContent = ['W','N','S','X'][Math.min(3, Math.max(0, data.level || 0))] || 'N';
    return;
  }
  if (data.action === 'tick') {
    // Speedo arc
    speedUnitEl.textContent = currentPrefs.metric ? 'KMH' : 'MPH';
    speedNum.textContent = `${data.speed || 0}`;
    speedGearEl.textContent = data.gear === 0 ? 'N' : `${data.gear}`;
    const maxSpeed = currentPrefs.metric ? 240 : 160; // visual cap
    const fraction = Math.max(0, Math.min(1, (data.speed || 0) / maxSpeed));
    const totalLen = 326;
    speedArc.style.strokeDashoffset = `${totalLen - totalLen * fraction}`;

    // Fuel and engine indicators
    if (fuelFill && fuelText) {
      const fuelPercent = Math.max(0, Math.min(100, data.fuel || 100));
      fuelFill.style.height = `${fuelPercent}%`;
      fuelText.textContent = `${Math.round(fuelPercent)}%`;
    }
    
    if (engineFill && engineText) {
      const enginePercent = Math.max(0, Math.min(100, data.engine || 100));
      engineFill.style.height = `${enginePercent}%`;
      engineText.textContent = `${Math.round(enginePercent)}%`;
    }
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
  optClock.checked = !!currentPrefs.showClock;
  optCircle.checked = true;
  optRadarOnFoot.checked = false;
}

btnSave?.addEventListener('click', () => {
  const payload = {
    visible: !!optVisible.checked,
    metric: !!optMetric.checked,
    showCompass: !!optCompass.checked,
    showStreetZone: !!optStreet.checked,
    showClock: !!optClock.checked,
    useVoice: !!optVoice.checked,
    useStress: !!optStress.checked,
    useMinimap: !!optMinimap.checked,
    circleMinimap: !!optCircle.checked,
    radarOnFoot: !!optRadarOnFoot.checked,
  };
  fetch(`https://fivem-hud/applySettings`, { method: 'POST', body: JSON.stringify(payload) })
    .then(() => { panel.classList.add('hidden'); fetch(`https://fivem-hud/close`, { method: 'POST', body: '{}' }).catch(() => {}); })
    .catch(() => {});
});

btnClose?.addEventListener('click', () => { panel.classList.add('hidden'); fetch(`https://fivem-hud/close`, { method: 'POST', body: '{}' }).catch(() => {}); });
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') { panel.classList.add('hidden'); fetch(`https://fivem-hud/close`, { method: 'POST', body: '{}' }).catch(() => {}); } });

function headingToCardinal(h) { const dirs = ['N','NE','E','SE','S','SW','W','NW','N']; const idx = Math.round(h / 45); return dirs[idx]; }

window.addEventListener('DOMContentLoaded', () => { fetch(`https://fivem-hud/ready`, { method: 'POST', body: '{}' }).catch(() => {}); });