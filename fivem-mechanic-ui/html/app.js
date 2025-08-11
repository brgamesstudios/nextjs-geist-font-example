const appEl = document.getElementById('app');
const closeBtn = document.getElementById('closeBtn');
const repairBtn = document.getElementById('repairBtn');
const cleanBtn = document.getElementById('cleanBtn');
const maxBtn = document.getElementById('maxBtn');
const stockBtn = document.getElementById('stockBtn');
const extrasList = document.getElementById('extrasList');
const modsList = document.getElementById('modsList');

const colorPrimary = document.getElementById('colorPrimary');
const colorSecondary = document.getElementById('colorSecondary');
const colorPearl = document.getElementById('colorPearl');
const colorWheel = document.getElementById('colorWheel');
const applyColors = document.getElementById('applyColors');

const turboToggle = document.getElementById('turboToggle');
const wheelTypeSelect = document.getElementById('wheelTypeSelect');
const liverySelect = document.getElementById('liverySelect');
const plateInput = document.getElementById('plateInput');
const applyPlate = document.getElementById('applyPlate');

// Tabs
const tabs = Array.from(document.querySelectorAll('.tab'));
const contents = Array.from(document.querySelectorAll('.content'));
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.getAttribute('data-tab');
    const content = document.querySelector(`[data-content="${target}"]`);
    if (content) content.classList.add('active');
  });
});

const RESOURCE = 'fivem-mechanic-ui';

function nui(path, body) {
  return fetch(`https://${RESOURCE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(body ?? {})
  });
}

function populateWheelTypes(currentType) {
  const options = [
    { v: 0, t: 'Standart' },
    { v: 1, t: 'Spor' },
    { v: 2, t: 'Muscle' },
    { v: 3, t: 'Lowrider' },
    { v: 4, t: 'SUV' },
    { v: 5, t: 'Offroad' },
    { v: 6, t: 'Tuner' },
    { v: 7, t: 'Bike' },
    { v: 8, t: 'High End' }
  ];
  wheelTypeSelect.innerHTML = '';
  options.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o.v; opt.textContent = `${o.t} (${o.v})`;
    wheelTypeSelect.appendChild(opt);
  });
  if (typeof currentType === 'number') {
    wheelTypeSelect.value = String(currentType);
  }
}

function populateLivery(count, current) {
  liverySelect.innerHTML = '';
  if (!count || count <= 0) {
    const opt = document.createElement('option');
    opt.value = -1; opt.textContent = 'Yok';
    liverySelect.appendChild(opt);
    liverySelect.disabled = true;
    return;
  }
  liverySelect.disabled = false;
  for (let i = 0; i < count; i++) {
    const opt = document.createElement('option');
    opt.value = i; opt.textContent = `Livery ${i+1}`;
    liverySelect.appendChild(opt);
  }
  liverySelect.value = String(current ?? 0);
}

function openUI(payload) {
  appEl.classList.remove('hidden');

  // Colors
  colorPrimary.value = payload?.colors?.primary ?? 0;
  colorSecondary.value = payload?.colors?.secondary ?? 0;
  colorPearl.value = payload?.colors?.pearlescent ?? 0;
  colorWheel.value = payload?.colors?.wheel ?? 0;

  // Extras
  extrasList.innerHTML = '';
  (payload?.extras || []).forEach(extra => {
    const item = document.createElement('div');
    item.className = 'item';

    const label = document.createElement('label');
    label.textContent = `Extra ${extra.id}`;

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = !!extra.enabled;
    toggle.addEventListener('change', () => {
      nui('toggleExtra', { id: extra.id, enable: toggle.checked });
    });

    item.appendChild(label);
    item.appendChild(toggle);
    extrasList.appendChild(item);
  });

  // Mods
  modsList.innerHTML = '';
  (payload?.mods || []).forEach(mod => {
    const item = document.createElement('div');
    item.className = 'item';

    const label = document.createElement('div');
    label.textContent = `Mod ${mod.type}`;

    const select = document.createElement('select');
    const none = document.createElement('option');
    none.value = -1; none.textContent = 'Stok';
    select.appendChild(none);

    for (let i = 0; i < mod.count; i++) {
      const opt = document.createElement('option');
      opt.value = i; opt.textContent = `Seçenek ${i+1}`;
      select.appendChild(opt);
    }

    select.value = mod.current ?? -1;
    select.addEventListener('change', () => {
      nui('setMod', { type: mod.type, index: Number(select.value) });
    });

    item.appendChild(label);
    item.appendChild(select);
    modsList.appendChild(item);
  });

  // Turbo
  turboToggle.checked = !!payload?.turbo;

  // Wheel type
  populateWheelTypes(payload?.wheelType ?? 0);

  // Livery
  populateLivery(payload?.livery?.count ?? 0, payload?.livery?.current ?? 0);

  // Plate
  plateInput.value = payload?.plate || '';
}

function closeUI() {
  appEl.classList.add('hidden');
}

window.addEventListener('message', (e) => {
  const data = e.data || {};
  if (data.action === 'open') {
    openUI(data.vehicle || {});
  } else if (data.action === 'close') {
    closeUI();
  }
});

// Buttons
closeBtn.addEventListener('click', () => nui('close'));
repairBtn.addEventListener('click', () => nui('repair'));
cleanBtn.addEventListener('click', () => nui('clean'));
maxBtn.addEventListener('click', () => nui('maxperf'));
stockBtn.addEventListener('click', () => nui('stock'));
applyColors.addEventListener('click', () => {
  nui('setColor', {
    primary: Number(colorPrimary.value || 0),
    secondary: Number(colorSecondary.value || 0),
    pearlescent: Number(colorPearl.value || 0),
    wheel: Number(colorWheel.value || 0)
  });
});

turboToggle.addEventListener('change', () => {
  nui('setTurbo', { enable: turboToggle.checked });
});

wheelTypeSelect.addEventListener('change', () => {
  nui('setWheelType', { wheelType: Number(wheelTypeSelect.value) });
});

liverySelect.addEventListener('change', () => {
  if (!liverySelect.disabled) {
    nui('setLivery', { index: Number(liverySelect.value) });
  }
});

applyPlate.addEventListener('click', () => {
  nui('setPlate', { text: plateInput.value || '' }).then(async (res) => {
    try { const j = await res.json(); if (j?.plate) plateInput.value = j.plate; } catch {}
  });
});

// ESC to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    nui('close');
  }
});