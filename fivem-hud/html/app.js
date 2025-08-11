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

window.addEventListener('message', (e) => {
  const data = e.data || {};
  if (data.action === 'setVisible') {
    root.classList.toggle('hidden', !data.visible);
    return;
  }
  if (data.action === 'config') {
    window.metricSpeed = !!data.metric;
    window.speedWarn = data.speedWarn || 80;
    window.speedDanger = data.speedDanger || 120;
    speedUnitEl.textContent = window.metricSpeed ? 'KMH' : 'MPH';
    document.getElementById('voice').style.display = data.useVoice ? 'flex' : 'none';
    document.getElementById('compass').style.display = data.showCompass ? 'block' : 'none';
    document.getElementById('street').style.display = data.showStreetZone ? 'block' : 'none';
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

    // Vehicle
    vehicleBlock.style.display = data.inVehicle ? 'flex' : 'none';
    const isMetric = speedUnitEl.textContent === 'KMH';
    speedUnitEl.textContent = (window.metricSpeed || false) ? 'KMH' : 'MPH';
    speedEl.textContent = `${data.speed || 0}`;

    const speedWrap = document.querySelector('.speed');
    speedWrap.classList.remove('warn', 'danger');
    if (data.speed >= (window.speedDanger || 120)) speedWrap.classList.add('danger');
    else if (data.speed >= (window.speedWarn || 80)) speedWrap.classList.add('warn');

    gearEl.textContent = data.gear === 0 ? 'N' : `${data.gear}`;
    rpmEl.textContent = (data.rpm || 0).toFixed(1);

    // Compass
    const heading = data.heading || 0;
    compass.textContent = headingToCardinal(heading);

    seatbeltEl.classList.toggle('on', !!data.seatbelt);
    return;
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

// Exposed config from Lua via convar replacements not available; use post-init defaults
window.metricSpeed = false;
window.speedWarn = 80;
window.speedDanger = 120;