local ESX = nil
local PlayerData = {}
local isNearMechanic = false
local currentVehicle = nil
local isRepairing = false
local currentLift = nil

-- ESX Initialization
Citizen.CreateThread(function()
    while ESX == nil do
        TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)
        Citizen.Wait(0)
    end

    while ESX.GetPlayerData().job == nil do
        Citizen.Wait(10)
    end

    PlayerData = ESX.GetPlayerData()
end)

-- Update player data when job changes
RegisterNetEvent('esx:setJob')
AddEventHandler('esx:setJob', function(job)
    PlayerData.job = job
end)

-- Main Thread
Citizen.CreateThread(function()
    -- Create blips
    CreateBlips()
    
    while true do
        Citizen.Wait(0)
        local playerPed = PlayerPedId()
        local playerCoords = GetEntityCoords(playerPed)
        
        -- Check if player is near mechanic shop
        local distance = #(playerCoords - Config.Locations.mainShop.coords)
        if distance < 50.0 then
            DrawMarkers()
            CheckInteractions(playerPed, playerCoords)
        end
        
        -- Check lift interactions
        CheckLiftInteractions(playerPed, playerCoords)
        
        -- Check parts storage
        CheckPartsStorage(playerPed, playerCoords)
    end
end)

-- Create Blips
function CreateBlips()
    local blip = AddBlipForCoord(Config.Locations.mainShop.coords.x, Config.Locations.mainShop.coords.y, Config.Locations.mainShop.coords.z)
    SetBlipSprite(blip, Config.Locations.mainShop.blip.sprite)
    SetBlipDisplay(blip, 4)
    SetBlipScale(blip, Config.Locations.mainShop.blip.scale)
    SetBlipColour(blip, Config.Locations.mainShop.blip.color)
    SetBlipAsShortRange(blip, true)
    BeginTextCommandSetBlipName("STRING")
    AddTextComponentString(Config.Locations.mainShop.blip.name)
    EndTextCommandSetBlipName(blip)
end

-- Draw Markers
function DrawMarkers()
    -- Main shop marker
    DrawMarker(
        Config.Locations.mainShop.marker.type,
        Config.Locations.mainShop.coords.x, Config.Locations.mainShop.coords.y, Config.Locations.mainShop.coords.z - 1.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        Config.Locations.mainShop.marker.size.x, Config.Locations.mainShop.marker.size.y, Config.Locations.mainShop.marker.size.z,
        Config.Locations.mainShop.marker.color.r, Config.Locations.mainShop.marker.color.g, Config.Locations.mainShop.marker.color.b, Config.Locations.mainShop.marker.color.a,
        false, true, 2, false, nil, nil, false
    )
    
    -- Parts storage marker
    DrawMarker(
        Config.Locations.partsStorage.marker.type,
        Config.Locations.partsStorage.coords.x, Config.Locations.partsStorage.coords.y, Config.Locations.partsStorage.coords.z - 1.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        Config.Locations.partsStorage.marker.size.x, Config.Locations.partsStorage.marker.size.y, Config.Locations.partsStorage.marker.size.z,
        Config.Locations.partsStorage.marker.color.r, Config.Locations.partsStorage.marker.color.g, Config.Locations.partsStorage.marker.color.b, Config.Locations.partsStorage.marker.color.a,
        false, true, 2, false, nil, nil, false
    )
end

-- Check Interactions
function CheckInteractions(playerPed, playerCoords)
    local distance = #(playerCoords - Config.Locations.mainShop.coords)
    
    if distance < 2.0 then
        ESX.ShowHelpNotification("Press ~INPUT_CONTEXT~ to access mechanic menu")
        
        if IsControlJustReleased(0, 38) then -- E key
            OpenMechanicMenu()
        end
    end
end

-- Check Lift Interactions
function CheckLiftInteractions(playerPed, playerCoords)
    for i, lift in ipairs(Config.Locations.lifts) do
        local distance = #(playerCoords - lift.coords)
        
        if distance < 3.0 then
            if not lift.inUse then
                ESX.ShowHelpNotification("Press ~INPUT_CONTEXT~ to use lift")
                
                if IsControlJustReleased(0, 38) then -- E key
                    UseLift(i)
                end
            else
                ESX.ShowHelpNotification("Lift is currently in use")
            end
        end
    end
