-- Placeholder for future server-side logic (e.g., syncing, permissions)
RegisterCommand('hudversion', function(src)
  TriggerClientEvent('chat:addMessage', src, { args = { '^2HUD', 'Version 1.0.0' }})
end, false)