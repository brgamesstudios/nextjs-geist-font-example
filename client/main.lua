local ESX = exports['es_extended']:getSharedObject()
local Utils = require 'shared/utils'

local uiOpen = false
local lastVehicle = 0
local currentLift = nil

local function notify(message)
    if Config.NotificationType == 'esx' then
        ESX.ShowNotification(message)
    else
        TriggerEvent('chat:addMessage', { args = { '[Mechanic]', message } })
    end
end

local function drawMarkerAt(markerCfg, coords)
    DrawMarker(
        markerCfg.type or 1,
        coords.x, coords.y, coords.z - 1.0,
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        (markerCfg.scale and markerCfg.scale.x) or 1.0,
        (markerCfg.scale and markerCfg.scale.y) or 1.0,
        (markerCfg.scale and markerCfg.scale.z) or 1.0,
        (markerCfg.color and markerCfg.color.r) or 0,
        (markerCfg.color and markerCfg.color.g) or 150,
        (markerCfg.color and markerCfg.color.b) or 255,
        (markerCfg.color and markerCfg.color.a) or 150,
        false, false, 2, false, nil, nil, false
    )
end

local function createBlip(cfg)
    local blip = AddBlipForCoord(cfg.coords.x, cfg.coords.y, cfg.coords.z)
    SetBlipSprite(blip, (cfg.blip and cfg.blip.sprite) or 402)
    SetBlipScale(blip, (cfg.blip and cfg.blip.scale) or 0.8)
    SetBlipColour(blip, (cfg.blip and cfg.blip.color) or 3)
    SetBlipAsShortRange(blip, true)
    BeginTextCommandSetBlipName('STRING')
    AddTextComponentString((cfg.blip and cfg.blip.name) or 'Mechanic')
    EndTextCommandSetBlipName(blip)
end

local function getClosestVehicle(coords, radius)
    local vehicles = GetGamePool('CVehicle')
    local closest, closestDist = 0, radius or 5.0
    for _, veh in ipairs(vehicles) do
        local vehCoords = GetEntityCoords(veh)
        local dist = #(vehCoords - coords)
        if dist < closestDist then
            closest = veh
            closestDist = dist
        end
    end
    return closest
end

local function getPlayerJob()
    local xPlayer = ESX.GetPlayerData()
    return (xPlayer and xPlayer.job) or { name = 'unemployed', grade = 0 }
end

local function isMechanic()
    local job = getPlayerJob()
    return Utils.hasMechanicJob(job.name, job.grade)
end

local function gatherVehicleData(vehicle)
    if vehicle == 0 then return nil end
    local class = GetVehicleClass(vehicle)
    local health = Utils.getVehicleHealthPercent(vehicle)
    local plate = ESX.Math.Trim(GetVehicleNumberPlateText(vehicle))
    local modelHash = GetEntityModel(vehicle)
    local displayName = GetDisplayNameFromVehicleModel(modelHash)
    return {
        plate = plate,
        class = class,
        model = displayName,
        health = health
    }
end

local function sendUI(action, data)
    SendNUIMessage({ action = action, data = data })
end

local function openUI()
    if uiOpen then return end
    if not isMechanic() then
        notify(Config.Text.not_mechanic)
        return
    end
    uiOpen = true
    SetNuiFocus(true, true)

    local ped = PlayerPedId()
    local veh = GetVehiclePedIsIn(ped, false)
    if veh == 0 then veh = getClosestVehicle(GetEntityCoords(ped), 6.0) end
    lastVehicle = veh

    local vehData = gatherVehicleData(veh)
    sendUI('show', { vehicle = vehData, parts = nil })
    ESX.TriggerServerCallback('mechanic:getPartsInventory', function(parts)
        sendUI('updatePartsInventory', parts or {})
    end)
end

local function closeUI()
    if not uiOpen then return end
    uiOpen = false
    SetNuiFocus(false, false)
    sendUI('hide', {})
end

local function playProgress(label, durationMs)
    if Config.UseProgressBarsExport and exports and exports['progressBars'] then
        -- try commonly used exports
        if exports['progressBars'].startUI then
            exports['progressBars']:startUI(durationMs, label)
            Wait(durationMs)
            return
        elseif exports['progressBars'].custom then
            exports['progressBars']:custom({
                Duration = durationMs,
                Label = label,
                Animation = {scenario = 'WORLD_HUMAN_VEHICLE_MECHANIC'},
                DisableControls = true,
                CanCancel = false,
            })
            Wait(durationMs)
            return
        end
    end
    sendUI('showProgress', { label = label, duration = durationMs })
    Wait(durationMs)
    sendUI('hideProgress')
end