end

-- Check Parts Storage
function CheckPartsStorage(playerPed, playerCoords)
    local distance = #(playerCoords - Config.Locations.partsStorage.coords)
    
    if distance < 2.0 then
        ESX.ShowHelpNotification("Press ~INPUT_CONTEXT~ to access parts storage")
        
        if IsControlJustReleased(0, 38) then -- E key
            OpenPartsStorage()
        end
    end
end

-- Use Lift
function UseLift(liftIndex)
    if not Config.RequireJob or PlayerData.job.name == Config.MechanicJob then
        local lift = Config.Locations.lifts[liftIndex]
        local playerPed = PlayerPedId()
        
        if IsPedInAnyVehicle(playerPed, false) then
            local vehicle = GetVehiclePedIsIn(playerPed, false)
            
            if GetPedInVehicleSeat(vehicle, -1) == playerPed then
                lift.inUse = true
                currentLift = liftIndex
                currentVehicle = vehicle
                
                -- Move vehicle to lift
                SetEntityCoords(vehicle, lift.coords.x, lift.coords.y, lift.coords.z)
                SetEntityHeading(vehicle, lift.heading)
                
                -- Raise vehicle (simple animation)
                local vehicleCoords = GetEntityCoords(vehicle)
                SetEntityCoords(vehicle, vehicleCoords.x, vehicleCoords.y, vehicleCoords.z + 1.0)
                
                ESX.ShowNotification("Vehicle lifted successfully!")
                OpenRepairMenu()
            else
                ESX.ShowNotification("You must be the driver to use the lift!")
            end
        else
            ESX.ShowNotification("You must be in a vehicle to use the lift!")
        end
    else
        ESX.ShowNotification("You need to be a mechanic to use this!")
    end
end

-- Open Mechanic Menu
function OpenMechanicMenu()
    if not Config.RequireJob or PlayerData.job.name == Config.MechanicJob then
        local elements = {
            {label = 'Vehicle Diagnostics', value = 'diagnostics'},
            {label = 'Quick Repair', value = 'quick_repair'},
            {label = 'Parts Management', value = 'parts'},
            {label = 'Vehicle Modifications', value = 'mods'}
        }
        
        ESX.UI.Menu.Open('default', GetCurrentResourceName(), 'mechanic_menu', {
            title = 'Mechanic Menu',
            align = 'top-left',
            elements = elements
        }, function(data, menu)
            if data.current.value == 'diagnostics' then
                OpenDiagnosticsMenu()
            elseif data.current.value == 'quick_repair' then
                OpenQuickRepairMenu()
            elseif data.current.value == 'parts' then
                OpenPartsMenu()
            elseif data.current.value == 'mods' then
                OpenModificationsMenu()
            end
        end, function(data, menu)
            menu.close()
        end)
    else
        ESX.ShowNotification("You need to be a mechanic to access this menu!")
    end
end

-- Open Diagnostics Menu
function OpenDiagnosticsMenu()
    local playerPed = PlayerPedId()
    
    if IsPedInAnyVehicle(playerPed, false) then
        local vehicle = GetVehiclePedIsIn(playerPed, false)
        local engineHealth = GetVehicleEngineHealth(vehicle)
        local bodyHealth = GetVehicleBodyHealth(vehicle)
        local fuelLevel = GetVehicleFuelLevel(vehicle)
        
        local elements = {
            {label = 'Engine Health: ' .. math.floor(engineHealth) .. '%', value = 'engine'},
            {label = 'Body Health: ' .. math.floor(bodyHealth) .. '%', value = 'body'},
            {label = 'Fuel Level: ' .. math.floor(fuelLevel) .. '%', value = 'fuel'}
        }
        
        ESX.UI.Menu.Open('default', GetCurrentResourceName(), 'diagnostics_menu', {
            title = 'Vehicle Diagnostics',
            align = 'top-left',
            elements = elements
        }, function(data, menu)
            if data.current.value == 'engine' then
                ESX.ShowNotification("Engine requires attention: " .. math.floor(engineHealth) .. "% health")
            elseif data.current.value == 'body' then
                ESX.ShowNotification("Body condition: " .. math.floor(bodyHealth) .. "% health")
            elseif data.current.value == 'fuel' then
                ESX.ShowNotification("Fuel level: " .. math.floor(fuelLevel) .. "%")
            end
        end, function(data, menu)
            menu.close()
        end)
    else
        ESX.ShowNotification("You must be in a vehicle to run diagnostics!")
    end
