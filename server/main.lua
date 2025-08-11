local ESX = exports['es_extended']:getSharedObject()
local Utils = require 'shared/utils'

-- Helpers
local function getPlayer(source)
    return ESX.GetPlayerFromId(source)
end

local function notify(src, msg)
    if Config.NotificationType == 'esx' then
        TriggerClientEvent('esx:showNotification', src, msg)
    else
        TriggerClientEvent('chat:addMessage', src, { args = { '[Mechanic]', msg } })
    end
end

local function hasRequiredParts(xPlayer, repairKey)
    local data = Config.Repairs[repairKey]
    if not data then return false, {} end
    local missing = {}
    for itemName, qty in pairs(data.parts or {}) do
        local item = xPlayer.getInventoryItem(itemName)
        if not item or (item.count or 0) < qty then
            table.insert(missing, (Config.Parts[itemName] and Config.Parts[itemName].label) or itemName)
        end
    end
    return #missing == 0, missing
end

-- Callbacks
ESX.RegisterServerCallback('mechanic:getPartsInventory', function(source, cb)
    local xPlayer = getPlayer(source)
    if not xPlayer then cb({}); return end
    local parts = {}
    for itemName, partData in pairs(Config.Parts) do
        local invItem = xPlayer.getInventoryItem(itemName)
        parts[#parts+1] = {
            name = itemName,
            label = partData.label,
            count = invItem and invItem.count or 0,
            price = partData.price
        }
    end
    cb(parts)
end)

ESX.RegisterServerCallback('mechanic:hasRequiredParts', function(source, cb, repairKey)
    local xPlayer = getPlayer(source)
    if not xPlayer then cb(false, {}); return end
    local hasParts, missing = hasRequiredParts(xPlayer, repairKey)
    cb(hasParts, missing)
end)

-- Events
RegisterNetEvent('mechanic:buyPart', function(itemName, quantity)
    local src = source
    local xPlayer = getPlayer(src)
    if not xPlayer then return end

    local qty = tonumber(quantity) or 1
    if qty < 1 then qty = 1 end

    local part = Config.Parts[itemName]
    if not part then
        notify(src, 'Invalid part')
        return
    end

    local price = part.price * qty
    if xPlayer.getMoney() >= price then
        xPlayer.removeMoney(price)
        xPlayer.addInventoryItem(itemName, qty)
        notify(src, ('Purchased %sx %s for $%s'):format(qty, part.label, Utils.formatCurrency(price)))
    else
        notify(src, 'Not enough money')
    end
end)

RegisterNetEvent('mechanic:consumeParts', function(parts)
    local src = source
    local xPlayer = getPlayer(src)
    if not xPlayer then return end

    for itemName, qty in pairs(parts or {}) do
        if qty > 0 then
            xPlayer.removeInventoryItem(itemName, qty)
        end
    end
end)

-- Admin utilities
RegisterCommand('addpart', function(source, args)
    local src = source
    if src == 0 then return end
    local xPlayer = getPlayer(src)
    if not xPlayer then return end

    local item, qty = tostring(args[1] or ''), tonumber(args[2] or '1')
    if not Config.Parts[item] then notify(src, 'Invalid part name'); return end
    if qty < 1 then qty = 1 end

    xPlayer.addInventoryItem(item, qty)
    notify(src, ('Given %sx %s'):format(qty, Config.Parts[item].label))
end, true)

RegisterCommand('removepart', function(source, args)
    local src = source
    if src == 0 then return end
    local xPlayer = getPlayer(src)
    if not xPlayer then return end

    local item, qty = tostring(args[1] or ''), tonumber(args[2] or '1')
    if not Config.Parts[item] then notify(src, 'Invalid part name'); return end
    if qty < 1 then qty = 1 end

    xPlayer.removeInventoryItem(item, qty)
    notify(src, ('Removed %sx %s'):format(qty, Config.Parts[item].label))
end, true)

RegisterCommand('setmechanic', function(source, args)
    local src = source
    local targetId = tonumber(args[1] or '')
    local grade = tonumber(args[2] or Config.RequiredJobGrade)

    if not targetId then
        notify(src, 'Usage: /setmechanic [id] [grade]')
        return
    end

    local xTarget = getPlayer(targetId)
    if not xTarget then
        notify(src, 'Player not online')
        return
    end

    xTarget.setJob(Config.MechanicJobName, grade)
    notify(src, ('Set %s as mechanic (grade %s)'):format(xTarget.getName(), grade))
    notify(targetId, 'You are now a mechanic!')
end, true)

RegisterCommand('removemechanic', function(source, args)
    local src = source
    local targetId = tonumber(args[1] or '')
    if not targetId then
        notify(src, 'Usage: /removemechanic [id]')
        return
    end

    local xTarget = getPlayer(targetId)
    if not xTarget then
        notify(src, 'Player not online')
        return
    end

    xTarget.setJob('unemployed', 0)
    notify(src, ('Removed mechanic job from %s'):format(xTarget.getName()))
    notify(targetId, 'You are no longer a mechanic.')
end, true)