local isHudVisible = true
local lastStreet = ''
local lastZone = ''
local seatbeltOn = false
local voiceLevel = 0
local playerTalking = false
local qbStress = 0
local QBCore = nil

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
    metric = Config.MetricSpeed,
    speedWarn = Config.SpeedWarn,
    speedDanger = Config.SpeedDanger,
    showCompass = Config.ShowCompass,
    showStreetZone = Config.ShowStreetZone,
    useVoice = Config.UseVoice,
    useSeatbelt = Config.UseSeatbelt,
    useStress = Config.UseStress,
    useMinimap = Config.UseMinimap
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

-- Toggle command and key mapping (fallback if no QB state)
RegisterCommand('hud', function()
  isHudVisible = not isHudVisible
  SendNUIMessage({ action = 'setVisible', visible = isHudVisible })
end, false)
RegisterKeyMapping('hud', 'Toggle HUD', 'keyboard', Config.ToggleKey or 'H')

RegisterCommand('seatbelt', function()
  if not (Config.UseSeatbelt and Config.SeatbeltFromQB) then
    seatbeltOn = not seatbeltOn
    SendNUIMessage({ action = 'seatbelt', on = seatbeltOn })
  end
end, false)
RegisterKeyMapping('seatbelt', 'Toggle Seatbelt', 'keyboard', 'B')

-- Voice state integration (basic fallback)
if Config.UseVoice then
  CreateThread(function()
    while true do
      local playerId = PlayerId()
      playerTalking = NetworkIsPlayerTalking(playerId)
      voiceLevel = playerTalking and 1 or 0
      SendNUIMessage({ action = 'voice', talking = playerTalking, level = voiceLevel })
      Wait(150)
    end
  end)

  -- Support for pma-voice exports if present
  CreateThread(function()
    if GetResourceState('pma-voice') == 'started' then
      while true do
        local mode = exports['pma-voice'] and exports['pma-voice']:getMode() or 2
        voiceLevel = mode -- 1..3
        playerTalking = MumbleIsPlayerTalking(PlayerId())
        SendNUIMessage({ action = 'voice', talking = playerTalking, level = voiceLevel })
        Wait(200)
      end
    end
  end)
end

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
      if Config.ShowStreetZone then
        SendNUIMessage({ action = 'street', street = streetName, zone = zoneName })
      end
    end
    Wait(Config.StreetRefreshMs or 500)
  end
end)

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
      if inVehicle then
        local veh = GetVehiclePedIsIn(ped, false)
        local speedMs = GetEntitySpeed(veh) -- m/s
        if Config.MetricSpeed then
          speed = math.floor(speedMs * 3.6 + 0.5)
        else
          speed = math.floor(speedMs * 2.236936 + 0.5)
        end
        gear = GetVehicleCurrentGear(veh) or 0
        rpm = GetVehicleCurrentRpm(veh) or 0
      end

      local heading = GetEntityHeading(ped)

      SendNUIMessage({
        action = 'tick',
        hp = hp,
        armor = armor,
        stress = Config.UseStress and qbStress or 0,
        inVehicle = inVehicle,
        speed = speed,
        gear = gear,
        rpm = rpm,
        heading = heading,
        seatbelt = seatbeltOn
      })
    end
    Wait(Config.TickMs or 100)
  end
end)

RegisterNUICallback('ready', function(_, cb)
  cb('ok')
end)