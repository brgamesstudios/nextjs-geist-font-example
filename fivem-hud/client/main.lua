local isHudVisible = true
local lastStreet = ''
local lastZone = ''
local seatbeltOn = false
local voiceLevel = 0
local playerTalking = false
local qbStress = 0
local QBCore = nil

local Prefs = {
  MetricSpeed = Config.MetricSpeed,
  ShowCompass = Config.ShowCompass,
  ShowStreetZone = Config.ShowStreetZone,
  ShowClock = Config.ShowClock,
  ShowFuel = Config.ShowFuel,
  ShowEngine = Config.ShowEngine,
  ShowIndicators = Config.ShowIndicators,
  UseVoice = Config.UseVoice,
  UseStress = Config.UseStress,
  UseSeatbelt = Config.UseSeatbelt,
  UseMinimap = Config.UseMinimap,
}

-- Try to get QBCore if available
CreateThread(function()
  if GetResourceState('qb-core') == 'started' then
    pcall(function()
      QBCore = exports['qb-core']:GetCoreObject()
    end)
  end
end)

CreateThread(function()
  Wait(0)
  isHudVisible = Config.HudStartVisible
  SendNUIMessage({ action = 'setVisible', visible = isHudVisible })
  SendNUIMessage({
    action = 'config',
    metric = Prefs.MetricSpeed,
    showCompass = Prefs.ShowCompass,
    showStreetZone = Prefs.ShowStreetZone,
    showClock = Prefs.ShowClock,
    useVoice = Prefs.UseVoice,
    useSeatbelt = Prefs.UseSeatbelt,
    useStress = Prefs.UseStress,
    useMinimap = Prefs.UseMinimap,
    radarOnFoot = Config.RadarOnFoot,
    showSeatbelt = Prefs.UseSeatbelt,
    showIndicators = true,
    showFuel = true,
    showEngine = true
  })
end)

-- QBCore stress sync
if Config.UseStress then
  CreateThread(function()
    while true do
      if QBCore and QBCore.Functions and QBCore.Functions.GetPlayerData then
        local data = QBCore.Functions.GetPlayerData()
        if data and data.metadata and data.metadata['stress'] ~= nil then
          qbStress = tonumber(data.metadata['stress']) or 0
        end
      end
      Wait(500)
    end
  end)
end

-- Seatbelt from QBCore state bag (optional)
if Config.UseSeatbelt and Config.SeatbeltFromQB then
  CreateThread(function()
    while true do
      local state = LocalPlayer and LocalPlayer.state
      if state then
        local key = Config.SeatbeltStateKey or 'seatbelt'
        local val = state[key]
        if type(val) == 'boolean' then
          seatbeltOn = val
        end
      end
      Wait(200)
    end
  end)
end

-- /hud opens settings panel
RegisterCommand('hud', function()
  SetNuiFocus(true, true)
  SendNUIMessage({ action = 'openSettings' })
end, false)
RegisterKeyMapping('hud', 'HUD Ayarlarını Aç', 'keyboard', Config.ToggleKey or 'H')

-- Manual seatbelt fallback
RegisterCommand('seatbelt', function()
  if not (Config.UseSeatbelt and Config.SeatbeltFromQB) then
    seatbeltOn = not seatbeltOn
    SendNUIMessage({ action = 'seatbelt', on = seatbeltOn })
  end
end, false)
RegisterKeyMapping('seatbelt', 'Toggle Seatbelt', 'keyboard', 'B')

-- Voice state integration (always running; UI gated by Prefs)
CreateThread(function()
  while true do
    local playerId = PlayerId()
    playerTalking = NetworkIsPlayerTalking(playerId)
    voiceLevel = playerTalking and 1 or 0
    if Prefs.UseVoice then
      SendNUIMessage({ action = 'voice', talking = playerTalking, level = voiceLevel })
    end
    Wait(150)
  end
end)

