local ESX = nil

-- ESX Initialization
TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)

-- Server Callbacks
ESX.RegisterServerCallback('mechanic:checkParts', function(source, cb, requiredParts)
    local xPlayer = ESX.GetPlayerFromId(source)
    
    if not xPlayer then
        cb(false)
        return
    end
    
    local hasAllParts = true
    
    for _, partId in ipairs(requiredParts) do
        local item = xPlayer.getInventoryItem(partId)
        if not item or item.count < 1 then
            hasAllParts = false
            break
        end
    end
    
    cb(hasAllParts)
end)

ESX.RegisterServerCallback('mechanic:getInventoryParts', function(source, cb)
    local xPlayer = ESX.GetPlayerFromId(source)
    
    if not xPlayer then
        cb({})
        return
    end
    
    local parts = {}
    
    for partId, _ in pairs(Config.Parts) do
        local item = xPlayer.getInventoryItem(partId)
        if item and item.count > 0 then
            parts[partId] = item.count
        end
    end
    
    cb(parts)
end)

-- Events
RegisterNetEvent('mechanic:buyPart')
AddEventHandler('mechanic:buyPart', function(partId, quantity)
    local xPlayer = ESX.GetPlayerFromId(source)
    
    if not xPlayer then
        return
    end
    
    if not Config.Parts[partId] then
        TriggerClientEvent('esx:showNotification', source, 'Invalid part!')
        return
    end
    
    local partData = Config.Parts[partId]
    local totalCost = partData.price * quantity
    
    if xPlayer.getMoney() >= totalCost then
        if xPlayer.canCarryItem(partId, quantity) then
            xPlayer.removeMoney(totalCost)
            xPlayer.addInventoryItem(partId, quantity)
            
            TriggerClientEvent('esx:showNotification', source, 'Purchased ' .. quantity .. 'x ' .. partData.label .. ' for $' .. totalCost)
        else
            TriggerClientEvent('esx:showNotification', source, 'You cannot carry that many parts!')
        end
    else
        TriggerClientEvent('esx:showNotification', source, 'You don\'t have enough money!')
    end
end)

RegisterNetEvent('mechanic:removeParts')
AddEventHandler('mechanic:removeParts', function(requiredParts)
    local xPlayer = ESX.GetPlayerFromId(source)
    
    if not xPlayer then
        return
    end
    
    for _, partId in ipairs(requiredParts) do
        xPlayer.removeInventoryItem(partId, 1)
    end
    
    TriggerClientEvent('esx:showNotification', source, 'Parts used for repair')
end)

-- Job Management
RegisterNetEvent('mechanic:setJob')
AddEventHandler('mechanic:setJob', function(job, grade)
    local xPlayer = ESX.GetPlayerFromId(source)
    
    if not xPlayer then
        return
    end
    
    if job == Config.MechanicJob then
        xPlayer.setJob(job, grade)
        TriggerClientEvent('esx:showNotification', source, 'You are now a mechanic!')
    end
end)

-- Parts Management Commands (Admin only)
RegisterCommand('addpart', function(source, args, rawCommand)
    local xPlayer = ESX.GetPlayerFromId(source)
    
    if not xPlayer or not xPlayer.getGroup() == 'admin' then
        TriggerClientEvent('esx:showNotification', source, 'You don\'t have permission to use this command!')
        return
    end
    
    if #args < 3 then
        TriggerClientEvent('esx:showNotification', source, 'Usage: /addpart [player] [part] [quantity]')
        return
    end
    
    local targetPlayer = ESX.GetPlayerFromId(tonumber(args[1]))
    local partId = args[2]
    local quantity = tonumber(args[3])
    
    if not targetPlayer then
        TriggerClientEvent('esx:showNotification', source, 'Player not found!')
        return
    end
    
    if not Config.Parts[partId] then
        TriggerClientEvent('esx:showNotification', source, 'Invalid part!')
        return
    end
    
    if quantity and quantity > 0 then
        targetPlayer.addInventoryItem(partId, quantity)
        TriggerClientEvent('esx:showNotification', source, 'Added ' .. quantity .. 'x ' .. partId .. ' to ' .. targetPlayer.getName())
        TriggerClientEvent('esx:showNotification', targetPlayer.source, 'You received ' .. quantity .. 'x ' .. Config.Parts[partId].label)
    else
        TriggerClientEvent('esx:showNotification', source, 'Invalid quantity!')
    end
end, false)

