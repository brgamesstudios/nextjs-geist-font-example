# fivem-hud

Lightweight standalone FiveM HUD using NUI (HTML/CSS/JS) and Lua. Shows speedometer, health/armor, compass, street/zone, and voice indicator. Includes /hud and /seatbelt toggles.

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
- Configurable MPH/KMH and speed thresholds

## Commands & Keys
- `/hud` or `H`: toggle HUD visibility
- `/seatbelt` or `B`: toggle seatbelt indicator

## Configuration
Edit `config.lua`:
- `ToggleKey`: default HUD toggle key
- `MetricSpeed`: false = MPH, true = KMH
- `SpeedWarn`, `SpeedDanger`: color thresholds
- `ShowCompass`, `ShowStreetZone`, `UseVoice`, `UseSeatbelt`
- `TickMs`, `StreetRefreshMs`

## Notes
- If you use a framework providing stress/needs, wire it in `client/main.lua` where `stress = 0` is sent.
- Voice levels map: W=whisper, N=normal, S=shout (X reserved).