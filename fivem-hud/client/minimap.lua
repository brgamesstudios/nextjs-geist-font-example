local MM_UseMinimap = Config.UseMinimap
local MM_Circle = Config.CircleMinimap
local MM_RadarAlwaysOn = Config.RadarAlwaysOn
local MM_RadarOnFoot = Config.RadarOnFoot
local MM_RadarZoom = Config.RadarZoom
local MM_ShowDefault = Config.ShowDefaultRadar
local MM_Scale = Config.MinimapScale or 1.0

local function setupCircleMinimap()
  SetMinimapClipType(1)
  local w = 0.18 * MM_Scale
  local h = 0.30 * MM_Scale
  SetMinimapComponentPosition('minimap', 'L', 'B', 0.015, 0.02, w, h)
  SetMinimapComponentPosition('minimap_mask', 'L', 'B', 0.155, 0.12, 0.08 * MM_Scale, 0.16 * MM_Scale)
  SetMinimapComponentPosition('minimap_blur', 'L', 'B', 0.00, 0.00, 0.25 * MM_Scale, 0.35 * MM_Scale)
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
  if p.minimapScale ~= nil then MM_Scale = p.minimapScale end
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
      local show = (MM_ShowDefault and (MM_RadarAlwaysOn or inVehicle or MM_RadarOnFoot))
      DisplayRadar(show)
      if show and MM_RadarZoom then SetRadarZoom(MM_RadarZoom) end
    else
      DisplayRadar(false)
    end

    if Config.HideDefaultHud then
      DisplayHud(false)
      HideHudComponentThisFrame(1)
      HideHudComponentThisFrame(2)
      HideHudComponentThisFrame(3)
      HideHudComponentThisFrame(4)
      HideHudComponentThisFrame(6)
      HideHudComponentThisFrame(7)
      HideHudComponentThisFrame(8)
      HideHudComponentThisFrame(9)
      HideHudComponentThisFrame(13)
      HideHudComponentThisFrame(14)
      HideHudComponentThisFrame(17)
      HideHudComponentThisFrame(20)
      HideHudComponentThisFrame(21)
      HideHudComponentThisFrame(22)
    end

    SetBigmapActive(false, false)
    Wait(0)
  end
end)