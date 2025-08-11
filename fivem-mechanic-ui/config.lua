Config = {}

-- Keybind to open the UI (also accessible via the /mekanik command)
Config.KeyMappingCommand = 'open_mechanic_ui'
Config.KeyMappingLabel = 'Open Mechanic UI'
Config.KeyMappingDefault = 'F6'

-- Permissions
Config.RequireAcePermission = false
Config.AcePermission = 'mechanic.ui'

-- Allow everyone without ACE when true
Config.AllowEveryone = true

-- Distance to interact with nearest vehicle when not inside one
Config.MaxVehicleDistance = 5.0

-- Framework integration (QBCore)
Config.Framework = {
  UseQBCore = true,                -- Enable QBCore checks
  MechanicJobRequired = true,      -- Require being a mechanic to open UI
  JobName = 'mechanic',            -- QBCore job name
  OnDutyRequired = true,           -- Require on-duty
  AllowedGrades = {}               -- Empty = any grade. You can set { [0]=true, [1]=true } or { trainee=true, boss=true }
}