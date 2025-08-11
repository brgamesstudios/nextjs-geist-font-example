local RESOURCE_NAME = GetCurrentResourceName()

local isUiOpen = false
local cachedVehicle = 0

local QBCore = nil
CreateThread(function()
    if Config.Framework and Config.Framework.UseQBCore then
        pcall(function()
            QBCore = exports['qb-core']:GetCoreObject()
        end)
    end
end)

local function notify(message, msgType)
    if QBCore and QBCore.Functions and QBCore.Functions.Notify then
        QBCore.Functions.Notify(message, msgType or 'primary')
    else
        -- basic fallback
        BeginTextCommandThefeedPost('STRING')
        AddTextComponentSubstringPlayerName(message)
        EndTextCommandThefeedPostTicker(false, false)
    end
end

local function requestControlOfEntity(entity)
    if not DoesEntityExist(entity) then return false end
    local attempts = 0
    while not NetworkHasControlOfEntity(entity) and attempts < 50 do
        NetworkRequestControlOfEntity(entity)
        attempts = attempts + 1
        Wait(50)
    end
    return NetworkHasControlOfEntity(entity)
end

local function getTargetVehicle()
    local ped = PlayerPedId()
    local vehicle = GetVehiclePedIsIn(ped, false)
    if vehicle ~= 0 then return vehicle end

    -- find closest vehicle around ped
    local pedCoords = GetEntityCoords(ped)
    local handle, veh = FindFirstVehicle()
    local success
    local closestVeh = 0
    local closestDist = 9999.0
    repeat
        if veh ~= 0 and DoesEntityExist(veh) then
            local dist = #(GetEntityCoords(veh) - pedCoords)
            if dist < closestDist then
                closestDist = dist
                closestVeh = veh
            end
        end
        success, veh = FindNextVehicle(handle)
    until not success
    EndFindVehicle(handle)

    if closestVeh ~= 0 and closestDist <= (Config.MaxVehicleDistance or 5.0) then
        return closestVeh
    end

    return 0
end

local function collectVehicleData(vehicle)
    if vehicle == 0 then return {} end

    local data = {}

    -- Colors
    local primary, secondary = GetVehicleColours(vehicle)
    local pearlescent, wheelColor = GetVehicleExtraColours(vehicle)
    data.colors = {
        primary = primary,
        secondary = secondary,
        pearlescent = pearlescent,
        wheel = wheelColor
    }

    -- Extras
    data.extras = {}
    for extraId = 0, 20 do
        if DoesExtraExist(vehicle, extraId) then
            data.extras[#data.extras + 1] = {
                id = extraId,
                enabled = IsVehicleExtraTurnedOn(vehicle, extraId)
            }
        end
    end

    -- Basic mod options (counts)
    data.mods = {}
    for modType = 0, 16 do
        local count = GetNumVehicleMods(vehicle, modType)
        if count and count > 0 then
            data.mods[#data.mods + 1] = {
                type = modType,
                count = count,
                current = GetVehicleMod(vehicle, modType)
            }
        end
    end

    -- Turbo toggle
    data.turbo = IsToggleModOn(vehicle, 18)

    return data
end

local function openUi()
    if isUiOpen then return end

    local vehicle = getTargetVehicle()
    if vehicle == 0 then
        Wait(50)
        return
    end

    cachedVehicle = vehicle

    SetVehicleModKit(vehicle, 0)

    local payload = {
        action = 'open',
        vehicle = collectVehicleData(vehicle)
    }

    SendNUIMessage(payload)
    SetNuiFocus(true, true)
    isUiOpen = true
end

local function closeUi()
    if not isUiOpen then return end
    SendNUIMessage({ action = 'close' })
    SetNuiFocus(false, false)
    isUiOpen = false
    cachedVehicle = 0
end

RegisterNetEvent('fmu:client:open', function()
    openUi()
end)

RegisterCommand('mekanik', function()
    TriggerServerEvent('fmu:server:requestOpen')
end)

RegisterCommand('mechanicui', function()
    TriggerServerEvent('fmu:server:requestOpen')
end)

-- Key mapping
CreateThread(function()
    RegisterCommand((Config.KeyMappingCommand or 'open_mechanic_ui'), function()
        TriggerServerEvent('fmu:server:requestOpen')
    end, false)
    RegisterKeyMapping((Config.KeyMappingCommand or 'open_mechanic_ui'), (Config.KeyMappingLabel or 'Open Mechanic UI'), 'keyboard', (Config.KeyMappingDefault or 'F6'))
end)

