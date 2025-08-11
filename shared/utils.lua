-- Shared utility functions for the mechanic script

local Utils = {}

function Utils.debugLog(message)
  if Config and Config.Debug then
    print(('^4[advanced_mechanic]^7 %s'):format(message))
  end
end

function Utils.formatCurrency(amount)
  local formatted = tostring(math.floor(amount))
  local k
  while true do
    formatted, k = formatted:gsub('^(%-?%d+)(%d%d%d)', '%1,%2')
    if k == 0 then break end
  end
  return '$' .. formatted
end

function Utils.tableContains(tbl, value)
  for _, v in pairs(tbl) do
    if v == value then return true end
  end
  return false
end

function Utils.round(value, decimals)
  local power = 10 ^ (decimals or 0)
  return math.floor(value * power + 0.5) / power
end

function Utils.clamp(value, minVal, maxVal)
  if value < minVal then return minVal end
  if value > maxVal then return maxVal end
  return value
end

function Utils.getVehicleHealthPercent(engineHealth, bodyHealth)
  engineHealth = engineHealth or 1000.0
  bodyHealth = bodyHealth or 1000.0
  local enginePercent = Utils.clamp(engineHealth / 10.0, 0.0, 100.0)
  local bodyPercent = Utils.clamp(bodyHealth / 10.0, 0.0, 100.0)
  return Utils.round((enginePercent + bodyPercent) / 2.0, 1)
end

function Utils.isValidPart(partName)
  return Config and Config.Parts and Config.Parts[partName] ~= nil
end

function Utils.validatePartsTable(partsTable)
  if type(partsTable) ~= 'table' then return false end
  for name, qty in pairs(partsTable) do
    if not Utils.isValidPart(name) or type(qty) ~= 'number' or qty < 0 then
      return false
    end
  end
  return true
end

-- Expose as global for convenience in client/server without require()
_G.AM_Utils = Utils

return Utils