end

-- Open Quick Repair Menu
function OpenQuickRepairMenu()
    local playerPed = PlayerPedId()
    
    if IsPedInAnyVehicle(playerPed, false) then
        local vehicle = GetVehiclePedIsIn(playerPed, false)
        local elements = {
            {label = 'Repair Engine ($' .. Config.RepairSettings.engineRepair.cost .. ')', value = 'engine_repair'},
            {label = 'Repair Body ($' .. Config.RepairSettings.bodyRepair.cost .. ')', value = 'body_repair'},
            {label = 'Repair Wheels ($' .. Config.RepairSettings.wheelRepair.cost .. ')', value = 'wheel_repair'},
            {label = 'Full Repair ($' .. Config.RepairSettings.fullRepair.cost .. ')', value = 'full_repair'}
        }
        
        ESX.UI.Menu.Open('default', GetCurrentResourceName(), 'quick_repair_menu', {
            title = 'Quick Repair Options',
            align = 'top-left',
            elements = elements
        }, function(data, menu)
            if data.current.value == 'engine_repair' then
                TriggerRepair('engine', vehicle)
            elseif data.current.value == 'body_repair' then
                TriggerRepair('body', vehicle)
            elseif data.current.value == 'wheel_repair' then
                TriggerRepair('wheel', vehicle)
            elseif data.current.value == 'full_repair' then
                TriggerRepair('full', vehicle)
            end
            menu.close()
        end, function(data, menu)
            menu.close()
        end)
    else
        ESX.ShowNotification("You must be in a vehicle to repair!")
    end
end

-- Trigger Repair
function TriggerRepair(repairType, vehicle)
    if isRepairing then
        ESX.ShowNotification("Already repairing a vehicle!")
        return
    end
    
    local repairConfig = Config.RepairSettings[repairType .. 'Repair']
    if not repairConfig then
        repairConfig = Config.RepairSettings.fullRepair
    end
    
    -- Check if player has required parts
    ESX.TriggerServerCallback('mechanic:checkParts', function(hasParts)
        if hasParts then
            isRepairing = true
            ESX.ShowNotification("Starting repair... Please wait.")
            
            -- Start repair animation
            local playerPed = PlayerPedId()
            TaskStartScenarioInPlace(playerPed, "PROP_HUMAN_BUM_BIN", 0, true)
            
            -- Repair progress bar
            exports['progressBars']:startUI(repairConfig.time, "Repairing vehicle...")
            
            Citizen.Wait(repairConfig.time)
            
            -- Complete repair
            ClearPedTasks(playerPed)
            isRepairing = false
            
            if repairType == 'engine' then
                SetVehicleEngineHealth(vehicle, 1000.0)
            elseif repairType == 'body' then
                SetVehicleBodyHealth(vehicle, 1000.0)
            elseif repairType == 'wheel' then
                SetVehicleWheelHealth(vehicle, 1000.0)
            elseif repairType == 'full' then
                SetVehicleEngineHealth(vehicle, 1000.0)
                SetVehicleBodyHealth(vehicle, 1000.0)
                SetVehicleWheelHealth(vehicle, 1000.0)
                SetVehicleFuelLevel(vehicle, 100.0)
            end
            
            ESX.ShowNotification("Repair completed successfully!")
            
            -- Remove parts from inventory
            TriggerServerEvent('mechanic:removeParts', repairConfig.requiredParts)
            
        else
            ESX.ShowNotification("You don't have the required parts for this repair!")
        end
    end, repairConfig.requiredParts)
