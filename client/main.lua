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

local isUiOpen = false

local function isMechanic()
  if not ESX or not ESX.GetPlayerData then return false end
  local playerData = ESX.GetPlayerData()
  if not playerData or not playerData.job then return false end
  return playerData.job.name == Config.MechanicJobName and playerData.job.grade >= Config.MinimumJobGrade
end

local function getVehicleData()
  local ped = PlayerPedId()
  local vehicle = GetVehiclePedIsIn(ped, false)
  if vehicle == 0 then
    vehicle = GetVehiclePedIsIn(ped, true)
  end
  if vehicle == 0 then
    -- Try vehicle in front of player
    local coords = GetEntityCoords(ped)
    local forward = GetEntityForwardVector(ped)
    local target = coords + forward * 3.0
    local ray = StartShapeTestRay(coords.x, coords.y, coords.z, target.x, target.y, target.z, 10, ped, 0)
    local _, hit, endCoords, surfaceNormal, entityHit = GetShapeTestResult(ray)
    if entityHit and entityHit ~= 0 and IsEntityAVehicle(entityHit) then
      vehicle = entityHit
    end
  end

  if vehicle == 0 then return { hasVehicle = false } end

  local engineHealth = GetVehicleEngineHealth(vehicle)
  local bodyHealth = GetVehicleBodyHealth(vehicle)
  local healthPercent = Utils.getVehicleHealthPercent and Utils.getVehicleHealthPercent(engineHealth, bodyHealth) or 100.0
  local displayName = GetDisplayNameFromVehicleModel(GetEntityModel(vehicle))
  local plate = GetVehicleNumberPlateText(vehicle)

  return {
    hasVehicle = true,
    plate = plate or 'UNKNOWN',
    model = displayName or 'VEHICLE',
    engineHealth = engineHealth,
    bodyHealth = bodyHealth,
    healthPercent = healthPercent
  }
end

local function sendNotification(msg, type)
  SendNUIMessage({ action = 'notification', message = msg, type = type or Config.Notification.info })
end

local function requestAndSendParts()
  if not ESX or not ESX.TriggerServerCallback then return end
  ESX.TriggerServerCallback('advanced_mechanic:getParts', function(parts)
    SendNUIMessage({ action = 'updatePartsInventory', parts = parts or {} })
  end)
end

local function openMechanicUi()
  if isUiOpen then return end
  isUiOpen = true
  SetNuiFocus(true, true)
  SendNUIMessage({ action = 'show' })
  -- seed data
  SendNUIMessage({ action = 'updateVehicleData', data = getVehicleData() })
  requestAndSendParts()
end

local function closeMechanicUi()
  if not isUiOpen then return end
  isUiOpen = false
  SetNuiFocus(false, false)
  SendNUIMessage({ action = 'hide' })
end

RegisterCommand('mechanic', function()
  if not isMechanic() then
    sendNotification('You must be a mechanic to use this.', Config.Notification.error)
    return
  end
  openMechanicUi()
end)

RegisterNUICallback('nui:action', function(data, cb)
  cb = cb or function() end
  if not data or not data.type then cb({ ok = false, error = 'invalid_payload' }) return end

  if data.type == 'close' then
    closeMechanicUi()
    cb({ ok = true })
    return
  end

  if data.type == 'requestVehicleData' then
    SendNUIMessage({ action = 'updateVehicleData', data = getVehicleData() })
    cb({ ok = true })
    return
  end

  if data.type == 'requestParts' then
    requestAndSendParts()
    cb({ ok = true })
    return
  end

  if data.type == 'buyPart' then
    local part = tostring(data.part or '')
    local quantity = tonumber(data.quantity or 1) or 1
    if not part or part == '' then cb({ ok = false, error = 'invalid_part' }) return end
    TriggerServerEvent('advanced_mechanic:buyPart', part, quantity)
    SetTimeout(300, requestAndSendParts)
    cb({ ok = true })
    return
  end

  if data.type == 'repair' then
    if not data.repairType or not Config.Repairs[data.repairType] then
      cb({ ok = false, error = 'invalid_repair' })
      return
    end

    local repair = Config.Repairs[data.repairType]
    if not ESX or not ESX.TriggerServerCallback then
      cb({ ok = false, error = 'esx_missing' })
      return
    end

    ESX.TriggerServerCallback('advanced_mechanic:hasRequiredParts', function(hasParts)
      if not hasParts then
        sendNotification('You do not have the required parts.', Config.Notification.error)
        cb({ ok = false, error = 'missing_parts' })
        return
      end

      -- start progress feedback
      SendNUIMessage({ action = 'showProgress', label = repair.label, duration = repair.time })

      local vehicleData = getVehicleData()
      if not vehicleData.hasVehicle then
        sendNotification('No vehicle found nearby.', Config.Notification.error)
        SendNUIMessage({ action = 'hideProgress' })
        cb({ ok = false, error = 'no_vehicle' })
        return
      end

      local ped = PlayerPedId()
      TaskTurnPedToFaceEntity(ped, ped, 500)

      SetTimeout(repair.time, function()
        -- consume parts and apply repair results on server
        TriggerServerEvent('advanced_mechanic:consumeParts', data.repairType)

        local vehicle = GetVehiclePedIsIn(ped, false)
        if vehicle == 0 then vehicle = GetVehiclePedIsIn(ped, true) end
        if vehicle ~= 0 then
          SetVehicleFixed(vehicle)
          SetVehicleDirtLevel(vehicle, 0.0)
          SetVehicleEngineHealth(vehicle, 1000.0)
          SetVehicleBodyHealth(vehicle, 1000.0)
        end

        SendNUIMessage({ action = 'hideProgress' })
        sendNotification(('Repair complete: %s'):format(repair.label), Config.Notification.success)
        SendNUIMessage({ action = 'updateVehicleData', data = getVehicleData() })
        requestAndSendParts()
      end)

      cb({ ok = true })
    end, Config.Repairs[data.repairType].parts)

    return
  end

  cb({ ok = false, error = 'unknown_action' })
end)

-- Server -> Client updates
RegisterNetEvent('advanced_mechanic:notify', function(message, type)
  sendNotification(message, type)
end)

RegisterNetEvent('advanced_mechanic:partsUpdated', function(parts)
  SendNUIMessage({ action = 'updatePartsInventory', parts = parts or {} })
end)