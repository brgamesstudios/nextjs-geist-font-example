// FiveM Mechanic System - Client-side JavaScript

class MechanicUI {
    constructor() {
        this.isVisible = false;
        this.currentTab = 'diagnostics';
        this.vehicleData = null;
        this.partsInventory = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupNUI();
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.closest('.tab-btn').dataset.tab);
            });
        });

        // Close button
        document.getElementById('closeBtn').addEventListener('click', () => {
            this.hide();
        });

        // Repair buttons
        document.querySelectorAll('[data-repair]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const repairType = e.target.closest('[data-repair]').dataset.repair;
                this.triggerRepair(repairType);
            });
        });

        // Parts shop toggle
        document.getElementById('buyPartsBtn').addEventListener('click', () => {
            this.togglePartsShop();
        });

        // Modification buttons
        document.querySelectorAll('.mod-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modType = e.target.closest('.mod-btn').dataset.mod;
                this.triggerModification(modType);
            });
        });

        // Paint buttons
        document.querySelectorAll('.paint-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = e.target.closest('.paint-btn').dataset.color;
                this.triggerPaint(color);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
        });
    }

    setupNUI() {
        // Listen for messages from FiveM client
        window.addEventListener('message', (event) => {
            const data = event.data;

            switch (data.type) {
                case 'show':
                    this.show();
                    break;
                case 'hide':
                    this.hide();
                    break;
                case 'updateVehicleData':
                    this.updateVehicleData(data.vehicleData);
                    break;
                case 'updatePartsInventory':
                    this.updatePartsInventory(data.parts);
                    break;
                case 'showProgress':
                    this.showProgress(data.message, data.duration);
                    break;
                case 'hideProgress':
                    this.hideProgress();
                    break;
                case 'notification':
                    this.showNotification(data.message, data.type);
                    break;
            }
        });
    }

    show() {
        this.isVisible = true;
        document.getElementById('app').classList.remove('hidden');
        this.refreshData();
    }

    hide() {
        this.isVisible = false;
        document.getElementById('app').classList.add('hidden');
        this.sendNUIMessage('hide');
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;
        this.refreshTabContent();
    }

    refreshData() {
        // Request fresh data from FiveM client
        this.sendNUIMessage('getVehicleData');
        this.sendNUIMessage('getPartsInventory');
    }

    refreshTabContent() {
        switch (this.currentTab) {
            case 'diagnostics':
                this.updateDiagnostics();
                break;
            case 'parts':
                this.updatePartsDisplay();
                break;
        }
    }

    updateVehicleData(vehicleData) {
        this.vehicleData = vehicleData;
        this.updateDiagnostics();
    }

    updateDiagnostics() {
        if (!this.vehicleData) return;

        // Update health bars
        const engineHealth = Math.max(0, Math.min(100, this.vehicleData.engineHealth / 10));
        const bodyHealth = Math.max(0, Math.min(100, this.vehicleData.bodyHealth / 10));
        const fuelLevel = Math.max(0, Math.min(100, this.vehicleData.fuelLevel));
        const performance = Math.round((engineHealth + bodyHealth) / 2);

        // Update health bars
        document.getElementById('engineHealth').style.width = engineHealth + '%';
        document.getElementById('engineHealthText').textContent = Math.round(engineHealth) + '%';
        
        document.getElementById('bodyHealth').style.width = bodyHealth + '%';
        document.getElementById('bodyHealthText').textContent = Math.round(bodyHealth) + '%';
        
        document.getElementById('fuelLevel').style.width = fuelLevel + '%';
        document.getElementById('fuelLevelText').textContent = Math.round(fuelLevel) + '%';
        
        document.getElementById('performance').style.width = performance + '%';
        document.getElementById('performanceText').textContent = Math.round(performance) + '%';

        // Update summary
        this.updateVehicleSummary();
    }

    updateVehicleSummary() {
        if (!this.vehicleData) return;

        const engineHealth = this.vehicleData.engineHealth / 10;
        const bodyHealth = this.vehicleData.bodyHealth / 10;
        const fuelLevel = this.vehicleData.fuelLevel;

        // Determine overall condition
        let overallCondition = 'Good';
        let recommendedActions = 'None';

        if (engineHealth < 50 || bodyHealth < 50) {
            overallCondition = 'Poor';
            recommendedActions = 'Repair required';
        } else if (engineHealth < 80 || bodyHealth < 80) {
            overallCondition = 'Fair';
            recommendedActions = 'Maintenance recommended';
        }

        if (fuelLevel < 20) {
            recommendedActions = 'Low fuel';
        }

        document.getElementById('overallCondition').textContent = overallCondition;
        document.getElementById('recommendedActions').textContent = recommendedActions;
    }

    updatePartsInventory(parts) {
        this.partsInventory = parts;
        this.updatePartsDisplay();
    }

    updatePartsDisplay() {
        const partsGrid = document.getElementById('partsGrid');
        partsGrid.innerHTML = '';

        if (Object.keys(this.partsInventory).length === 0) {
            partsGrid.innerHTML = '<div class="no-parts">No parts in inventory</div>';
            return;
        }

        Object.entries(this.partsInventory).forEach(([partId, count]) => {
            const partCard = this.createPartCard(partId, count);
            partsGrid.appendChild(partCard);
        });
    }

    createPartCard(partId, count) {
        const card = document.createElement('div');
        card.className = 'part-card';
        card.innerHTML = `
            <div class="card-header">
                <i class="fas fa-cog"></i>
                <h4>${this.getPartLabel(partId)}</h4>
            </div>
            <div class="card-content">
                <span class="quantity">Quantity: ${count}</span>
                <span class="weight">Weight: ${this.getPartWeight(partId)}kg</span>
            </div>
        `;
        return card;
    }

    getPartLabel(partId) {
        const partData = this.getPartData(partId);
        return partData ? partData.label : partId;
    }

    getPartWeight(partId) {
        const partData = this.getPartData(partId);
        return partData ? partData.weight : 0;
    }

    getPartData(partId) {
        // This would typically come from the config
        const parts = {
            'engine_part': { label: 'Engine Part', weight: 2.0 },
            'body_part': { label: 'Body Part', weight: 1.5 },
            'wheel_part': { label: 'Wheel Part', weight: 1.0 },
            'oil': { label: 'Motor Oil', weight: 0.5 }
        };
        return parts[partId];
    }

    togglePartsShop() {
        const partsShop = document.getElementById('partsShop');
        const partsGrid = document.getElementById('partsGrid');
        const buyPartsBtn = document.getElementById('buyPartsBtn');

        if (partsShop.classList.contains('hidden')) {
            partsShop.classList.remove('hidden');
            partsGrid.classList.add('hidden');
            buyPartsBtn.textContent = 'Show Inventory';
            this.populatePartsShop();
        } else {
            partsShop.classList.add('hidden');
            partsGrid.classList.remove('hidden');
            buyPartsBtn.textContent = 'Buy Parts';
        }
    }

    populatePartsShop() {
        const shopItems = document.getElementById('shopItems');
        shopItems.innerHTML = '';

        const parts = [
            { id: 'engine_part', label: 'Engine Part', price: 250, weight: 2.0 },
            { id: 'body_part', label: 'Body Part', price: 150, weight: 1.5 },
            { id: 'wheel_part', label: 'Wheel Part', price: 100, weight: 1.0 },
            { id: 'oil', label: 'Motor Oil', price: 50, weight: 0.5 }
        ];

        parts.forEach(part => {
            const item = document.createElement('div');
            item.className = 'shop-item';
            item.innerHTML = `
                <div class="item-info">
                    <h4>${part.label}</h4>
                    <p>Weight: ${part.weight}kg</p>
                    <span class="price">$${part.price}</span>
                </div>
                <div class="item-actions">
                    <input type="number" min="1" max="99" value="1" class="quantity-input">
                    <button class="btn btn-primary buy-btn" data-part="${part.id}">
                        <i class="fas fa-shopping-cart"></i>
                        Buy
                    </button>
                </div>
            `;
            shopItems.appendChild(item);
        });

        // Bind buy buttons
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const partId = e.target.closest('.buy-btn').dataset.part;
                const quantity = parseInt(e.target.closest('.item-actions').querySelector('.quantity-input').value);
                this.buyPart(partId, quantity);
            });
        });
    }

    buyPart(partId, quantity) {
        this.sendNUIMessage('buyPart', { partId, quantity });
    }

    triggerRepair(repairType) {
        this.sendNUIMessage('repair', { type: repairType });
    }

    triggerModification(modType) {
        this.sendNUIMessage('modification', { type: modType });
    }

    triggerPaint(color) {
        this.sendNUIMessage('paint', { color: color });
    }

    showProgress(message, duration) {
        const progressContainer = document.getElementById('progressContainer');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        progressText.textContent = message;
        progressContainer.classList.remove('hidden');

        // Animate progress bar
        let progress = 0;
        const interval = setInterval(() => {
            progress += (100 / (duration / 100));
            progressFill.style.width = Math.min(progress, 100) + '%';

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    this.hideProgress();
                }, 500);
            }
        }, 100);
    }

    hideProgress() {
        document.getElementById('progressContainer').classList.add('hidden');
        document.getElementById('progressFill').style.width = '0%';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Hide and remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    sendNUIMessage(action, data = {}) {
        fetch(`https://${GetParentResourceName()}/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(data)
        });
    }
}

// Mock function for development (will be replaced by FiveM)
function GetParentResourceName() {
    return 'mechanic';
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mechanicUI = new MechanicUI();
});

// Add notification styles
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #3498db;
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 10000;
        max-width: 300px;
    }

    .notification.show {
        transform: translateX(0);
    }

    .notification-success {
        border-left-color: #27ae60;
    }

    .notification-error {
        border-left-color: #e74c3c;
    }

    .notification-warning {
        border-left-color: #f39c12;
    }

    .notification-info {
        border-left-color: #3498db;
    }

    .notification i {
        font-size: 18px;
    }

    .notification-success i {
        color: #27ae60;
    }

    .notification-error i {
        color: #e74c3c;
    }

    .notification-warning i {
        color: #f39c12;
    }

    .notification-info i {
        color: #3498db;
    }

    .part-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border: 1px solid #e9ecef;
    }

    .part-card .card-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;
    }

    .part-card .card-header i {
        color: #3498db;
        font-size: 20px;
    }

    .part-card .card-header h4 {
        margin: 0;
        color: #2c3e50;
    }

    .part-card .card-content {
        display: flex;
        justify-content: space-between;
        color: #6c757d;
        font-size: 14px;
    }

    .shop-item {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border: 1px solid #e9ecef;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .item-info h4 {
        margin: 0 0 5px 0;
        color: #2c3e50;
    }

    .item-info p {
        margin: 0 0 10px 0;
        color: #6c757d;
        font-size: 14px;
    }

    .item-info .price {
        font-weight: 600;
        color: #27ae60;
        font-size: 18px;
    }

    .item-actions {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .quantity-input {
        width: 60px;
        padding: 8px;
        border: 1px solid #e9ecef;
        border-radius: 4px;
        text-align: center;
    }

    .no-parts {
        grid-column: 1 / -1;
        text-align: center;
        padding: 40px;
        color: #6c757d;
        font-size: 18px;
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);