end

-- Open Parts Menu
function OpenPartsMenu()
    local elements = {}
    
    for partId, partData in pairs(Config.Parts) do
        table.insert(elements, {
            label = partData.label .. ' - $' .. partData.price,
            value = partId,
            price = partData.price
        })
    end
    
    ESX.UI.Menu.Open('default', GetCurrentResourceName(), 'parts_menu', {
        title = 'Parts Shop',
        align = 'top-left',
        elements = elements
    }, function(data, menu)
        ESX.UI.Menu.Open('dialog', GetCurrentResourceName(), 'parts_quantity', {
            title = 'Quantity'
        }, function(data2, menu2)
            local quantity = tonumber(data2.value)
            if quantity and quantity > 0 then
                TriggerServerEvent('mechanic:buyPart', data.current.value, quantity)
                menu2.close()
            else
                ESX.ShowNotification("Invalid quantity!")
            end
        end, function(data2, menu2)
            menu2.close()
        end)
    end, function(data, menu)
        menu.close()
    end)
end

-- Open Parts Storage
function OpenPartsStorage()
    if not Config.RequireJob or PlayerData.job.name == Config.MechanicJob then
        ESX.TriggerServerCallback('mechanic:getInventoryParts', function(parts)
            local elements = {}
            
            for partId, count in pairs(parts) do
                if Config.Parts[partId] then
                    table.insert(elements, {
                        label = Config.Parts[partId].label .. ' x' .. count,
                        value = partId,
                        count = count
                    })
                end
            end
            
            ESX.UI.Menu.Open('default', GetCurrentResourceName(), 'parts_storage', {
                title = 'Parts Storage',
                align = 'top-left',
                elements = elements
            }, function(data, menu)
                -- Parts storage management options
                ESX.ShowNotification("Parts storage accessed")
            end, function(data, menu)
                menu.close()
            end)
        end)
    else
        ESX.ShowNotification("You need to be a mechanic to access parts storage!")
    end
end

-- Open Modifications Menu
function OpenModificationsMenu()
    local playerPed = PlayerPedId()
    
    if IsPedInAnyVehicle(playerPed, false) then
        local vehicle = GetVehiclePedIsIn(playerPed, false)
        local elements = {
            {label = 'Performance Mods', value = 'performance'},
            {label = 'Visual Mods', value = 'visual'},
            {label = 'Paint Job', value = 'paint'}
        }
        
        ESX.UI.Menu.Open('default', GetCurrentResourceName(), 'mods_menu', {
            title = 'Vehicle Modifications',
            align = 'top-left',
            elements = elements
        }, function(data, menu)
            if data.current.value == 'performance' then
                OpenPerformanceMenu(vehicle)
            elseif data.current.value == 'visual' then
                OpenVisualMenu(vehicle)
            elseif data.current.value == 'paint' then
                OpenPaintMenu(vehicle)
            end
        end, function(data, menu)
            menu.close()
        end)
    else
        ESX.ShowNotification("You must be in a vehicle to modify!")
    end
end

-- Open Performance Menu
function OpenPerformanceMenu(vehicle)
    local elements = {
        {label = 'Engine Upgrade', value = 'engine_upgrade'},
        {label = 'Brake Upgrade', value = 'brake_upgrade'},
        {label = 'Transmission Upgrade', value = 'transmission_upgrade'},
        {label = 'Turbo', value = 'turbo'}
    }
    
    ESX.UI.Menu.Open('default', GetCurrentResourceName(), 'performance_menu', {
        title = 'Performance Modifications',
        align = 'top-left',
        elements = elements
    }, function(data, menu)
        ESX.ShowNotification("Performance modification: " .. data.current.label)
        -- Add actual modification logic here
    end, function(data, menu)
        menu.close()
    end)
end

