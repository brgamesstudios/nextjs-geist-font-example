-- Shared utility functions for the mechanic script

-- Check if a vehicle is repairable
function IsVehicleRepairable(vehicle)
    if not vehicle or not DoesEntityExist(vehicle) then
        return false
    end
    
    local vehicleClass = GetVehicleClass(vehicle)
    return Config.RepairableVehicles[vehicleClass] or false
end

-- Get vehicle health percentage
function GetVehicleHealthPercentage(vehicle)
    if not vehicle or not DoesEntityExist(vehicle) then
        return 0
    end
    
    local engineHealth = GetVehicleEngineHealth(vehicle)
    local bodyHealth = GetVehicleBodyHealth(vehicle)
    
    return math.floor((engineHealth + bodyHealth) / 20) -- Convert to percentage (2000 max health / 100%)
end

-- Check if player is near a specific location
function IsPlayerNearLocation(playerCoords, targetCoords, maxDistance)
    maxDistance = maxDistance or 2.0
    return #(playerCoords - targetCoords) <= maxDistance
end

-- Format currency
function FormatCurrency(amount)
    return "$" .. tostring(amount)
end

-- Validate part ID
function IsValidPart(partId)
    return Config.Parts[partId] ~= nil
end

-- Get part data
function GetPartData(partId)
    return Config.Parts[partId]
end

-- Check if player has mechanic job
function HasMechanicJob(playerData)
    if not Config.RequireJob then
        return true
    end
    
    return playerData.job and playerData.job.name == Config.MechanicJob
end

-- Get repair cost for a specific repair type
function GetRepairCost(repairType)
    local repairConfig = Config.RepairSettings[repairType .. 'Repair']
    return repairConfig and repairConfig.cost or 0
end

-- Get repair time for a specific repair type
function GetRepairTime(repairType)
    local repairConfig = Config.RepairSettings[repairType .. 'Repair']
    return repairConfig and repairConfig.time or 0
end

-- Check if all required parts are available
function HasRequiredParts(parts, requiredParts)
    for _, requiredPart in ipairs(requiredParts) do
        if not parts[requiredPart] or parts[requiredPart] < 1 then
            return false
        end
    end
    return true
end

-- Format time in seconds to readable format
function FormatTime(seconds)
    if seconds < 60 then
        return seconds .. " seconds"
    elseif seconds < 3600 then
        local minutes = math.floor(seconds / 60)
        local remainingSeconds = seconds % 60
        return minutes .. "m " .. remainingSeconds .. "s"
    else
        local hours = math.floor(seconds / 3600)
        local remainingMinutes = math.floor((seconds % 3600) / 60)
        return hours .. "h " .. remainingMinutes .. "m"
    end
end

-- Validate coordinates
function IsValidCoords(coords)
    return coords and type(coords) == "vector3" and 
           coords.x and coords.y and coords.z and
           coords.x ~= 0 and coords.y ~= 0 and coords.z ~= 0
end

-- Get distance between two coordinates
function GetDistance(coords1, coords2)
    if not IsValidCoords(coords1) or not IsValidCoords(coords2) then
        return math.huge
    end
    return #(coords1 - coords2)
end

-- Check if a value is within a range
function IsInRange(value, min, max)
    return value >= min and value <= max
end

-- Clamp a value between min and max
function Clamp(value, min, max)
    return math.max(min, math.min(max, value))
end

-- Round a number to specified decimal places
function Round(number, decimals)
    decimals = decimals or 0
    local multiplier = 10^decimals
    return math.floor(number * multiplier + 0.5) / multiplier
end

-- Check if a table contains a value
function TableContains(table, value)
    for _, v in pairs(table) do
        if v == value then
            return true
        end
    end
    return false
end

-- Deep copy a table
function DeepCopy(orig)
    local orig_type = type(orig)
    local copy
    if orig_type == 'table' then
        copy = {}
        for orig_key, orig_value in next, orig, nil do
            copy[DeepCopy(orig_key)] = DeepCopy(orig_value)
        end
        setmetatable(copy, DeepCopy(getmetatable(orig)))
    else
        copy = orig
    end
    return copy
end

-- Merge two tables
function MergeTables(t1, t2)
    local result = DeepCopy(t1)
    for k, v in pairs(t2) do
        result[k] = v
    end
    return result
end

-- Log function for debugging
function Log(message, level)
    if Config.Debug then
        level = level or "INFO"
        print(string.format("[MECHANIC] [%s] %s", level, message))
    end
end

-- Export utility functions
exports('IsVehicleRepairable', IsVehicleRepairable)
exports('GetVehicleHealthPercentage', GetVehicleHealthPercentage)
exports('IsPlayerNearLocation', IsPlayerNearLocation)
exports('FormatCurrency', FormatCurrency)
exports('IsValidPart', IsValidPart)
exports('GetPartData', GetPartData)
exports('HasMechanicJob', HasMechanicJob)
exports('GetRepairCost', GetRepairCost)
exports('GetRepairTime', GetRepairTime)
exports('HasRequiredParts', HasRequiredParts)
exports('FormatTime', FormatTime)
exports('IsValidCoords', IsValidCoords)
exports('GetDistance', GetDistance)
exports('IsInRange', IsInRange)
exports('Clamp', Clamp)
exports('Round', Round)
exports('TableContains', TableContains)
exports('DeepCopy', DeepCopy)
exports('MergeTables', MergeTables)
exports('Log', Log)