-- pma-voice mode updates
CreateThread(function()
  if GetResourceState('pma-voice') == 'started' then
    while true do
      local mode = exports['pma-voice'] and exports['pma-voice']:getMode() or 2
      voiceLevel = mode
      playerTalking = MumbleIsPlayerTalking(PlayerId())
      if Prefs.UseVoice then
        SendNUIMessage({ action = 'voice', talking = playerTalking, level = voiceLevel })
      end
      Wait(200)
    end
  end
end)

-- Street/zone updater
CreateThread(function()
  while true do
    local ped = PlayerPedId()
    local coords = GetEntityCoords(ped)
    local streetHash = GetStreetNameAtCoord(coords.x, coords.y, coords.z)
    local streetName = GetStreetNameFromHashKey(streetHash)
    local zoneName = GetLabelText(GetNameOfZone(coords.x, coords.y, coords.z))

    if streetName ~= lastStreet or zoneName ~= lastZone then
      lastStreet = streetName
      lastZone = zoneName
      if Prefs.ShowStreetZone then
        SendNUIMessage({ action = 'street', street = streetName, zone = zoneName })
      end
    end
    Wait(Config.StreetRefreshMs or 500)
  end
end)

-- Minimap overlay thread (independent of GTA minimap)
CreateThread(function()
  while true do
    if Config.UseMinimap then
      local ped = PlayerPedId()
      local coords = GetEntityCoords(ped)
      local heading = GetEntityHeading(ped)
      
      -- Get street and zone info
      local streetHash = GetStreetNameAtCoord(coords.x, coords.y, coords.z)
      local streetName = GetStreetNameFromHashKey(streetHash)
      local zoneName = GetNameOfZone(coords.x, coords.y, coords.z)
      
      -- Send to NUI for minimap overlay
      SendNUIMessage({
        action = 'minimapUpdate',
        street = streetName,
        zone = zoneName,
        heading = heading
      })
    end
    
    Wait(Config.StreetRefreshMs)
  end
end)

-- Track vehicle state
local isInVehicle = false
local lastVehicleState = false

-- Initialize vehicle state on resource start
CreateThread(function()
  Wait(1000) -- Wait for player to fully load
  local ped = PlayerPedId()
  local initialVehicleState = IsPedInAnyVehicle(ped, false)
  isInVehicle = initialVehicleState
  lastVehicleState = initialVehicleState
  
  -- Send initial vehicle state to NUI
  SendNUIMessage({
    action = 'vehicleStateChanged',
    inVehicle = isInVehicle
  })
end)

-- Main HUD update thread
CreateThread(function()
  while true do
    local ped = PlayerPedId()
    local currentVehicleState = IsPedInAnyVehicle(ped, false)
    
    -- Check if vehicle state changed
    if currentVehicleState ~= lastVehicleState then
      isInVehicle = currentVehicleState
      lastVehicleState = currentVehicleState
      
      -- Send vehicle state change to NUI
      SendNUIMessage({
        action = 'vehicleStateChanged',
        inVehicle = isInVehicle
      })
    end
    
    if isInVehicle then
      local veh = GetVehiclePedIsIn(ped, false)
      if veh and veh ~= 0 then
        -- Vehicle data collection
        local speed = GetEntitySpeed(veh)
        local gear = GetVehicleCurrentGear(veh)
        local rpm = GetVehicleCurrentRpm(veh)
        local fuel = GetVehicleFuelLevel(veh)
        local engine = GetVehicleEngineHealth(veh)
        
        -- Convert speed to mph/kmh
        if Config.MetricSpeed then
          speed = speed * 3.6 -- m/s to km/h
        else
          speed = speed * 2.236936 -- m/s to mph
        end
        
        -- Get indicator states
        local ind = GetVehicleIndicatorLights(veh) or 0
        local indicatorLeft = (ind & 1) ~= 0
        local indicatorRight = (ind & 2) ~= 0
        
        -- Get seatbelt state
        local seatbelt = false
        if Config.UseSeatbelt then
          if Config.SeatbeltFromQB and QBCore then
            seatbelt = LocalPlayer.state[Config.SeatbeltStateKey] or false
          else
            seatbelt = seatbeltOn
          end
        end
        
        -- Send vehicle data to NUI
        SendNUIMessage({
          action = 'tick',
          speed = math.floor(speed),
          gear = gear,
          rpm = rpm,
          fuel = fuel,
          engine = engine,
          bl = indicatorLeft,
          br = indicatorRight,
          seatbelt = seatbelt
        })
      end
    else
      -- Player is not in vehicle, send empty vehicle data
      SendNUIMessage({
        action = 'tick',
        speed = 0,
        gear = 0,
        rpm = 0,
        fuel = 0,
        engine = 0,
        bl = false,
        br = false,
        seatbelt = false
      })
    end
    
    Wait(Config.TickMs)
  end
end)

