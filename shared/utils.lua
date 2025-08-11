-- Shared utility functions for the mechanic script

local Utils = {}

local function safePrint(...)
    if Config and Config.Debug then
        print('[mechanic] ', ...)
    end
end

function Utils.clamp(value, min, max)
    if value < min then return min end
    if value > max then return max end
    return value
end

function Utils.round(number, decimals)
    local power = 10 ^ (decimals or 0)
    return math.floor(number * power + 0.5) / power
end

function Utils.getDistance(a, b)
    return #(a - b)
end

function Utils.isInRange(point, center, range)
    return Utils.getDistance(point, center) <= range
end

function Utils.tableContains(t, value)
    for _, v in pairs(t) do
        if v == value then return true end
    end
    return false
end

function Utils.deepCopy(orig)
    local orig_type = type(orig)
    local copy
    if orig_type == 'table' then
        copy = {}
        for orig_key, orig_value in next, orig, nil do
            copy[Utils.deepCopy(orig_key)] = Utils.deepCopy(orig_value)
        end
        setmetatable(copy, Utils.deepCopy(getmetatable(orig)))
    else
        copy = orig
    end
    return copy
end

function Utils.mergeTables(base, override)
    local result = Utils.deepCopy(base)
    for k, v in pairs(override) do
        if type(v) == 'table' and type(result[k]) == 'table' then
            result[k] = Utils.mergeTables(result[k], v)
        else
            result[k] = v
        end
    end
    return result
end

function Utils.formatCurrency(amount)
    local left, num, right = string.match(tostring(amount), '^([^%d]*%d)(%d*)(.-)$')
    return left .. (num:reverse():gsub('(%d%d%d)', '%1,'):reverse()) .. right
end

function Utils.getVehicleHealthPercent(vehicle)
    if not DoesEntityExist(vehicle) then return 0 end
    local body = GetVehicleBodyHealth(vehicle) -- 0.0 - 1000.0
    local engine = GetVehicleEngineHealth(vehicle)
    local fuel = GetVehiclePetrolTankHealth(vehicle)
    local avg = (body + engine + fuel) / 3.0
    return Utils.clamp(Utils.round((avg / 1000.0) * 100.0, 1), 0.0, 100.0)
end

function Utils.isVehicleRepairableClass(class)
    return Config.RepairableVehicleClasses[class] == true
end

function Utils.isValidPart(partName)
    return Config.Parts[partName] ~= nil
end

function Utils.getPartData(partName)
    return Config.Parts[partName]
end

function Utils.getRepairData(repairKey)
    return Config.Repairs[repairKey]
end

function Utils.getRepairCost(repairKey)
    local data = Utils.getRepairData(repairKey)
    return data and data.baseCost or 0
end

function Utils.getRepairTime(repairKey)
    local data = Utils.getRepairData(repairKey)
    return data and data.time or 0
end

function Utils.hasMechanicJob(jobName, grade)
    if not jobName then return false end
    if jobName ~= Config.MechanicJobName then return false end
    if grade and grade < (Config.RequiredJobGrade or 0) then return false end
    return true
end

function Utils.log(...)
    safePrint(...)
end

-- Exports
exports('Clamp', Utils.clamp)
exports('Round', Utils.round)
exports('GetDistance', Utils.getDistance)
exports('IsInRange', Utils.isInRange)
exports('FormatCurrency', Utils.formatCurrency)
exports('GetVehicleHealthPercentage', Utils.getVehicleHealthPercent)
exports('IsVehicleRepairableClass', Utils.isVehicleRepairableClass)
exports('IsValidPart', Utils.isValidPart)
exports('GetPartData', Utils.getPartData)
exports('GetRepairData', Utils.getRepairData)
exports('GetRepairCost', Utils.getRepairCost)
exports('GetRepairTime', Utils.getRepairTime)
exports('HasMechanicJob', Utils.hasMechanicJob)

return Utils