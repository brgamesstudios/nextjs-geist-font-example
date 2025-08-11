// FiveM Mechanic System - Client-side JavaScript

(function() {
  const resourceName = typeof GetParentResourceName === 'function' ? GetParentResourceName() : 'advanced_mechanic';

  const app = document.getElementById('app');
  const btnClose = document.getElementById('btn-close');
  const tabs = Array.from(document.querySelectorAll('.tab'));

  const vehModel = document.getElementById('veh-model');
  const vehPlate = document.getElementById('veh-plate');
  const vehHealthBar = document.getElementById('veh-health-bar');
  const vehHealthLabel = document.getElementById('veh-health-label');
  const btnRefresh = document.getElementById('btn-refresh');

  const repairList = document.getElementById('repair-list');
  const partsList = document.getElementById('parts-list');
  const shopList = document.getElementById('shop-list');

  const progressOverlay = document.getElementById('progress');
  const progressLabel = document.getElementById('progress-label');
  const progressBar = document.getElementById('progress-bar');

  const toast = document.getElementById('toast');
  let toastTimer = null;

  function post(action, payload) {
    fetch(`https://${resourceName}/nui:action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(Object.assign({ type: action }, payload || {})),
    }).catch(() => {});
  }

  function show() { app.classList.remove('hidden'); }
  function hide() { app.classList.add('hidden'); }

  function switchTab(name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === `tab-${name}`));
  }

  function updateVehicleData(data) {
    if (!data || !data.hasVehicle) {
      vehModel.textContent = 'No vehicle';
      vehPlate.textContent = '-';
      vehHealthBar.style.width = '0%';
      vehHealthLabel.textContent = '0%';
      return;
    }
    vehModel.textContent = data.model || '-';
    vehPlate.textContent = data.plate || '-';
    const hp = Math.max(0, Math.min(100, Math.round((data.healthPercent || 0) * 10) / 10));
    vehHealthBar.style.width = `${hp}%`;
    vehHealthLabel.textContent = `${hp}%`;
  }

  function buildRepairList(repairs) {
    repairList.innerHTML = '';
    Object.entries(repairs || {}).forEach(([key, r]) => {
      const el = document.createElement('div');
      el.className = 'list-item';
      el.innerHTML = `
        <div><div class="value">${r.label || key}</div><div class="muted">Time: ${(r.time/1000).toFixed(0)}s</div></div>
        <div class="badge">Cost: $${r.cost || 0}</div>
        <button class="btn" data-repair="${key}">Repair</button>
      `;
      el.querySelector('button').addEventListener('click', () => post('repair', { repairType: key }));
      repairList.appendChild(el);
    });
  }

  function buildPartsInventory(parts) {
    partsList.innerHTML = '';
    Object.entries(parts || {}).forEach(([name, count]) => {
      const el = document.createElement('div');
      el.className = 'list-item';
      el.innerHTML = `
        <div><div class="value">${name}</div><div class="muted">Owned</div></div>
        <div class="badge">x${count}</div>
        <div></div>
      `;
      partsList.appendChild(el);
    });
  }

  // The shop list is built from the same parts set (labels/prices come from server-side config; we mirror keys client-side for now)
  function buildShop(partsCatalog) {
    shopList.innerHTML = '';
    const entries = Object.entries(partsCatalog || {});
    entries.forEach(([name, data]) => {
      const el = document.createElement('div');
      el.className = 'list-item';
      el.innerHTML = `
        <div><div class="value">${data.label || name}</div><div class="muted">${name}</div></div>
        <div class="badge">$${data.price || 0}</div>
        <button class="btn" data-buy="${name}">Buy</button>
      `;
      el.querySelector('button').addEventListener('click', () => post('buyPart', { part: name, quantity: 1 }));
      shopList.appendChild(el);
    });
  }

  function showProgress(label, duration) {
    progressLabel.textContent = label || 'Working...';
    progressBar.style.width = '0%';
    progressOverlay.classList.remove('hidden');

    let start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, Math.min(100, Math.floor((elapsed / duration) * 100)));
      progressBar.style.width = `${pct}%`;
      if (elapsed < duration) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function hideProgress() {
    progressOverlay.classList.add('hidden');
  }

  function notify(message, type) {
    toast.textContent = message || '';
    toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 2500);
  }

  // Events
  btnClose.addEventListener('click', () => post('close'));
  btnRefresh.addEventListener('click', () => post('requestVehicleData'));
  tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));

  window.addEventListener('message', (e) => {
    const data = e.data || {};
    if (data.action === 'show') { show(); post('requestVehicleData'); post('requestParts'); return; }
    if (data.action === 'hide') { hide(); return; }
    if (data.action === 'updateVehicleData') { updateVehicleData(data.data); return; }
    if (data.action === 'updatePartsInventory') { buildPartsInventory(data.parts); return; }
    if (data.action === 'showProgress') { showProgress(data.label, data.duration); return; }
    if (data.action === 'hideProgress') { hideProgress(); return; }
    if (data.action === 'notification') { notify(data.message, data.type); return; }
  });

  // Build constant lists from server-defined config, mirrored here at runtime via initial message (optional)
  // For simplicity, we inline a minimal client-side mirror. Server should ideally send these.
  const defaultRepairs = {
    quick: { label: 'Quick Repair', time: 5000, cost: 500 },
    engine: { label: 'Engine Overhaul', time: 15000, cost: 3000 },
    body: { label: 'Body Repair', time: 12000, cost: 1200 },
  };

  const defaultPartsCatalog = {
    engine_oil: { label: 'Engine Oil', price: 100 },
    spark_plug: { label: 'Spark Plug', price: 50 },
    repair_kit: { label: 'Repair Kit', price: 500 },
    metal_sheet: { label: 'Metal Sheet', price: 200 },
  };

  buildRepairList(defaultRepairs);
  buildShop(defaultPartsCatalog);

  // ESC closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') post('close');
  });
})();