-- Player stats update thread (independent of vehicle)
CreateThread(function()
  while true do
    local ped = PlayerPedId()
    
    -- Player stats
    local hp = math.floor((GetEntityHealth(ped) - 100) / (GetEntityMaxHealth(ped) - 100) * 100)
    if hp < 0 then hp = 0 end
    local armor = GetPedArmour(ped)
    if armor > 100 then armor = 100 end
    
    -- Get stress from QBCore if available
    local stress = 0
    if Config.UseStress and QBCore then
      stress = qbStress or 0
    end
    
    -- Get heading and time
    local heading = GetEntityHeading(ped)
    local hour = GetClockHours()
    local minute = GetClockMinutes()
    
    -- Send player stats to NUI
    SendNUIMessage({
      action = 'playerStats',
      hp = hp,
      armor = armor,
      stress = stress,
      heading = heading,
      hour = hour,
      minute = minute
    })
    
    Wait(Config.TickMs)
  end
end)

-- NUI callbacks
RegisterNUICallback('ready', function(_, cb)
  cb('ok')
end)

RegisterNUICallback('close', function(_, cb)
  SetNuiFocus(false, false)
  cb('ok')
end)

RegisterNUICallback('applySettings', function(data, cb)
  if type(data) ~= 'table' then cb('bad'); return end
  isHudVisible = data.visible ~= nil and data.visible or isHudVisible
  Prefs.MetricSpeed = data.metric ~= nil and data.metric or Prefs.MetricSpeed
  Prefs.ShowCompass = data.showCompass ~= nil and data.showCompass or Prefs.ShowCompass
  Prefs.ShowStreetZone = data.showStreetZone ~= nil and data.showStreetZone or Prefs.ShowStreetZone
  Prefs.UseVoice = data.useVoice ~= nil and data.useVoice or Prefs.UseVoice
  Prefs.UseStress = data.useStress ~= nil and data.useStress or Prefs.UseStress
  Prefs.UseMinimap = data.useMinimap ~= nil and data.useMinimap or Prefs.UseMinimap

  -- Reflect to UI immediately
  SendNUIMessage({ action = 'setVisible', visible = isHudVisible })
  SendNUIMessage({
    action = 'config',
    metric = Prefs.MetricSpeed,
    showCompass = Prefs.ShowCompass,
    showStreetZone = Prefs.ShowStreetZone,
    showClock = Prefs.ShowClock,
    useVoice = Prefs.UseVoice,
    useSeatbelt = Prefs.UseSeatbelt,
    useStress = Prefs.UseStress,
    useMinimap = Prefs.UseMinimap,
    radarOnFoot = Config.RadarOnFoot,
    showSeatbelt = Prefs.UseSeatbelt,
    showIndicators = true,
    showFuel = true,
    showEngine = true
  })

  -- Notify minimap controller
  TriggerEvent('fivem-hud:applyPrefs', {
    useMinimap = Prefs.UseMinimap,
    circleMinimap = data.circleMinimap,
    radarOnFoot = data.radarOnFoot,
    radarAlwaysOn = Config.RadarAlwaysOn,
    radarZoom = Config.RadarZoom,
    minimapScale = Config.MinimapScale,
  })

  cb('ok')
end)

-- Wallet updates from server (QBCore)
RegisterNetEvent('fivem-hud:wallet', function(data)
  if type(data) ~= 'table' then return end
  SendNUIMessage({ action = 'wallet', playerId = data.id, cash = data.cash, bank = data.bank })
end)