local isHudVisible = true
local lastStreet = ''
local lastZone = ''
local seatbeltOn = false
local voiceLevel = 0
local playerTalking = false

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
    useSeatbelt = Config.UseSeatbelt
  })
end)

-- Toggle command and key mapping
RegisterCommand('hud', function()
  isHudVisible = not isHudVisible
  SendNUIMessage({ action = 'setVisible', visible = isHudVisible })
end, false)
RegisterKeyMapping('hud', 'Toggle HUD', 'keyboard', Config.ToggleKey or 'H')

-- Seatbelt toggle
RegisterCommand('seatbelt', function()
  seatbeltOn = not seatbeltOn
  SendNUIMessage({ action = 'seatbelt', on = seatbeltOn })
end, false)
RegisterKeyMapping('seatbelt', 'Toggle Seatbelt', 'keyboard', 'B')

-- Voice state integration (basic fallback)
if Config.UseVoice then
  CreateThread(function()
    while true do
      local playerId = PlayerId()
      playerTalking = NetworkIsPlayerTalking(playerId)
      -- 0=whisper,1=normal,2=shout if using basic Mumble ranges; real voice resources can fire exports/events
      -- Keep a placeholder level for UI coloring
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
      local player = PlayerId()
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

      local heading = GetEntityHeading(ped) -- 0-360

      SendNUIMessage({
        action = 'tick',
        hp = hp,
        armor = armor,
        stress = 0, -- wire with your framework if needed
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

-- NUI focus not required, but provide callbacks if needed
RegisterNUICallback('ready', function(_, cb)
  cb('ok')
end)