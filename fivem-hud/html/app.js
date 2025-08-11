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
const closeSettingsBtn = document.getElementById('closeSettings');
const saveSettingsBtn = document.getElementById('saveSettings');

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
    console.log('Initializing HUD...');
    
    // Ensure all elements are loaded
    if (!hud || !settings) {
        console.error('HUD elements not found');
        return;
    }
    
    console.log('HUD elements found, setting display...');
    hud.style.display = 'block';
    settings.style.display = 'none';
    
    console.log('Updating visibility...');
    updateVisibility();
    
    // Add event listeners after DOM is ready
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', closeSettings);
        console.log('Close button event listener added');
    }
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
        console.log('Save button event listener added');
    }
    
    console.log('HUD initialized successfully');
    console.log('Element references:', JSON.stringify({
        hud: !!hud,
        settings: !!settings,
        closeSettingsBtn: !!closeSettingsBtn,
        saveSettingsBtn: !!saveSettingsBtn
    }, null, 2));
    console.log('Speedometer elements:', JSON.stringify({
        speedo: !!speedo,
        speed: !!speed,
        speedArc: !!speedArc,
        gear: !!gear,
        fuelFill: !!fuelFill,
        fuelText: !!fuelText,
        engineFill: !!engineFill,
        engineText: !!engineText
    }, null, 2));
}

// Update element visibility based on preferences
function updateVisibility() {
    console.log('Updating visibility with prefs:', JSON.stringify(currentPrefs, null, 2));
    
    if (clock) clock.style.display = currentPrefs.showClock ? 'block' : 'none';
    if (compass) compass.style.display = currentPrefs.showCompass ? 'block' : 'none';
    if (street) street.style.display = currentPrefs.showStreet ? 'block' : 'none';
    if (voice) voice.style.display = currentPrefs.showVoice ? 'block' : 'none';
    if (minimapOverlay) minimapOverlay.style.display = currentPrefs.showMinimap ? 'block' : 'none';
    
    const miniRings = document.querySelector('.mini-rings');
    const largeRings = document.querySelector('.rings');
    if (miniRings) miniRings.style.display = currentPrefs.showRings ? 'flex' : 'none';
    if (largeRings) largeRings.style.display = currentPrefs.showRings ? 'flex' : 'none';
    
    if (currentPrefs.showSpeedo) {
        if (speedo) speedo.style.display = 'block';
        if (vehicleStatusBelow) vehicleStatusBelow.style.display = 'block';
    } else {
        if (speedo) speedo.style.display = 'none';
        if (vehicleStatusBelow) vehicleStatusBelow.style.display = 'none';
    }
    
    const fuelIndicator = document.querySelector('.speedo-fuel');
    const engineIndicator = document.querySelector('.speedo-engine');
    if (fuelIndicator) fuelIndicator.style.display = currentPrefs.showFuel ? 'flex' : 'none';
    if (engineIndicator) engineIndicator.style.display = currentPrefs.showEngine ? 'flex' : 'none';
    
    if (currentPrefs.showSeatbelt || currentPrefs.showIndicators) {
        if (vehicleStatusBelow) vehicleStatusBelow.style.display = 'flex';
    }
    
    console.log('Visibility update completed');
}

// Update vehicle status indicators
function updateVehicleStatus(data) {
    console.log('Updating vehicle status:', JSON.stringify(data, null, 2));
    
    if (!seatbeltStatus || !stressStatus || !stressValue || !leftIndicatorLight || !rightIndicatorLight) {
        console.log('Vehicle status elements not found');
        return;
    }
    
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
    // Check if player is in vehicle (either from inVehicle flag or from vehicle data)
    const isInVehicle = data.inVehicle !== undefined ? data.inVehicle : (data.gear > 0 || data.fuel > 0 || data.engine > 0);
    if (!isInVehicle) return;
    
    console.log('Updating speedometer:', JSON.stringify(data, null, 2));
    console.log('Speedometer elements check:', {
        speed: !!speed,
        speedArc: !!speedArc,
        gear: !!gear,
        fuelFill: !!fuelFill,
        fuelText: !!fuelText,
        engineFill: !!engineFill,
        engineText: !!engineText
    });
    
    if (!speed || !speedArc || !gear || !fuelFill || !fuelText || !engineFill || !engineText) {
        console.log('Speedometer elements not found');
        return;
    }
    
    const speedValue = Math.round(data.speed * 3.6); // Convert to km/h
    console.log('Speed value:', speedValue, 'km/h');
    speed.textContent = speedValue;
    
    // Update speed arc
    const maxSpeed = 200; // Max speed for arc calculation
    const percentage = Math.min(speedValue / maxSpeed, 1);
    const circumference = 2 * Math.PI * 50; // r=50
    const offset = circumference - (percentage * circumference);
    console.log('Speed arc update:', { percentage, circumference, offset });
    speedArc.style.strokeDashoffset = offset;
    
    // Update gear
    gear.textContent = data.gear || 'N';
    console.log('Gear updated:', data.gear || 'N');
    
    // Update fuel
    if (data.fuel !== undefined) {
        const fuelPercentage = Math.max(0, Math.min(100, data.fuel));
        fuelFill.style.height = fuelPercentage + '%';
        fuelText.textContent = Math.round(fuelPercentage) + '%';
        console.log('Fuel updated:', fuelPercentage + '%');
    }
    
    // Update engine
    if (data.engine !== undefined) {
        // Normalize engine health: if > 100, assume it's 0-1000 scale and convert to 0-100
        let engineValue = data.engine;
        if (engineValue > 100) {
            engineValue = engineValue / 10; // Convert 0-1000 to 0-100
        }
        const enginePercentage = Math.max(0, Math.min(100, engineValue));
        engineFill.style.height = enginePercentage + '%';
        engineText.textContent = Math.round(enginePercentage) + '%';
        console.log('Engine updated:', enginePercentage + '%', 'from raw value:', data.engine);
    }
}

