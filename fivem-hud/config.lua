Config = {}

-- General
Config.ToggleKey = 'H'            -- default HUD toggle key (also has /hud command)
Config.UseStress = true           -- QBCore: uses PlayerData.metadata.stress if available
Config.UseVoice = true            -- show voice indicator box
Config.UseSeatbelt = true         -- show seatbelt indicator when in vehicle
Config.SeatbeltFromQB = true      -- prefer LocalPlayer.state['seatbelt'] when using QBCore
Config.SeatbeltStateKey = 'seatbelt'
Config.ShowCompass = true
Config.ShowStreetZone = true
Config.MetricSpeed = false        -- false = mph, true = km/h

-- Update rates (ms)
Config.TickMs = 100               -- main HUD update
Config.StreetRefreshMs = 500

-- Speedometer thresholds
Config.SpeedWarn = 80             -- mph or km/h depending on MetricSpeed
Config.SpeedDanger = 120

-- NUI
Config.HudStartVisible = true