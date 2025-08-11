Config = {}

Config.Debug = true
Config.Locale = 'en'

-- ESX Job requirements
Config.MechanicJobName = 'mechanic'
Config.MinimumJobGrade = 0

-- Locations (example: Bennys area)
Config.Locations = {
  Shop = {
    coords = vector3(-211.55, -1324.55, 30.89),
    radius = 2.5,
    blip = { enabled = true, sprite = 446, color = 5, scale = 0.8, name = 'Mechanic Shop' },
    marker = { enabled = true, type = 1, color = { r = 0, g = 150, b = 255, a = 120 } }
  }
}

-- Repair definitions
Config.Repairs = {
  quick = { label = 'Quick Repair', time = 5000, cost = 500, parts = {} },
  engine = { label = 'Engine Overhaul', time = 15000, cost = 3000, parts = { engine_oil = 1, spark_plug = 4 } },
  body = { label = 'Body Repair', time = 12000, cost = 1200, parts = { metal_sheet = 2, repair_kit = 1 } }
}

-- Mechanic parts catalog (ensure items exist in ESX/inventory)
Config.Parts = {
  engine_oil = { label = 'Engine Oil', price = 100, weight = 1.0 },
  spark_plug = { label = 'Spark Plug', price = 50, weight = 0.2 },
  repair_kit = { label = 'Repair Kit', price = 500, weight = 2.0 },
  metal_sheet = { label = 'Metal Sheet', price = 200, weight = 3.0 }
}

-- Simple notification wrapper type
Config.Notification = {
  success = 'success',
  error = 'error',
  info = 'info'
}