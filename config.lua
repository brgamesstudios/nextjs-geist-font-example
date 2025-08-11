Config = {}

-- General
Config.Debug = false
Config.Locale = 'en'

-- ESX/Jobs
Config.MechanicJobName = 'mechanic'
Config.RequiredJobGrade = 0

-- Progress settings
Config.UseProgressBarsExport = true -- if true, will attempt to use exports['progressBars']:custom or :startUI; otherwise uses built-in NUI progress
Config.ProgressCancelKey = 73 -- INPUT_VEH_DUCK / X

-- Blips & Markers
Config.MainShop = {
    coords = vec3(-211.55, -1324.55, 30.90),
    blip = {sprite = 402, color = 3, scale = 0.9, name = 'Mechanic Shop'},
    marker = {type = 1, scale = vec3(1.2, 1.2, 0.8), color = {r=0,g=150,b=255,a=180}}
}

Config.PartsStorage = {
    coords = vec3(-209.65, -1320.15, 30.90),
    marker = {type = 2, scale = vec3(1.0, 1.0, 0.8), color = {r=255,g=165,b=0,a=180}}
}

Config.Lifts = {
    {
        name = 'Lift A',
        coords = vec3(-202.90, -1324.80, 30.90),
        liftHeight = 1.5,
        marker = {type = 27, scale = vec3(1.2, 1.2, 0.8), color = {r=0,g=255,b=100,a=180}}
    },
    {
        name = 'Lift B',
        coords = vec3(-199.70, -1317.80, 30.90),
        liftHeight = 1.5,
        marker = {type = 27, scale = vec3(1.2, 1.2, 0.8), color = {r=0,g=255,b=100,a=180}}
    }
}

-- Repair types
-- Each repair defines time (ms), baseCost, and required parts (item -> quantity)
Config.Repairs = {
    engine = { label = 'Engine Overhaul', time = 15000, baseCost = 1500, parts = { engine_oil = 1, spark_plug = 4, timing_belt = 1 } },
    body = { label = 'Body Repair', time = 12000, baseCost = 1200, parts = { body_kit = 1, metal_sheet = 2, screw = 10 } },
    brakes = { label = 'Brake Service', time = 9000, baseCost = 900, parts = { brake_pad = 4, brake_fluid = 1 } },
    tyres = { label = 'Tyre Replacement', time = 8000, baseCost = 800, parts = { tyre = 4, wheel_weight = 4 } },
    quick = { label = 'Quick Fix', time = 5000, baseCost = 300, parts = { duct_tape = 2 } }
}

-- Parts shop list and pricing
Config.Parts = {
    engine_oil = { label = 'Engine Oil', price = 150, weight = 1.0 },
    spark_plug = { label = 'Spark Plug', price = 75, weight = 0.1 },
    timing_belt = { label = 'Timing Belt', price = 250, weight = 0.8 },
    body_kit = { label = 'Body Kit', price = 500, weight = 3.0 },
    metal_sheet = { label = 'Metal Sheet', price = 120, weight = 2.0 },
    screw = { label = 'Screws', price = 10, weight = 0.1 },
    brake_pad = { label = 'Brake Pad', price = 90, weight = 0.5 },
    brake_fluid = { label = 'Brake Fluid', price = 80, weight = 0.5 },
    tyre = { label = 'Tyre', price = 200, weight = 3.0 },
    wheel_weight = { label = 'Wheel Weight', price = 25, weight = 0.1 },
    duct_tape = { label = 'Duct Tape', price = 20, weight = 0.2 }
}

-- Vehicles that can be repaired (by class)
Config.RepairableVehicleClasses = {
    [0]=true,[1]=true,[2]=true,[3]=true,[4]=true,[5]=true,[6]=true,[7]=true,[8]=false,[9]=true,[10]=true,[11]=true,[12]=true,[13]=true,[14]=false,[15]=true,[16]=true,[17]=true,[18]=true,[19]=true,[20]=true,[21]=true
}

-- Notifications
-- 'esx' uses ESX notifications, 'chat' uses chat messages
Config.NotificationType = 'esx'

-- Helper text
Config.Text = {
    press_e_open = 'Press E to open Mechanic Menu',
    press_e_lift = 'Press E to use the vehicle lift',
    press_e_storage = 'Press E to open Parts Storage',
    not_mechanic = 'You must be a mechanic to do this.',
    no_vehicle = 'No nearby vehicle found.',
    repairing = 'Repair in progress...'
}