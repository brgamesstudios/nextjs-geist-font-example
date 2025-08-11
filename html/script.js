// FiveM Mechanic System - Client-side JavaScript

class MechanicUI {
  constructor() {
    this.app = document.getElementById('app');
    this.progress = document.getElementById('progress');
    this.progressBar = document.getElementById('progressBar');
    this.progressLabel = document.getElementById('progressLabel');

    this.tabs = Array.from(document.querySelectorAll('.tab'));
    this.panes = {
      diagnostics: document.getElementById('tab-diagnostics'),
      repair: document.getElementById('tab-repair'),
      parts: document.getElementById('tab-parts'),
    };

    this.vehModel = document.getElementById('vehModel');
    this.vehPlate = document.getElementById('vehPlate');
    this.vehClass = document.getElementById('vehClass');
    this.vehHealth = document.getElementById('vehHealth');
    this.vehHealthBar = document.getElementById('vehHealthBar');

    this.repairOptions = document.getElementById('repairOptions');
    this.partsInventory = document.getElementById('partsInventory');
    this.partsShop = document.getElementById('partsShop');

    document.getElementById('closeBtn').addEventListener('click', () => this.hide());
    this.tabs.forEach(btn => btn.addEventListener('click', () => this.switchTab(btn.dataset.tab)));

    window.addEventListener('message', (event) => this.onMessage(event.data));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hide();
    });

    // Request parts on load
    setTimeout(() => this.requestParts(), 50);
  }

  show(payload) {
    this.app.classList.remove('hidden');
    this.switchTab('diagnostics');
    if (payload && payload.vehicle) this.updateVehicle(payload.vehicle);
  }

  hide() {
    this.app.classList.add('hidden');
    fetch(`https://${GetParentResourceName()}/close`, { method: 'POST', body: '{}' });
  }

  switchTab(name) {
    this.tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    Object.entries(this.panes).forEach(([k, el]) => el.classList.toggle('active', k === name));
    if (name === 'parts') this.requestParts();
  }

  onMessage(msg) {
    switch (msg.action) {
      case 'show': this.show(msg.data || {}); break;
      case 'hide': this.app.classList.add('hidden'); break;
      case 'updateVehicleData': this.updateVehicle(msg.data || {}); break;
      case 'updatePartsInventory': this.renderParts(msg.data || []); break;
      case 'showProgress': this.showProgress(msg.data); break;
      case 'hideProgress': this.hideProgress(); break;
      case 'notification': console.log('Notification:', msg.data); break;
    }
  }

  updateVehicle(data) {
    this.vehModel.textContent = data.model || '-';
    this.vehPlate.textContent = data.plate || '-';
    this.vehClass.textContent = (data.class ?? '-') + '';
    const health = Math.max(0, Math.min(100, Number(data.health || 0)));
    this.vehHealth.textContent = `${health}%`;
    this.vehHealthBar.style.width = `${health}%`;

    this.renderRepairs();
  }

  renderRepairs() {
    const repairs = [
      { key: 'quick', label: 'Quick Fix' },
      { key: 'tyres', label: 'Tyre Replacement' },
      { key: 'brakes', label: 'Brake Service' },
      { key: 'body', label: 'Body Repair' },
      { key: 'engine', label: 'Engine Overhaul' },
    ];

    this.repairOptions.innerHTML = '';
    repairs.forEach(r => {
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `
        <div>
          <div class="title">${r.label}</div>
          <div class="muted">${r.key}</div>
        </div>
        <div class="actions">
          <button class="btn success">Repair</button>
        </div>
      `;
      el.querySelector('button').addEventListener('click', () => this.performRepair(r.key));
      this.repairOptions.appendChild(el);
    });
  }

  renderParts(parts) {
    // Inventory
    this.partsInventory.innerHTML = '';
    parts.forEach(p => {
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `
        <div>
          <div class="title">${p.label}</div>
          <div class="muted">You have: ${p.count}</div>
        </div>
        <div class="actions"></div>
      `;
      this.partsInventory.appendChild(el);
    });

    // Shop
    this.partsShop.innerHTML = '';
    parts.forEach(p => {
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `
        <div>
          <div class="title">${p.label}</div>
          <div class="muted">$${p.price}</div>
        </div>
        <div class="actions">
          <input type="number" min="1" value="1" style="width:60px;background:transparent;border:1px solid rgba(255,255,255,0.15);color:white;border-radius:6px;padding:6px;" />
          <button class="btn primary">Buy</button>
        </div>
      `;
      const qty = el.querySelector('input');
      el.querySelector('button').addEventListener('click', () => this.buyPart(p.name, Number(qty.value || 1)));
      this.partsShop.appendChild(el);
    });
  }

  requestParts() {
    fetch(`https://${GetParentResourceName()}/requestPartsInventory`, { method: 'POST', body: '{}' });
  }

  buyPart(name, quantity) {
    fetch(`https://${GetParentResourceName()}/buyPart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ part: name, quantity })
    });
    // update inventory shortly after
    setTimeout(() => this.requestParts(), 300);
  }

  performRepair(key) {
    fetch(`https://${GetParentResourceName()}/performRepair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repair: key })
    });
  }

  showProgress(data) {
    const duration = Number(data?.duration || 0);
    const label = data?.label || 'Working...';
    this.progressLabel.textContent = label;
    this.progressBar.style.width = '0%';
    this.progress.classList.remove('hidden');

    if (this._timer) clearInterval(this._timer);
    const start = performance.now();
    this._timer = setInterval(() => {
      const elapsed = performance.now() - start;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      this.progressBar.style.width = pct + '%';
      if (pct >= 100) {
        clearInterval(this._timer);
        this.hideProgress();
      }
    }, 50);
  }

  hideProgress() {
    if (this._timer) clearInterval(this._timer);
    this.progress.classList.add('hidden');
  }
}

const ui = new MechanicUI();