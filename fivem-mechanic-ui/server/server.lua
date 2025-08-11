local QBCore = nil

CreateThread(function()
    if Config.Framework and Config.Framework.UseQBCore then
        pcall(function()
            QBCore = exports['qb-core']:GetCoreObject()
        end)
    end
end)

local function isGradeAllowed(grade)
    local allowed = Config.Framework and Config.Framework.AllowedGrades
    if not allowed or next(allowed) == nil then return true end
    if type(grade) == 'table' then
        -- QBCore grade can be a table: { level = number, name = string }
        local lvl = grade.level
        local name = grade.name
        if type(allowed) == 'table' then
            if allowed[lvl] or allowed[name] then return true end
        end
        return false
    end
    return allowed[grade] == true
end

local function canPlayerOpen(src)
    if Config.Framework and Config.Framework.UseQBCore and QBCore then
        local Player = QBCore.Functions.GetPlayer(src)
        if not Player then return false end
        local job = Player.PlayerData and Player.PlayerData.job or nil
        if Config.Framework.MechanicJobRequired then
            if not job or job.name ~= (Config.Framework.JobName or 'mechanic') then
                return false
            end
            if Config.Framework.OnDutyRequired and not job.onduty then
                return false
            end
            if not isGradeAllowed(job.grade) then
                return false
            end
        end
        return true
    end

    if Config.AllowEveryone then return true end
    if Config.RequireAcePermission and IsPlayerAceAllowed(src, Config.AcePermission or 'mechanic.ui') then
        return true
    end
    if not Config.RequireAcePermission and not Config.AllowEveryone then
        return false
    end
    return false
end

RegisterNetEvent('fmu:server:requestOpen', function()
    local src = source
    if canPlayerOpen(src) then
        TriggerClientEvent('fmu:client:open', src)
    else
        TriggerClientEvent('fmu:client:notAllowed', src, 'Yetkiniz yok veya görevde değilsiniz')
    end
end)