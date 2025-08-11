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

const RESOURCE = 'fivem-mechanic-ui';

function nui(path, body) {
  return fetch(`https://${RESOURCE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(body ?? {})
  });
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
    none.value = -1; none.textContent = 'Stock';
    select.appendChild(none);

    for (let i = 0; i < mod.count; i++) {
      const opt = document.createElement('option');
      opt.value = i; opt.textContent = `Option ${i+1}`;
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

// ESC to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    nui('close');
  }
});