-- NUI callbacks
RegisterNUICallback('close', function(_, cb)
    closeUi()
    cb({ ok = true })
end)

RegisterNUICallback('repair', function(_, cb)
    local vehicle = cachedVehicle ~= 0 and cachedVehicle or getTargetVehicle()
    if vehicle == 0 then cb({ ok = false }) return end

    if requestControlOfEntity(vehicle) then
        SetVehicleFixed(vehicle)
        SetVehicleDirtLevel(vehicle, 0.0)
        SetVehicleEngineHealth(vehicle, 1000.0)
        SetVehicleBodyHealth(vehicle, 1000.0)
    end
    cb({ ok = true })
end)

RegisterNUICallback('clean', function(_, cb)
    local vehicle = cachedVehicle ~= 0 and cachedVehicle or getTargetVehicle()
    if vehicle == 0 then cb({ ok = false }) return end

    if requestControlOfEntity(vehicle) then
        SetVehicleDirtLevel(vehicle, 0.0)
    end
    cb({ ok = true })
end)

RegisterNUICallback('maxperf', function(_, cb)
    local vehicle = cachedVehicle ~= 0 and cachedVehicle or getTargetVehicle()
    if vehicle == 0 then cb({ ok = false }) return end

    if requestControlOfEntity(vehicle) then
        SetVehicleModKit(vehicle, 0)
        local performanceMods = {11, 12, 13, 15, 16}
        for _, modType in ipairs(performanceMods) do
            local count = GetNumVehicleMods(vehicle, modType)
            if count and count > 0 then
                SetVehicleMod(vehicle, modType, count - 1, false)
            end
        end
        ToggleVehicleMod(vehicle, 18, true) -- turbo on
    end
    cb({ ok = true })
end)

RegisterNUICallback('stock', function(_, cb)
    local vehicle = cachedVehicle ~= 0 and cachedVehicle or getTargetVehicle()
    if vehicle == 0 then cb({ ok = false }) return end

    if requestControlOfEntity(vehicle) then
        SetVehicleModKit(vehicle, 0)
        local performanceMods = {11, 12, 13, 15, 16}
        for _, modType in ipairs(performanceMods) do
            SetVehicleMod(vehicle, modType, -1, false)
        end
        ToggleVehicleMod(vehicle, 18, false) -- turbo off
    end
    cb({ ok = true })
end)

RegisterNUICallback('setColor', function(body, cb)
    local vehicle = cachedVehicle ~= 0 and cachedVehicle or getTargetVehicle()
    if vehicle == 0 then cb({ ok = false }) return end

    local primary = tonumber(body.primary) or 0
    local secondary = tonumber(body.secondary) or 0
    local pearlescent = tonumber(body.pearlescent) or 0
    local wheel = tonumber(body.wheel) or 0

    if requestControlOfEntity(vehicle) then
        SetVehicleColours(vehicle, primary, secondary)
        SetVehicleExtraColours(vehicle, pearlescent, wheel)
    end

    cb({ ok = true })
end)

RegisterNUICallback('setMod', function(body, cb)
    local vehicle = cachedVehicle ~= 0 and cachedVehicle or getTargetVehicle()
    if vehicle == 0 then cb({ ok = false }) return end

    local modType = tonumber(body.type)
    local index = tonumber(body.index)
    if modType == nil or index == nil then cb({ ok = false }) return end

    if requestControlOfEntity(vehicle) then
        SetVehicleModKit(vehicle, 0)
        SetVehicleMod(vehicle, modType, index, false)
    end

    cb({ ok = true })
end)

RegisterNUICallback('toggleExtra', function(body, cb)
    local vehicle = cachedVehicle ~= 0 and cachedVehicle or getTargetVehicle()
    if vehicle == 0 then cb({ ok = false }) return end

    local extraId = tonumber(body.id)
    local enable = body.enable == true

    if extraId == nil then cb({ ok = false }) return end

    if requestControlOfEntity(vehicle) then
        -- In FiveM, SetVehicleExtra disables when passed true
        SetVehicleExtra(vehicle, extraId, not enable)
    end

    cb({ ok = true })
end)

RegisterNetEvent('fmu:client:notAllowed', function(reason)
    notify(reason or 'You are not allowed to use this', 'error')
end)