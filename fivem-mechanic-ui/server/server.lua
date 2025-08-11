local function canPlayerOpen(source)
    if Config.AllowEveryone then return true end
    if Config.RequireAcePermission and IsPlayerAceAllowed(source, Config.AcePermission or 'mechanic.ui') then
        return true
    end
    if not Config.RequireAcePermission and not Config.AllowEveryone then
        -- default deny when neither allowed nor ace-enabled
        return false
    end
    return false
end

RegisterNetEvent('fmu:server:requestOpen', function()
    local src = source
    if canPlayerOpen(src) then
        TriggerClientEvent('fmu:client:open', src)
    else
        -- optionally notify
        -- TriggerClientEvent('chat:addMessage', src, { args = { '^1Mechanic', 'You are not allowed to use this.' } })
    end
end)