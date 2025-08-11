# FiveM Mechanic UI (Standalone / QBCore)

A simple NUI-based mechanic interface for FiveM to repair, clean, tweak colors, extras, and basic performance mods.

## Install

1. Copy the `fivem-mechanic-ui` folder into your server's `resources` directory.
2. Add the following to your `server.cfg`:

```
ensure fivem-mechanic-ui
```

## Configuration

Edit `config.lua`.

- General:
  - `Config.AllowEveryone` and `Config.RequireAcePermission` for standalone ACE mode
- QBCore:
  - `Config.Framework.UseQBCore = true`
  - `Config.Framework.MechanicJobRequired = true`
  - `Config.Framework.JobName = 'mechanic'` (adjust to your job name)
  - `Config.Framework.OnDutyRequired = true`
  - `Config.Framework.AllowedGrades = {}` (empty = any grade; or set keys like `[0]=true` or `boss=true`)

> Note: If QBCore is enabled but not found, access falls back to standalone config.

## Usage

- Press F6 or run `/mekanik` or `/mechanicui` to open the UI.
- Must be in a vehicle or within 5 meters of one.
- If QBCore gating is enabled, players must meet job rules (and be on duty if required).

## Features

- Repair and clean
- Set primary/secondary/pearlescent/wheel colors (numeric GTA color indices)
- Toggle available extras
- Apply basic performance mods or revert to stock

## Notes

- Standalone and QBCore-friendly
- Changes are applied immediately and are not persisted to garages
- You can integrate with your own billing/parts/inventory systems by hooking into NUI callbacks on the client/server