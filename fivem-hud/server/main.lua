-- Placeholder for future server-side logic (e.g., syncing, permissions)
RegisterCommand('hudversion', function(src)
  TriggerClientEvent('chat:addMessage', src, { args = { '^2HUD', 'Version 1.0.0' }})
end, false)

CreateThread(function()
  if GetResourceState('qb-core') ~= 'started' then return end
  local QBCore = exports['qb-core']:GetCoreObject()
  while true do
    Wait(2000)
    for _, src in ipairs(GetPlayers()) do
      local player = QBCore.Functions.GetPlayer(tonumber(src))
      if player then
        local cid = player.PlayerData.citizenid or '0'
        local cash = player.Functions.GetMoney and player.Functions.GetMoney('cash') or 0
        local bank = player.Functions.GetMoney and player.Functions.GetMoney('bank') or 0
        TriggerClientEvent('fivem-hud:wallet', src, { id = cid, cash = cash, bank = bank })
      end
    end
  end
end)