RegisterCommand('removepart', function(source, args, rawCommand)
    local xPlayer = ESX.GetPlayerFromId(source)
    
    if not xPlayer or not xPlayer.getGroup() == 'admin' then
        TriggerClientEvent('esx:showNotification', source, 'You don\'t have permission to use this command!')
        return
    end
    
    if #args < 3 then
        TriggerClientEvent('esx:showNotification', source, 'Usage: /removepart [player] [part] [quantity]')
        return
    end
    
    local targetPlayer = ESX.GetPlayerFromId(tonumber(args[1]))
    local partId = args[2]
    local quantity = tonumber(args[3])
    
    if not targetPlayer then
        TriggerClientEvent('esx:showNotification', source, 'Player not found!')
        return
    end
    
    if not Config.Parts[partId] then
        TriggerClientEvent('esx:showNotification', source, 'Invalid part!')
        return
    end
    
    if quantity and quantity > 0 then
        local item = targetPlayer.getInventoryItem(partId)
        if item and item.count >= quantity then
            targetPlayer.removeInventoryItem(partId, quantity)
            TriggerClientEvent('esx:showNotification', source, 'Removed ' .. quantity .. 'x ' .. partId .. ' from ' .. targetPlayer.getName())
            TriggerClientEvent('esx:showNotification', targetPlayer.source, quantity .. 'x ' .. Config.Parts[partId].label .. ' removed from your inventory')
        else
            TriggerClientEvent('esx:showNotification', source, 'Player doesn\'t have enough of that part!')
        end
    else
        TriggerClientEvent('esx:showNotification', source, 'Invalid quantity!')
    end
end, false)

-- Parts Shop Commands
RegisterCommand('parts', function(source, args, rawCommand)
    local xPlayer = ESX.GetPlayerFromId(source)
    
    if not xPlayer then
        return
    end
    
    if #args < 2 then
        TriggerClientEvent('esx:showNotification', source, 'Usage: /parts [part] [quantity]')
        return
    end
    
    local partId = args[1]
    local quantity = tonumber(args[2])
    
    if not Config.Parts[partId] then
        TriggerClientEvent('esx:showNotification', source, 'Invalid part! Available parts:')
        for partId, partData in pairs(Config.Parts) do
            TriggerClientEvent('esx:showNotification', source, partId .. ' - ' .. partData.label .. ' ($' .. partData.price .. ')')
        end
        return
    end
    
    if quantity and quantity > 0 then
        TriggerEvent('mechanic:buyPart', partId, quantity)
    else
        TriggerClientEvent('esx:showNotification', source, 'Invalid quantity!')
    end
end, false)

-- Mechanic Job Commands
RegisterCommand('setmechanic', function(source, args, rawCommand)
    local xPlayer = ESX.GetPlayerFromId(source)
    
    if not xPlayer or not xPlayer.getGroup() == 'admin' then
        TriggerClientEvent('esx:showNotification', source, 'You don\'t have permission to use this command!')
        return
    end
    
    if #args < 1 then
        TriggerClientEvent('esx:showNotification', source, 'Usage: /setmechanic [player]')
        return
    end
    
    local targetPlayer = ESX.GetPlayerFromId(tonumber(args[1]))
    
    if not targetPlayer then
        TriggerClientEvent('esx:showNotification', source, 'Player not found!')
        return
    end
    
    targetPlayer.setJob(Config.MechanicJob, 0)
    TriggerClientEvent('esx:showNotification', source, targetPlayer.getName() .. ' is now a mechanic!')
    TriggerClientEvent('esx:showNotification', targetPlayer.source, 'You are now a mechanic!')
end, false)

RegisterCommand('removemechanic', function(source, args, rawCommand)
    local xPlayer = ESX.GetPlayerFromId(source)
    
    if not xPlayer or not xPlayer.getGroup() == 'admin' then
        TriggerClientEvent('esx:showNotification', source, 'You don\'t have permission to use this command!')
        return
    end
    
    if #args < 1 then
        TriggerClientEvent('esx:showNotification', source, 'Usage: /removemechanic [player]')
        return
    end
    
    local targetPlayer = ESX.GetPlayerFromId(tonumber(args[1]))
    
    if not targetPlayer then
        TriggerClientEvent('esx:showNotification', source, 'Player not found!')
        return
    end
    
    if targetPlayer.job.name == Config.MechanicJob then
        targetPlayer.setJob('unemployed', 0)
        TriggerClientEvent('esx:showNotification', source, targetPlayer.getName() .. ' is no longer a mechanic!')
        TriggerClientEvent('esx:showNotification', targetPlayer.source, 'You are no longer a mechanic!')
    else
        TriggerClientEvent('esx:showNotification', source, targetPlayer.getName() .. ' is not a mechanic!')
    end
end, false)

-- Utility Functions
function GetPlayerParts(source)
    local xPlayer = ESX.GetPlayerFromId(source)
    
    if not xPlayer then
        return {}
    end
    
    local parts = {}
    
    for partId, _ in pairs(Config.Parts) do
        local item = xPlayer.getInventoryItem(partId)
        if item and item.count > 0 then
            parts[partId] = item.count
        end
    end
    
    return parts
end

function HasRequiredParts(source, requiredParts)
    local xPlayer = ESX.GetPlayerFromId(source)
    
    if not xPlayer then
        return false
    end
    
    for _, partId in ipairs(requiredParts) do
        local item = xPlayer.getInventoryItem(partId)
        if not item or item.count < 1 then
            return false
        end
    end
    
    return true
end

-- Export functions for other resources
exports('GetPlayerParts', GetPlayerParts)
exports('HasRequiredParts', HasRequiredParts)
exports('IsMechanic', function(source)
    local xPlayer = ESX.GetPlayerFromId(source)
    return xPlayer and xPlayer.job.name == Config.MechanicJob
end)