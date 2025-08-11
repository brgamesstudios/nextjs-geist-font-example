// JG Scripts Style HUD JavaScript

// Element references
const hud = document.getElementById('hud');
const settings = document.getElementById('settings');

// Top section elements
const compass = document.getElementById('compass');
const street = document.getElementById('street');
const voice = document.getElementById('voice');

// Top right elements
const playerId = document.getElementById('playerId');
const cash = document.getElementById('cash');
const bank = document.getElementById('bank');
const clock = document.getElementById('clock');

// Minimap elements
const minimapOverlay = document.getElementById('minimapOverlay');
const northIndicator = document.getElementById('northIndicator');
const minimapStreet = document.getElementById('minimapStreet');
const minimapZone = document.getElementById('minimapZone');

// Mini rings elements
const miniHp = document.getElementById('miniHp');
const miniArmor = document.getElementById('miniArmor');
const miniHunger = document.getElementById('miniHunger');
const miniThirst = document.getElementById('miniThirst');

// Large rings elements
const hp = document.getElementById('hp');
const armor = document.getElementById('armor');
const hunger = document.getElementById('hunger');
const thirst = document.getElementById('thirst');

// Speedometer elements
const speedo = document.getElementById('speedo');
const speed = document.getElementById('speed');
const gear = document.getElementById('gear');
const fuelFill = document.getElementById('fuelFill');
const fuelText = document.getElementById('fuelText');
const engineFill = document.getElementById('engineFill');
const engineText = document.getElementById('engineText');
const speedArc = document.getElementById('speedArc');

// Vehicle status elements
const seatbeltStatus = document.getElementById('seatbeltStatusBelow');
const stressStatus = document.getElementById('stressStatusBelow');
const stressValue = document.getElementById('stressValueBelow');
const leftIndicator = document.getElementById('leftIndicatorBelow');
const rightIndicator = document.getElementById('rightIndicatorBelow');
const leftIndicatorLight = document.getElementById('leftIndicatorBelow').querySelector('.indicator-light-below.left');
const rightIndicatorLight = document.getElementById('rightIndicatorBelow').querySelector('.indicator-light-below.right');
const vehicleStatusBelow = document.getElementById('vehicleStatusBelow');

// Settings elements
const showClock = document.getElementById('showClock');
const showCompass = document.getElementById('showCompass');
const showStreet = document.getElementById('showStreet');
const showVoice = document.getElementById('showVoice');
const showMinimap = document.getElementById('showMinimap');
const showRings = document.getElementById('showRings');
const showSpeedo = document.getElementById('showSpeedo');
const showFuel = document.getElementById('showFuel');
const showEngine = document.getElementById('showEngine');
const showSeatbelt = document.getElementById('showSeatbelt');
const showIndicators = document.getElementById('showIndicators');
const radarOnFoot = document.getElementById('radarOnFoot');

// Buttons
const closeSettings = document.getElementById('closeSettings');
const saveSettings = document.getElementById('saveSettings');

// Current preferences
let currentPrefs = {
    showClock: true,
    showCompass: true,
    showStreet: true,
    showVoice: true,
    showMinimap: true,
    showRings: true,
    showSpeedo: true,
    showFuel: true,
    showEngine: true,
    showSeatbelt: true,
    showIndicators: true,
    radarOnFoot: false
};

// Initialize HUD
function initHUD() {
    hud.style.display = 'block';
    settings.style.display = 'none';
    updateVisibility();
}