local function performRepair(repairKey)
    if lastVehicle == 0 or not DoesEntityExist(lastVehicle) then
        notify(Config.Text.no_vehicle)
        return
    end

    ESX.TriggerServerCallback('mechanic:hasRequiredParts', function(hasParts, missing)
        if not hasParts then
            if missing and #missing > 0 then
                notify('Missing parts: ' .. table.concat(missing, ', '))
            else
                notify('You do not have the required parts.')
            end
            return
        end

        local repairData = Utils.getRepairData(repairKey)
        if not repairData then return end

        TaskStartScenarioInPlace(PlayerPedId(), 'WORLD_HUMAN_VEHICLE_MECHANIC', 0, true)
        playProgress(Config.Text.repairing, repairData.time)
        ClearPedTasks(PlayerPedId())

        -- consume parts
        TriggerServerEvent('mechanic:consumeParts', repairData.parts)

        -- apply repair effect
        SetVehicleFixed(lastVehicle)
        SetVehicleDeformationFixed(lastVehicle)
        SetVehicleEngineHealth(lastVehicle, 1000.0)
        SetVehicleBodyHealth(lastVehicle, 1000.0)

        local vehData = gatherVehicleData(lastVehicle)
        sendUI('updateVehicleData', vehData)
        notify('Repair completed!')
    end, repairKey)
end

-- NUI Callbacks
RegisterNUICallback('close', function(_, cb)
    closeUI()
    cb('ok')
end)

RegisterNUICallback('buyPart', function(data, cb)
    local part = data and data.part
    local qty = tonumber(data and data.quantity) or 1
    if not part or not Utils.isValidPart(part) then cb('invalid'); return end
    TriggerServerEvent('mechanic:buyPart', part, qty)
    ESX.TriggerServerCallback('mechanic:getPartsInventory', function(parts)
        sendUI('updatePartsInventory', parts or {})
    end)
    cb('ok')
end)

RegisterNUICallback('performRepair', function(data, cb)
    local repairKey = data and data.repair
    if not repairKey then cb('invalid'); return end
    performRepair(repairKey)
    cb('ok')
end)

RegisterNUICallback('requestPartsInventory', function(_, cb)
    ESX.TriggerServerCallback('mechanic:getPartsInventory', function(parts)
        sendUI('updatePartsInventory', parts or {})
        cb(parts or {})
    end)
end)

-- Commands
RegisterCommand('mechanic', function()
    openUI()
end)

-- Markers & interactions
CreateThread(function()
    createBlip(Config.MainShop)

    while true do
        local sleep = 1000
        local ped = PlayerPedId()
        local coords = GetEntityCoords(ped)

        -- Main shop
        local distShop = #(coords - Config.MainShop.coords)
        if distShop < 25.0 then
            sleep = 0
            drawMarkerAt(Config.MainShop.marker, Config.MainShop.coords)
            if distShop < 2.0 then
                ESX.ShowHelpNotification(Config.Text.press_e_open)
                if IsControlJustReleased(0, 38) then -- E
                    openUI()
                end
            end
        end

        -- Parts storage
        local distStore = #(coords - Config.PartsStorage.coords)
        if distStore < 15.0 then
            sleep = 0
            drawMarkerAt(Config.PartsStorage.marker, Config.PartsStorage.coords)
            if distStore < 2.0 then
                ESX.ShowHelpNotification(Config.Text.press_e_storage)
                if IsControlJustReleased(0, 38) then
                    openUI()
                end
            end
        end

        -- Lifts
        for i, lift in ipairs(Config.Lifts) do
            local distLift = #(coords - lift.coords)
            if distLift < 15.0 then
                sleep = 0
                drawMarkerAt(lift.marker, lift.coords)
                if distLift < 2.0 then
                    ESX.ShowHelpNotification(Config.Text.press_e_lift)
                    if IsControlJustReleased(0, 38) then
                        currentLift = i
                        local veh = getClosestVehicle(lift.coords, 3.0)
                        if veh ~= 0 then
                            local pos = GetEntityCoords(veh)
                            SetEntityCoords(veh, pos.x, pos.y, pos.z + lift.liftHeight, false, false, false, true)
                            FreezeEntityPosition(veh, true)
                            notify('Vehicle raised on ' .. (lift.name or 'Lift'))
                        else
                            notify(Config.Text.no_vehicle)
                        end
                    end
                end
            end
        end

        Wait(sleep)
    end
end)

-- Keybind to lower vehicle if frozen on a lift
RegisterKeyMapping('lowerlift', 'Lower vehicle on lift', 'keyboard', 'L')
RegisterCommand('lowerlift', function()
    if not currentLift then return end
    local lift = Config.Lifts[currentLift]
    local veh = getClosestVehicle(lift.coords, 3.0)
    if veh ~= 0 then
        FreezeEntityPosition(veh, false)
        local pos = GetEntityCoords(veh)
        SetEntityCoords(veh, pos.x, pos.y, pos.z - (lift.liftHeight or 1.5), false, false, false, true)
        notify('Vehicle lowered from ' .. (lift.name or 'Lift'))
    end
end)

-- Open UI with E near shop even without command
CreateThread(function()
    while true do
        if uiOpen then
            DisableControlAction(0, 1, true)
            DisableControlAction(0, 2, true)
            DisableControlAction(0, 200, true)
            DisableControlAction(0, 322, true)
        end
        Wait(0)
    end
end)