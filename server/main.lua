local okUtils, Utils = pcall(require, 'shared.utils')
if not okUtils then Utils = _G.AM_Utils or {} end

local ESX
CreateThread(function()
  if GetResourceState('es_extended') == 'started' then
    if exports and exports['es_extended'] and exports['es_extended'].getSharedObject then
      ESX = exports['es_extended']:getSharedObject()
    end
  end
  if not ESX then
    TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)
  end
end)

local function getXPlayer(sourceId)
  if ESX and ESX.GetPlayerFromId then
    return ESX.GetPlayerFromId(sourceId)
  end
  return nil
end

local function getPlayerParts(xPlayer)
  local parts = {}
  for partName, _ in pairs(Config.Parts) do
    local count = 0
    if xPlayer and xPlayer.getInventoryItem then
      local item = xPlayer.getInventoryItem(partName)
      if item and item.count then count = item.count end
    end
    parts[partName] = count
  end
  return parts
end

local function hasRequiredParts(xPlayer, required)
  if type(required) ~= 'table' then return true end
  for partName, amount in pairs(required) do
    if amount > 0 then
      local have = 0
      if xPlayer and xPlayer.getInventoryItem then
        local item = xPlayer.getInventoryItem(partName)
        have = (item and item.count) or 0
      end
      if have < amount then return false end
    end
  end
  return true
end

-- Defer callback registration until ESX is available
CreateThread(function()
  while ESX == nil or ESX.RegisterServerCallback == nil do Wait(50) end

  ESX.RegisterServerCallback('advanced_mechanic:getParts', function(source, cb)
    local xPlayer = getXPlayer(source)
    cb(getPlayerParts(xPlayer))
  end)

  ESX.RegisterServerCallback('advanced_mechanic:hasRequiredParts', function(source, cb, required)
    local xPlayer = getXPlayer(source)
    cb(hasRequiredParts(xPlayer, required))
  end)
end)

-- Events
RegisterNetEvent('advanced_mechanic:buyPart', function(partName, quantity)
  local src = source
  local xPlayer = getXPlayer(src)

  partName = tostring(partName or '')
  quantity = tonumber(quantity or 1) or 1

  if not Config.Parts[partName] or quantity <= 0 then
    TriggerClientEvent('advanced_mechanic:notify', src, 'Invalid part selection.', Config.Notification.error)
    return
  end

  local unitPrice = Config.Parts[partName].price or 0
  local total = unitPrice * quantity

  if xPlayer and xPlayer.getMoney and xPlayer.removeMoney and xPlayer.addInventoryItem then
    if xPlayer.getMoney() < total then
      TriggerClientEvent('advanced_mechanic:notify', src, 'Not enough cash.', Config.Notification.error)
      return
    end

    xPlayer.removeMoney(total)
    xPlayer.addInventoryItem(partName, quantity)

    local msg = ('Purchased %dx %s for %s'):format(quantity, Config.Parts[partName].label or partName, Utils.formatCurrency(total))
    TriggerClientEvent('advanced_mechanic:notify', src, msg, Config.Notification.success)
    TriggerClientEvent('advanced_mechanic:partsUpdated', src, getPlayerParts(xPlayer))
  else
    -- Fallback (no ESX inventory), simply notify
    TriggerClientEvent('advanced_mechanic:notify', src, 'Purchase simulated (ESX not available).', Config.Notification.info)
  end
end)

RegisterNetEvent('advanced_mechanic:consumeParts', function(repairType)
  local src = source
  local xPlayer = getXPlayer(src)

  local repair = Config.Repairs[repairType]
  if not repair then return end

  if xPlayer and xPlayer.removeInventoryItem then
    for partName, amount in pairs(repair.parts or {}) do
      if amount > 0 then
        xPlayer.removeInventoryItem(partName, amount)
      end
    end
  end

  TriggerClientEvent('advanced_mechanic:partsUpdated', src, getPlayerParts(xPlayer))
end)