// Update element visibility based on preferences
function updateVisibility() {
    clock.style.display = currentPrefs.showClock ? 'block' : 'none';
    compass.style.display = currentPrefs.showCompass ? 'block' : 'none';
    street.style.display = currentPrefs.showStreet ? 'block' : 'none';
    voice.style.display = currentPrefs.showVoice ? 'block' : 'none';
    minimapOverlay.style.display = currentPrefs.showMinimap ? 'block' : 'none';
    
    const miniRings = document.querySelector('.mini-rings');
    const largeRings = document.querySelector('.rings');
    miniRings.style.display = currentPrefs.showRings ? 'flex' : 'none';
    largeRings.style.display = currentPrefs.showRings ? 'flex' : 'none';
    
    if (currentPrefs.showSpeedo) {
        speedo.style.display = 'block';
        vehicleStatusBelow.style.display = 'block';
    } else {
        speedo.style.display = 'none';
        vehicleStatusBelow.style.display = 'none';
    }
    
    const fuelIndicator = document.querySelector('.speedo-fuel');
    const engineIndicator = document.querySelector('.speedo-engine');
    fuelIndicator.style.display = currentPrefs.showFuel ? 'flex' : 'none';
    engineIndicator.style.display = currentPrefs.showEngine ? 'flex' : 'none';
    
    if (currentPrefs.showSeatbelt || currentPrefs.showIndicators) {
        vehicleStatusBelow.style.display = 'flex';
    }
}

// Update vehicle status indicators
function updateVehicleStatus(data) {
    // Seatbelt status
    if (data.seatbelt) {
        seatbeltStatus.classList.add('active');
        seatbeltStatus.classList.remove('inactive');
    } else {
        seatbeltStatus.classList.add('inactive');
        seatbeltStatus.classList.remove('active');
    }

    // Stress status
    const stressLevel = data.stress || 0;
    stressValue.textContent = stressLevel + '%';
    
    if (stressLevel < 30) {
        stressStatus.className = 'status-item-below low';
    } else if (stressLevel < 70) {
        stressStatus.className = 'status-item-below medium';
    } else {
        stressStatus.className = 'status-item-below high';
    }

    // Indicator lights
    if (data.bl) {
        leftIndicatorLight.classList.add('active');
    } else {
        leftIndicatorLight.classList.remove('active');
    }

    if (data.br) {
        rightIndicatorLight.classList.add('active');
    } else {
        rightIndicatorLight.classList.remove('active');
    }
}

// Update speedometer
function updateSpeedometer(data) {
    if (!data.inVehicle) return;
    
    const speedValue = Math.round(data.speed * 3.6); // Convert to km/h
    speed.textContent = speedValue;
    
    // Update speed arc
    const maxSpeed = 200; // Max speed for arc calculation
    const percentage = Math.min(speedValue / maxSpeed, 1);
    const circumference = 2 * Math.PI * 50; // r=50
    const offset = circumference - (percentage * circumference);
    speedArc.style.strokeDashoffset = offset;
    
    // Update gear
    gear.textContent = data.gear || 'N';
    
    // Update fuel
    if (data.fuel !== undefined) {
        const fuelPercentage = Math.max(0, Math.min(100, data.fuel));
        fuelFill.style.height = fuelPercentage + '%';
        fuelText.textContent = Math.round(fuelPercentage) + '%';
    }
    
    // Update engine
    if (data.engine !== undefined) {
        const enginePercentage = Math.max(0, Math.min(100, data.engine));
        engineFill.style.height = enginePercentage + '%';
        engineText.textContent = Math.round(enginePercentage) + '%';
    }
}

// Update player stats
function updatePlayerStats(data) {
    // Update mini rings
    if (miniHp) miniHp.textContent = Math.round(data.hp || 100);
    if (miniArmor) miniArmor.textContent = Math.round(data.armor || 0);
    if (miniHunger) miniHunger.textContent = Math.round(data.hunger || 100);
    if (miniThirst) miniThirst.textContent = Math.round(data.thirst || 100);
    
    // Update large rings
    if (hp) hp.textContent = Math.round(data.hp || 100);
    if (armor) armor.textContent = Math.round(data.armor || 0);
    if (hunger) hunger.textContent = Math.round(data.hunger || 100);
    if (thirst) thirst.textContent = Math.round(data.thirst || 100);
}

// Update minimap
function updateMinimap(data) {
    if (northIndicator) {
        const heading = data.heading || 0;
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(heading / 45) % 8;
        northIndicator.textContent = directions[index];
    }
    
    if (minimapStreet) minimapStreet.textContent = data.street || 'Unknown Street';
    if (minimapZone) minimapZone.textContent = data.zone || 'Unknown Zone';
}

