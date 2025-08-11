local function setupCircleMinimap()
  -- Switch to circular radar
  SetMinimapClipType(1)
  -- Positions tuned for 16:9; GTA handles scaling. Adjust if needed.
  -- Minimap rectangle
  SetMinimapComponentPosition('minimap', 'L', 'B', 0.015, 0.02, 0.18, 0.30)
  -- Mask to make it circular
  SetMinimapComponentPosition('minimap_mask', 'L', 'B', 0.155, 0.12, 0.08, 0.16)
  -- Blur behind
  SetMinimapComponentPosition('minimap_blur', 'L', 'B', 0.00, 0.00, 0.25, 0.35)
end

local function setupSquareMinimap()
  SetMinimapClipType(0)
end

CreateThread(function()
  Wait(0)
  if Config.UseMinimap then
    if Config.CircleMinimap then
      setupCircleMinimap()
    else
      setupSquareMinimap()
    end
  end
end)

CreateThread(function()
  while true do
    if Config.UseMinimap then
      local ped = PlayerPedId()
      local inVehicle = IsPedInAnyVehicle(ped, false)
      local show = Config.RadarAlwaysOn or (inVehicle or Config.RadarOnFoot)
      DisplayRadar(show)
      if show and Config.RadarZoom then
        SetRadarZoom(Config.RadarZoom)
      end
    else
      DisplayRadar(false)
    end

    -- Hide some default HUD components if we're showing our own
    -- 1: WANTED_STARS, 2: WEAPON_ICON, 3: CASH, 7: AREA_NAME, 9: STREET_NAME, 13: CASH_CHANGE, 22: VEHICLE_NAME
    HideHudComponentThisFrame(1)
    HideHudComponentThisFrame(2)
    HideHudComponentThisFrame(3)
    HideHudComponentThisFrame(7)
    HideHudComponentThisFrame(9)
    HideHudComponentThisFrame(13)
    HideHudComponentThisFrame(22)

    Wait(0)
  end
end)