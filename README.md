# FiveM QBCore Mechanic UI

A modern, responsive web-based mechanic interface for FiveM servers using QBCore framework. This UI provides mechanics with a comprehensive dashboard to manage vehicle repairs, parts inventory, and customer requests.

## Features

### 🏠 Dashboard
- **Vehicle Overview**: Complete vehicle information including plate, model, owner, and last service
- **Health Monitoring**: Real-time vehicle component health status with visual indicators
- **Quick Actions**: Fast access to common mechanic tasks
- **Recent Activity**: Track recent repairs and maintenance work

### 🔧 Vehicle Repair
- **Component Repair**: Individual repair system for engine, body, transmission, brakes, suspension, and fuel system
- **Real-time Progress**: Visual repair progress with time and cost calculations
- **Repair History**: Complete log of all repairs performed
- **Cost Estimation**: Automatic calculation of repair costs based on component damage

### 📦 Parts Inventory
- **Stock Management**: Track part quantities, conditions, and values
- **Search & Filter**: Advanced filtering by condition, price, and availability
- **Low Stock Alerts**: Automatic notifications for parts running low
- **Add/Remove Parts**: Easy inventory management with modal forms

### 📋 Customer Requests
- **Request Management**: Create and track customer repair requests
- **Priority System**: Urgent, high, medium, and low priority levels
- **Status Tracking**: Pending, in-progress, completed, and cancelled states
- **Customer Details**: Complete customer and vehicle information

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- FiveM server with QBCore framework

### Setup
1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build
```bash
npm run build
npm start
```

## Integration with FiveM QBCore

### QBCore Events
This UI is designed to work with QBCore events. You'll need to implement the following events in your FiveM server:

#### Client Events
```lua
-- Open mechanic UI
RegisterNetEvent('qb-mechanic:openUI')
AddEventHandler('qb-mechanic:openUI', function()
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = "openMechanicUI"
    })
end)

-- Update vehicle data
RegisterNetEvent('qb-mechanic:updateVehicle')
AddEventHandler('qb-mechanic:updateVehicle', function(vehicleData)
    SendNUIMessage({
        action = "updateVehicle",
        data = vehicleData
    })
end)
```

#### Server Events
```lua
-- Get vehicle data
RegisterNetEvent('qb-mechanic:getVehicleData')
AddEventHandler('qb-mechanic:getVehicleData', function(plate)
    local vehicle = QBCore.Functions.GetVehicleByPlate(plate)
    if vehicle then
        local vehicleData = {
            id = vehicle.id,
            plate = vehicle.plate,
            model = vehicle.model,
            health = vehicle.engineHealth,
            fuel = vehicle.fuelLevel,
            engine = vehicle.engineHealth,
            body = vehicle.bodyHealth,
            transmission = vehicle.transmissionHealth,
            brakes = vehicle.brakeHealth,
            suspension = vehicle.suspensionHealth,
            owner = vehicle.owner,
            lastService = vehicle.lastService
        }
        TriggerClientEvent('qb-mechanic:vehicleData', source, vehicleData)
    end
end)

-- Complete repair
RegisterNetEvent('qb-mechanic:completeRepair')
AddEventHandler('qb-mechanic:completeRepair', function(plate, component, cost)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if Player.PlayerData.job.name == "mechanic" then
        -- Update vehicle health
        -- Deduct money from customer
        -- Log repair activity
        TriggerClientEvent('QBCore:Notify', src, 'Repair completed successfully!', 'success')
    end
end)
```

### NUI Callbacks
```lua
-- Close UI
RegisterNUICallback('closeUI', function(data, cb)
    SetNuiFocus(false, false)
    cb('ok')
end)

-- Start repair
RegisterNUICallback('startRepair', function(data, cb)
    local component = data.component
    local vehiclePlate = data.plate
    
    -- Start repair process
    -- Update vehicle health gradually
    cb('ok')
end)
```

## Configuration

### Vehicle Components
The system supports repair of these vehicle components:
- **Engine**: Base cost $500, repair time 45 minutes
- **Body**: Base cost $300, repair time 30 minutes  
- **Transmission**: Base cost $400, repair time 40 minutes
- **Brakes**: Base cost $200, repair time 25 minutes
- **Suspension**: Base cost $350, repair time 35 minutes
- **Fuel System**: Base cost $150, repair time 20 minutes

### Priority Levels
Customer requests can be assigned these priority levels:
- **Urgent** 🚨: Immediate attention required
- **High** ⚠️: High priority, handle soon
- **Medium** 📋: Standard priority
- **Low** 📝: Low priority, can wait

### Request Statuses
- **Pending** ⏳: Awaiting mechanic attention
- **In Progress** 🔧: Currently being worked on
- **Completed** ✅: Work finished
- **Cancelled** ❌: Request cancelled

## Customization

### Styling
The UI uses Tailwind CSS for styling. You can customize colors, spacing, and layout by modifying the Tailwind classes in the component files.

### Data Structure
Modify the TypeScript interfaces in `app/types/mechanic.ts` to match your server's data structure.

### Components
Each major feature is a separate React component that can be easily modified or extended:
- `MechanicDashboard.tsx` - Main dashboard view
- `VehicleRepair.tsx` - Vehicle repair interface
- `PartsInventory.tsx` - Parts management
- `CustomerRequests.tsx` - Customer request handling

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Support
For support and questions:
- Create an issue on GitHub
- Join our Discord server
- Check the documentation

## Changelog

### v1.0.0
- Initial release
- Complete mechanic dashboard
- Vehicle repair system
- Parts inventory management
- Customer request handling
- Responsive design
- Dark theme UI
- Real-time progress tracking
- Cost and time calculations

---

**Note**: This is a demonstration UI. For production use, ensure proper security measures, input validation, and integration with your server's anti-cheat systems.