// Update wallet info
function updateWallet(data) {
    if (playerId) playerId.textContent = 'ID: ' + (data.id || 0);
    if (cash) cash.textContent = '$' + (data.cash || 0).toLocaleString();
    if (bank) bank.textContent = '$' + (data.bank || 0).toLocaleString();
}

// Update clock
function updateClock(data) {
    if (clock) {
        const hour = String(data.hour || 0).padStart(2, '0');
        const minute = String(data.minute || 0).padStart(2, '0');
        clock.textContent = `${hour}:${minute}`;
    }
}

// Update voice indicator
function updateVoice(data) {
    if (voice) {
        if (data.talking) {
            voice.classList.add('talking');
        } else {
            voice.classList.remove('talking');
        }
    }
}

// Settings panel functions
function openSettings() {
    settings.style.display = 'flex';
    loadSettingsToUI();
}

function closeSettings() {
    settings.style.display = 'none';
}

function loadSettingsToUI() {
    showClock.checked = currentPrefs.showClock;
    showCompass.checked = currentPrefs.showCompass;
    showStreet.checked = currentPrefs.showStreet;
    showVoice.checked = currentPrefs.showVoice;
    showMinimap.checked = currentPrefs.showMinimap;
    showRings.checked = currentPrefs.showRings;
    showSpeedo.checked = currentPrefs.showSpeedo;
    showFuel.checked = currentPrefs.showFuel;
    showEngine.checked = currentPrefs.showEngine;
    showSeatbelt.checked = currentPrefs.showSeatbelt;
    showIndicators.checked = currentPrefs.showIndicators;
    radarOnFoot.checked = currentPrefs.radarOnFoot;
}

function saveSettings() {
    currentPrefs.showClock = showClock.checked;
    currentPrefs.showCompass = showCompass.checked;
    currentPrefs.showStreet = showStreet.checked;
    currentPrefs.showVoice = showVoice.checked;
    currentPrefs.showMinimap = showMinimap.checked;
    currentPrefs.showRings = showRings.checked;
    currentPrefs.showSpeedo = showSpeedo.checked;
    currentPrefs.showFuel = showFuel.checked;
    currentPrefs.showEngine = showEngine.checked;
    currentPrefs.showSeatbelt = showSeatbelt.checked;
    currentPrefs.showIndicators = showIndicators.checked;
    currentPrefs.radarOnFoot = radarOnFoot.checked;
    
    updateVisibility();
    closeSettings();
    
    // Send settings to Lua
    fetch(`https://${GetParentResourceName()}/saveSettings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentPrefs)
    });
}

// Event listeners
closeSettings.addEventListener('click', closeSettings);
saveSettings.addEventListener('click', saveSettings);

// NUI message handler
window.addEventListener('message', (e) => {
    const data = e.data;
    
    switch (data.action) {
        case 'show':
            hud.style.display = data.show ? 'block' : 'none';
            break;
            
        case 'config':
            currentPrefs = { ...currentPrefs, ...data };
            updateVisibility();
            break;
            
        case 'vehicleStateChanged':
            if (data.inVehicle) {
                speedo.style.display = 'flex';
                vehicleStatusBelow.style.display = 'flex';
            } else {
                speedo.style.display = 'none';
                vehicleStatusBelow.style.display = 'none';
            }
            break;
            
        case 'tick':
            updateSpeedometer(data);
            updateVehicleStatus(data);
            break;
            
        case 'playerStats':
            updatePlayerStats(data);
            break;
            
        case 'minimapUpdate':
            updateMinimap(data);
            break;
            
        case 'wallet':
            updateWallet(data);
            break;
            
        case 'clock':
            updateClock(data);
            break;
            
        case 'voice':
            updateVoice(data);
            break;
            
        case 'openSettings':
            openSettings();
            break;
    }
});

// Initialize HUD
document.addEventListener('DOMContentLoaded', initHUD);

// Close settings on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settings.style.display === 'flex') {
        closeSettings();
    }
});