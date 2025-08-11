Config = {}

-- General Settings
Config.Debug = false
Config.Locale = 'en'

-- Job Settings
Config.MechanicJob = 'mechanic'
Config.RequireJob = true
Config.RequireJobGrade = 0

-- Location Settings
Config.Locations = {
    -- Main Mechanic Shop
    mainShop = {
        coords = vector3(-347.29, -133.37, 39.01),
        blip = {
            sprite = 446,
            color = 0,
            scale = 0.8,
            name = "Mechanic Shop"
        },
        marker = {
            type = 1,
            size = {x = 1.5, y = 1.5, z = 1.0},
            color = {r = 0, g = 150, b = 255, a = 100}
        }
    },
    
    -- Vehicle Lift Locations
    lifts = {
        {
            coords = vector3(-350.0, -130.0, 39.0),
            heading = 340.0,
            inUse = false
        },
        {
            coords = vector3(-355.0, -130.0, 39.0),
            heading = 340.0,
            inUse = false
        }
    },
    
    -- Parts Storage
    partsStorage = {
        coords = vector3(-360.0, -135.0, 39.0),
        marker = {
            type = 1,
            size = {x = 1.0, y = 1.0, z = 1.0},
            color = {r = 255, g = 165, b = 0, a = 100}
        }
    }
}

-- Repair Settings
Config.RepairSettings = {
    engineRepair = {
        time = 15000, -- 15 seconds
        cost = 500,
        requiredParts = {'engine_part'}
    },
    bodyRepair = {
        time = 10000, -- 10 seconds
        cost = 300,
        requiredParts = {'body_part'}
    },
    wheelRepair = {
        time = 8000, -- 8 seconds
        cost = 200,
        requiredParts = {'wheel_part'}
    },
    fullRepair = {
        time = 30000, -- 30 seconds
        cost = 1000,
        requiredParts = {'engine_part', 'body_part', 'wheel_part'}
    }
}

-- Parts System
Config.Parts = {
    engine_part = {
        label = "Engine Part",
        price = 250,
        weight = 2.0
    },
    body_part = {
        label = "Body Part",
        price = 150,
        weight = 1.5
    },
    wheel_part = {
        label = "Wheel Part",
        price = 100,
        weight = 1.0
    },
    oil = {
        label = "Motor Oil",
        price = 50,
        weight = 0.5
    }
}

-- Vehicle Classes that can be repaired
Config.RepairableVehicles = {
    [0] = true,   -- Compacts
    [1] = true,   -- Sedans
    [2] = true,   -- SUVs
    [3] = true,   -- Coupes
    [4] = true,   -- Muscle
    [5] = true,   -- Sports Classics
    [6] = true,   -- Sports
    [7] = true,   -- Super
    [8] = true,   -- Motorcycles
    [9] = true,   -- Off-road
    [10] = true,  -- Industrial
    [11] = true,  -- Utility
    [12] = true,  -- Vans
    [13] = true,  -- Cycles
    [14] = true,  -- Boats
    [15] = true,  -- Helicopters
    [16] = true,  -- Planes
    [17] = true,  -- Service
    [18] = true,  -- Emergency
    [19] = true,  -- Military
    [20] = true,  -- Commercial
    [21] = true   -- Trains
}

-- Notifications
Config.Notifications = {
    success = {
        title = "Success",
        type = "success"
    },
    error = {
        title = "Error",
        type = "error"
    },
    info = {
        title = "Information",
        type = "info"
    }
}