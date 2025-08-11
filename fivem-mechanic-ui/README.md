# FiveM Mechanic UI (Standalone)

A simple NUI-based mechanic interface for FiveM to repair, clean, tweak colors, extras, and basic performance mods.

## Install

1. Copy the `fivem-mechanic-ui` folder into your server's `resources` directory.
2. Add the following to your `server.cfg`:

```
ensure fivem-mechanic-ui
```

3. (Optional) Configure permissions in `config.lua`:
   - `Config.AllowEveryone = true` (default) lets anyone open it
   - Set `Config.RequireAcePermission = true` and grant ACE:

```
add_ace group.admin mechanic.ui allow
# or for a specific identifier:
add_principal identifier.steam:110000112345678 group.admin
```

## Usage

- Press F6 or run `/mekanik` or `/mechanicui` to open the UI.
- Must be in a vehicle or within 5 meters of one.

## Features

- Repair and clean
- Set primary/secondary/pearlescent/wheel colors (numeric GTA color indices)
- Toggle available extras
- Apply basic performance mods or revert to stock

## Notes

- This is standalone and does not require any framework.
- Changes are applied immediately and are not persisted to garages.
- You may adapt for job restrictions by swapping ACE checks or integrating with your framework.