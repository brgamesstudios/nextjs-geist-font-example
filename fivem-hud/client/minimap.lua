local MM_UseMinimap = Config.UseMinimap
local MM_Circle = Config.CircleMinimap
local MM_RadarAlwaysOn = Config.RadarAlwaysOn
local MM_RadarOnFoot = Config.RadarOnFoot
local MM_RadarZoom = Config.RadarZoom

local function setupCircleMinimap()
  SetMinimapClipType(1)
  SetMinimapComponentPosition('minimap', 'L', 'B', 0.015, 0.02, 0.18, 0.30)
  SetMinimapComponentPosition('minimap_mask', 'L', 'B', 0.155, 0.12, 0.08, 0.16)
  SetMinimapComponentPosition('minimap_blur', 'L', 'B', 0.00, 0.00, 0.25, 0.35)
end

local function setupSquareMinimap()
  SetMinimapClipType(0)
end

RegisterNetEvent('fivem-hud:applyPrefs', function(p)
  if type(p) ~= 'table' then return end
  if p.useMinimap ~= nil then MM_UseMinimap = p.useMinimap end
  if p.circleMinimap ~= nil then MM_Circle = p.circleMinimap end
  if p.radarAlwaysOn ~= nil then MM_RadarAlwaysOn = p.radarAlwaysOn end
  if p.radarOnFoot ~= nil then MM_RadarOnFoot = p.radarOnFoot end
  if p.radarZoom ~= nil then MM_RadarZoom = p.radarZoom end
  if MM_UseMinimap then
    if MM_Circle then setupCircleMinimap() else setupSquareMinimap() end
  end
end)

CreateThread(function()
  Wait(0)
  if MM_UseMinimap then
    if MM_Circle then setupCircleMinimap() else setupSquareMinimap() end
  end
end)

CreateThread(function()
  while true do
    if MM_UseMinimap then
      local ped = PlayerPedId()
      local inVehicle = IsPedInAnyVehicle(ped, false)
      local show = Config.RadarAlwaysOn or (inVehicle or Config.RadarOnFoot)
      DisplayRadar(show)
      if show and MM_RadarZoom then SetRadarZoom(MM_RadarZoom) end
    else
      DisplayRadar(false)
    end

    if Config.HideDefaultHud then
      DisplayHud(false)
      -- Hide various default components
      HideHudComponentThisFrame(1)   -- Wanted Stars
      HideHudComponentThisFrame(2)   -- Weapon Icon
      HideHudComponentThisFrame(3)   -- Cash
      HideHudComponentThisFrame(4)   -- MP Cash
      HideHudComponentThisFrame(6)   -- Vehicle Name
      HideHudComponentThisFrame(7)   -- Area Name
      HideHudComponentThisFrame(8)   -- Vehicle Class
      HideHudComponentThisFrame(9)   -- Street Name
      HideHudComponentThisFrame(13)  -- Cash Change
      HideHudComponentThisFrame(14)  -- Reticle
      HideHudComponentThisFrame(17)  -- Save Game
      HideHudComponentThisFrame(20)  -- Weapon Stats
      HideHudComponentThisFrame(21)  -- HUD Components
      HideHudComponentThisFrame(22)  -- Wanted Stars (alt)
    end

    SetBigmapActive(false, false)
    Wait(0)
  end
end)