// Update player stats
function updatePlayerStats(data) {
    console.log('Updating player stats:', JSON.stringify(data, null, 2));
    
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
    console.log('Updating minimap:', JSON.stringify(data, null, 2));
    
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
    console.log('Updating wallet:', JSON.stringify(data, null, 2));
    
    if (playerId) playerId.textContent = 'ID: ' + (data.id || 0);
    if (cash) cash.textContent = '$' + (data.bank || 0).toLocaleString();
    if (bank) bank.textContent = '$' + (data.bank || 0).toLocaleString();
}

// Update clock
function updateClock(data) {
    console.log('Updating clock:', JSON.stringify(data, null, 2));
    
    if (clock) {
        const hour = String(data.hour || 0).padStart(2, '0');
        const minute = String(data.minute || 0).padStart(2, '0');
        clock.textContent = `${hour}:${minute}`;
    }
}

// Update voice indicator
function updateVoice(data) {
    console.log('Updating voice:', JSON.stringify(data, null, 2));
    
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
    if (settings) {
        settings.style.display = 'flex';
        loadSettingsToUI();
    }
}

function closeSettings() {
    if (settings) {
        settings.style.display = 'none';
    }
}

function loadSettingsToUI() {
    if (showClock) showClock.checked = currentPrefs.showClock;
    if (showCompass) showCompass.checked = currentPrefs.showCompass;
    if (showStreet) showStreet.checked = currentPrefs.showStreet;
    if (showVoice) showVoice.checked = currentPrefs.showVoice;
    if (showMinimap) showMinimap.checked = currentPrefs.showMinimap;
    if (showRings) showRings.checked = currentPrefs.showRings;
    if (showSpeedo) showSpeedo.checked = currentPrefs.showSpeedo;
    if (showFuel) showFuel.checked = currentPrefs.showFuel;
    if (showEngine) showEngine.checked = currentPrefs.showEngine;
    if (showSeatbelt) showSeatbelt.checked = currentPrefs.showSeatbelt;
    if (showIndicators) showIndicators.checked = currentPrefs.showIndicators;
    if (radarOnFoot) radarOnFoot.checked = currentPrefs.radarOnFoot;
}

function saveSettings() {
    if (showClock) currentPrefs.showClock = showClock.checked;
    if (showCompass) currentPrefs.showCompass = showCompass.checked;
    if (showStreet) currentPrefs.showStreet = showStreet.checked;
    if (showVoice) currentPrefs.showVoice = showVoice.checked;
    if (showMinimap) currentPrefs.showMinimap = showMinimap.checked;
    if (showRings) currentPrefs.showRings = showRings.checked;
    if (showSpeedo) currentPrefs.showSpeedo = showSpeedo.checked;
    if (showFuel) currentPrefs.showFuel = showFuel.checked;
    if (showEngine) currentPrefs.showEngine = showEngine.checked;
    if (showSeatbelt) currentPrefs.showSeatbelt = showSeatbelt.checked;
    if (showIndicators) currentPrefs.showIndicators = showIndicators.checked;
    if (radarOnFoot) currentPrefs.radarOnFoot = radarOnFoot.checked;
    
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



// NUI message handler
window.addEventListener('message', (e) => {
    const data = e.data;
    console.log('NUI Message received:', data.action, JSON.stringify(data, null, 2));
    
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
            
        default:
            console.log('Unknown action:', data.action);
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