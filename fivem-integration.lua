-- FiveM QBCore Mechanic UI Integration
-- Place this file in your resource folder

local QBCore = exports['qb-core']:GetCoreObject()
local PlayerData = {}
local isUIOpen = false

-- Initialize player data
RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    PlayerData = QBCore.Functions.GetPlayerData()
end)

RegisterNetEvent('QBCore:Client:OnJobUpdate', function(JobInfo)
    PlayerData.job = JobInfo
end)

-- Command to open mechanic UI (for testing)
RegisterCommand('mechanic', function()
    if PlayerData.job and PlayerData.job.name == "mechanic" then
        OpenMechanicUI()
    else
        QBCore.Functions.Notify('You are not a mechanic!', 'error')
    end
end)

-- Key binding to open mechanic UI (F6)
RegisterKeyMapping('mechanic', 'Open Mechanic UI', 'keyboard', 'F6')

-- Function to open the mechanic UI
function OpenMechanicUI()
    if isUIOpen then return end
    
    isUIOpen = true
    SetNuiFocus(true, true)
    
    -- Get current vehicle data if player is in a vehicle
    local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
    if vehicle ~= 0 then
        local plate = GetVehicleNumberPlateText(vehicle)
        local vehicleData = GetVehicleData(vehicle, plate)
        
        SendNUIMessage({
            action = "openMechanicUI",
            vehicleData = vehicleData
        })
    else
        SendNUIMessage({
            action = "openMechanicUI"
        })
    end
end

-- Function to get vehicle data
function GetVehicleData(vehicle, plate)
    local engineHealth = GetVehicleEngineHealth(vehicle)
    local bodyHealth = GetVehicleBodyHealth(vehicle)
    local fuelLevel = GetVehicleFuelLevel(vehicle)
    
    -- Convert health values to percentages (0-100)
    local enginePercent = math.max(0, math.min(100, (engineHealth / 1000) * 100))
    local bodyPercent = math.max(0, math.min(100, (bodyHealth / 1000) * 100))
    
    -- Calculate overall health
    local overallHealth = math.floor((enginePercent + bodyPercent) / 2)
    
    return {
        id = "VH" .. math.random(1000, 9999),
        plate = plate,
        model = GetDisplayNameFromVehicleModel(GetEntityModel(vehicle)),
        health = overallHealth,
        fuel = math.floor(fuelLevel),
        engine = math.floor(enginePercent),
        body = math.floor(bodyPercent),
        transmission = math.floor(GetVehicleHandlingFloat(vehicle, "CHandlingData", "fClutchChangeRateScaleUpShift") * 100),
        brakes = math.floor(GetVehicleHandlingFloat(vehicle, "CHandlingData", "fBrakeForce") * 100),
        suspension = math.floor(GetVehicleHandlingFloat(vehicle, "CHandlingData", "fSuspensionRaise") * 100),
        owner = PlayerData.charinfo.firstname .. " " .. PlayerData.charinfo.lastname,
        lastService = os.date("%Y-%m-%d")
    }
end

-- NUI Callbacks
RegisterNUICallback('closeUI', function(data, cb)
    isUIOpen = false
    SetNuiFocus(false, false)
    cb('ok')
end)

RegisterNUICallback('startRepair', function(data, cb)
    local component = data.component
    local vehiclePlate = data.plate
    
    -- Check if player is near the vehicle
    local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
    if vehicle == 0 then
        QBCore.Functions.Notify('You must be in a vehicle to repair it!', 'error')
        cb('error')
        return
    end
    
    -- Start repair process
    QBCore.Functions.Notify('Starting repair of ' .. component .. '...', 'primary')
    
    -- You can add animations, progress bars, etc. here
    -- For now, we'll just simulate the repair
    
    cb('ok')
end)

RegisterNUICallback('completeRepair', function(data, cb)
    local component = data.component
    local vehiclePlate = data.plate
    local cost = data.cost
    
    -- Check if player has enough money
    if PlayerData.money.cash < cost then
        QBCore.Functions.Notify('You don\'t have enough cash!', 'error')
        cb('error')
        return
    end
    
    -- Deduct money
    TriggerServerEvent('qb-mechanic:deductMoney', cost)
    
    -- Update vehicle health
    local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
    if vehicle ~= 0 then
        if component == 'engine' then
            SetVehicleEngineHealth(vehicle, 1000.0)
        elseif component == 'body' then
            SetVehicleBodyHealth(vehicle, 1000.0)
        elseif component == 'fuel' then
            SetVehicleFuelLevel(vehicle, 100.0)
        end
    end
    
    QBCore.Functions.Notify(component .. ' repair completed!', 'success')
    cb('ok')
end)

RegisterNUICallback('updateParts', function(data, cb)
    -- Handle parts inventory updates
    -- This would typically sync with your server's inventory system
    cb('ok')
end)

RegisterNUICallback('createRequest', function(data, cb)
    -- Create new customer request
    -- This would typically save to your server's database
    QBCore.Functions.Notify('Customer request created!', 'success')
    cb('ok')
end)

-- Event to update vehicle data from server
RegisterNetEvent('qb-mechanic:updateVehicleData', function(vehicleData)
    if isUIOpen then
        SendNUIMessage({
            action = "updateVehicleData",
            vehicleData = vehicleData
        })
    end
end)

-- Event to close UI from server
RegisterNetEvent('qb-mechanic:closeUI', function()
    if isUIOpen then
        isUIOpen = false
        SetNuiFocus(false, false)
    end
end)

-- Cleanup when resource stops
AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() == resourceName then
        if isUIOpen then
            SetNuiFocus(false, false)
        end
    end
end)

-- Export functions for other resources
exports('OpenMechanicUI', OpenMechanicUI)
exports('IsMechanicUIOpen', function() return isUIOpen end)