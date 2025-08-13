# fivem-hud

Lightweight standalone FiveM HUD using NUI (HTML/CSS/JS) and Lua. Shows speedometer, health/armor, compass, street/zone, voice indicator, and optional QBCore stress. Includes /hud and /seatbelt toggles.

## Install
- Place the `fivem-hud` folder in your server's `resources` directory.
- Ensure it in your `server.cfg`:
  
  ```cfg
  ensure fivem-hud
  ```

## Features
- Health and armor bars
- Vehicle block with speed, gear, rpm, seatbelt
- Compass and street/zone
- Voice state indicator (basic, supports `pma-voice` if present)
- QBCore stress bar (reads `PlayerData.metadata.stress`)

## QBCore Compatibility
- The resource auto-detects `qb-core` and, if present:
  - Reads stress from `PlayerData.metadata.stress`
  - Prefers seatbelt state from `LocalPlayer.state['seatbelt']` (fallback to manual /seatbelt if not present)
- You can disable either in `config.lua`.

## Commands & Keys
- `/hud` or `H`: toggle HUD visibility
- `/seatbelt` or `B`: toggle seatbelt indicator (disabled if `SeatbeltFromQB = true`)

## Configuration
Edit `config.lua`:
- `ToggleKey`: default HUD toggle key
- `MetricSpeed`: false = MPH, true = KMH
- `SpeedWarn`, `SpeedDanger`: color thresholds
- `ShowCompass`, `ShowStreetZone`, `UseVoice`, `UseSeatbelt`
- `UseStress`: enable QBCore stress bar
- `SeatbeltFromQB`, `SeatbeltStateKey`: read seatbelt from QBCore state bag
- `TickMs`, `StreetRefreshMs`

## Notes
- If you use other frameworks for stress, adapt where `stress` is sent in `client/main.lua`.
- Voice levels map: W=whisper, N=normal, S=shout (X reserved).