-- Open Visual Menu
function OpenVisualMenu(vehicle)
    local elements = {
        {label = 'Body Kits', value = 'body_kits'},
        {label = 'Wheels', value = 'wheels'},
        {label = 'Exhaust', value = 'exhaust'},
        {label = 'Spoiler', value = 'spoiler'}
    }
    
    ESX.UI.Menu.Open('default', GetCurrentResourceName(), 'visual_menu', {
        title = 'Visual Modifications',
        align = 'top-left',
        elements = elements
    }, function(data, menu)
        ESX.ShowNotification("Visual modification: " .. data.current.label)
        -- Add actual modification logic here
    end, function(data, menu)
        menu.close()
    end)
end

-- Open Paint Menu
function OpenPaintMenu(vehicle)
    local elements = {
        {label = 'Red', value = 'red'},
        {label = 'Blue', value = 'blue'},
        {label = 'Green', value = 'green'},
        {label = 'Yellow', value = 'yellow'},
        {label = 'Black', value = 'black'},
        {label = 'White', value = 'white'}
    }
    
    ESX.UI.Menu.Open('default', GetCurrentResourceName(), 'paint_menu', {
        title = 'Paint Colors',
        align = 'top-left',
        elements = elements
    }, function(data, menu)
        local colors = {
            red = {r = 255, g = 0, b = 0},
            blue = {r = 0, g = 0, b = 255},
            green = {r = 0, g = 255, b = 0},
            yellow = {r = 255, g = 255, b = 0},
            black = {r = 0, g = 0, b = 0},
            white = {r = 255, g = 255, b = 255}
        }
        
        if colors[data.current.value] then
            SetVehicleCustomPrimaryColour(vehicle, colors[data.current.value].r, colors[data.current.value].g, colors[data.current.value].b)
            ESX.ShowNotification("Vehicle painted " .. data.current.label)
        end
    end, function(data, menu)
        menu.close()
    end)
end

-- Open Repair Menu (when on lift)
function OpenRepairMenu()
    if currentVehicle and currentLift then
        local elements = {
            {label = 'Repair Engine', value = 'engine_repair'},
            {label = 'Repair Body', value = 'body_repair'},
            {label = 'Repair Wheels', value = 'wheel_repair'},
            {label = 'Full Repair', value = 'full_repair'},
            {label = 'Lower Vehicle', value = 'lower_vehicle'}
        }
        
        ESX.UI.Menu.Open('default', GetCurrentResourceName(), 'repair_menu', {
            title = 'Vehicle Repair (On Lift)',
            align = 'top-left',
            elements = elements
        }, function(data, menu)
            if data.current.value == 'lower_vehicle' then
                LowerVehicle()
            else
                TriggerRepair(data.current.value:gsub('_repair', ''), currentVehicle)
            end
        end, function(data, menu)
            menu.close()
        end)
    end
end

-- Lower Vehicle
function LowerVehicle()
    if currentVehicle and currentLift then
        local lift = Config.Locations.lifts[currentLift]
        local vehicleCoords = GetEntityCoords(currentVehicle)
        
        -- Lower vehicle
        SetEntityCoords(currentVehicle, vehicleCoords.x, vehicleCoords.y, vehicleCoords.z - 1.0)
        
        -- Mark lift as available
        lift.inUse = false
        currentLift = nil
        currentVehicle = nil
        
        ESX.ShowNotification("Vehicle lowered successfully!")
    end
end

-- Commands
RegisterCommand('mechanic', function()
    if not Config.RequireJob or PlayerData.job.name == Config.MechanicJob then
        OpenMechanicMenu()
    else
        ESX.ShowNotification("You need to be a mechanic to use this command!")
    end
end, false)

RegisterCommand('repair', function()
    local playerPed = PlayerPedId()
    
    if IsPedInAnyVehicle(playerPed, false) then
        local vehicle = GetVehiclePedIsIn(playerPed, false)
        TriggerRepair('full', vehicle)
    else
        ESX.ShowNotification("You must be in a vehicle to repair!")
    end
end, false)

-- Events
RegisterNetEvent('mechanic:repairComplete')
AddEventHandler('mechanic:repairComplete', function()
    isRepairing = false
    ESX.ShowNotification("Repair completed!")
end)

-- Cleanup on resource stop
AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() == resourceName then
        if currentVehicle and currentLift then
            LowerVehicle()
        end
    end
end)