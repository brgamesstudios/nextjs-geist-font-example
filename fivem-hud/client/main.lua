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
    speedWarn = Config.SpeedWarn,
    speedDanger = Config.SpeedDanger,
    showCompass = Prefs.ShowCompass,
    showStreetZone = Prefs.ShowStreetZone,
    showClock = Prefs.ShowClock,
    showFuel = Prefs.ShowFuel,
    showEngine = Prefs.ShowEngine,
    showIndicators = Prefs.ShowIndicators,
    useVoice = Prefs.UseVoice,
    useSeatbelt = Prefs.UseSeatbelt,
    useStress = Prefs.UseStress,
    useMinimap = Prefs.UseMinimap
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

local function getVehicleFuelLevel(veh)
  if QBCore and GetResourceState('qb-fuel') == 'started' then
    if exports['qb-fuel'] and exports['qb-fuel'].GetFuel then
      local ok, val = pcall(function() return exports['qb-fuel']:GetFuel(veh) end)
      if ok and type(val) == 'number' then return val end
    end
  end
  -- fallback to native if present
  if DoesEntityExist(veh) then
    local level = GetVehicleFuelLevel(veh)
    if type(level) == 'number' then return level end
  end
  return 0
end

-- Main HUD tick
CreateThread(function()
  while true do
    if isHudVisible then
      local ped = PlayerPedId()
      local hp = math.floor((GetEntityHealth(ped) - 100) / (GetEntityMaxHealth(ped) - 100) * 100)
      if hp < 0 then hp = 0 end
      local armor = GetPedArmour(ped)
      if armor > 100 then armor = 100 end

      local inVehicle = IsPedInAnyVehicle(ped, false)
      local speed = 0
      local gear = 0
      local rpm = 0
      local fuel = 0
      local engineHealth = 0
      local indicatorLeft = false
      local indicatorRight = false

      if inVehicle then
        local veh = GetVehiclePedIsIn(ped, false)
        local speedMs = GetEntitySpeed(veh)
        if Prefs.MetricSpeed then
          speed = math.floor(speedMs * 3.6 + 0.5)
        else
          speed = math.floor(speedMs * 2.236936 + 0.5)
        end
        gear = GetVehicleCurrentGear(veh) or 0
        rpm = GetVehicleCurrentRpm(veh) or 0

        if Prefs.ShowFuel then
          fuel = math.floor(getVehicleFuelLevel(veh) + 0.5)
          if fuel < 0 then fuel = 0 elseif fuel > 100 then fuel = 100 end
        end
        if Prefs.ShowEngine then
          engineHealth = math.floor((GetVehicleEngineHealth(veh) or 0) / 10)
          engineHealth = math.max(0, math.min(1000, engineHealth))
          engineHealth = math.floor(engineHealth / 10)
        end
        if Prefs.ShowIndicators then
          local ind = GetVehicleIndicatorLights(veh) or 0
          indicatorLeft = (ind & 1) ~= 0
          indicatorRight = (ind & 2) ~= 0
        end
      end

      local heading = GetEntityHeading(ped)
      local hour = 0
      local minute = 0
      if Prefs.ShowClock then
        hour, minute = GetClockHours(), GetClockMinutes()
      end

      SendNUIMessage({
        action = 'tick',
        hp = hp,
        armor = armor,
        stress = (Prefs.UseStress and qbStress or 0),
        inVehicle = inVehicle,
        speed = speed,
        gear = gear,
        rpm = rpm,
        heading = heading,
        seatbelt = seatbeltOn,
        fuel = fuel,
        engine = engineHealth,
        bl = indicatorLeft,
        br = indicatorRight,
        hour = hour,
        minute = minute
      })
    end
    Wait(Config.TickMs or 100)
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
    speedWarn = Config.SpeedWarn,
    speedDanger = Config.SpeedDanger,
    showCompass = Prefs.ShowCompass,
    showStreetZone = Prefs.ShowStreetZone,
    showClock = Prefs.ShowClock,
    showFuel = Prefs.ShowFuel,
    showEngine = Prefs.ShowEngine,
    showIndicators = Prefs.ShowIndicators,
    useVoice = Prefs.UseVoice,
    useSeatbelt = Prefs.UseSeatbelt,
    useStress = Prefs.UseStress,
    useMinimap = Prefs.UseMinimap
  })

  -- Notify minimap controller
  TriggerEvent('fivem-hud:applyPrefs', {
    useMinimap = Prefs.UseMinimap,
    circleMinimap = data.circleMinimap,
    radarOnFoot = data.radarOnFoot,
    radarAlwaysOn = Config.RadarAlwaysOn,
    radarZoom = Config.RadarZoom,
  })

  cb('ok')
end)