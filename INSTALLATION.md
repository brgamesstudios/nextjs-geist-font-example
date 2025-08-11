# FiveM Advanced Mechanic Script - Installation Guide

## 🚗 Overview
This is a comprehensive mechanic script for FiveM servers that includes:
- Vehicle diagnostics and repair system
- Parts inventory management
- Vehicle modifications and painting
- Professional UI with NUI interface
- ESX framework integration
- Job-based access control

## 📁 File Structure
```
advanced_mechanic/
├── fxmanifest.lua          # Resource manifest
├── config.lua              # Configuration file
├── client/
│   └── main.lua           # Client-side script
├── server/
│   └── main.lua           # Server-side script
├── shared/
│   └── utils.lua          # Shared utilities
├── html/
│   ├── index.html         # NUI interface
│   ├── style.css          # UI styling
│   ├── script.js          # UI logic
│   └── assets/            # UI images
└── README.md              # This file
```

## 🛠️ Installation

### 1. Resource Setup
1. Copy the entire `advanced_mechanic` folder to your server's `resources` directory
2. Add `ensure advanced_mechanic` to your `server.cfg`
3. Restart your server

### 2. Dependencies
- **Required**: `es_extended` (ESX framework)
- **Optional**: `progressBars` (for progress bar animations)

### 3. Database Setup
The script automatically creates necessary database tables for parts inventory.

## ⚙️ Configuration

### Job Requirements
Edit `config.lua` to set your mechanic job:
```lua
Config.MechanicJobName = "mechanic"  -- Your mechanic job name
Config.MinimumJobGrade = 0           -- Minimum job grade required
```

### Locations
Configure mechanic shop locations, lifts, and parts storage in `config.lua`.

### Repair Types
Customize repair options, costs, and required parts:
```lua
Config.Repairs = {
  engine = {
    label = "Engine Repair",
    time = 10000,        -- 10 seconds
    cost = 500,
    parts = { "engine_parts" }
  }
}
```

## 🎮 Usage

### Player Commands
- `/mechanic` - Open mechanic interface (mechanic job only)
- `/repair` - Quick repair command

### Admin Commands
- `/addpart <player> <part> <quantity>` - Add parts to player
- `/removepart <player> <part> <quantity>` - Remove parts from player
- `/setmechanic <player>` - Set player as mechanic
- `/removemechanic <player>` - Remove mechanic job from player

### Features
1. **Diagnostics**: View vehicle health and status
2. **Repair**: Fix engine, body, and other components
3. **Parts Shop**: Buy mechanic parts
4. **Inventory**: Manage your parts collection
5. **Modifications**: Customize vehicle appearance
6. **Vehicle Lifts**: Professional repair environment

## 🔧 Customization

### Adding New Parts
Add to `Config.Parts` in `config.lua`:
```lua
Config.Parts = {
  new_part = {
    label = "New Part",
    price = 100,
    weight = 1.0
  }
}
```

### Adding New Repair Types
Add to `Config.Repairs` in `config.lua`:
```lua
Config.Repairs = {
  new_repair = {
    label = "New Repair",
    time = 15000,
    cost = 750,
    parts = { "part1", "part2" }
  }
}
```

### UI Customization
Modify `html/style.css` to change colors, fonts, and layout.

## 🐛 Troubleshooting

### Common Issues
1. **Script won't start**: Check `es_extended` dependency
2. **UI not showing**: Verify NUI files are in correct location
3. **Parts not working**: Check database connection and ESX callbacks

### Debug Mode
Enable debug mode in `config.lua`:
```lua
Config.Debug = true
```

## 📞 Support
For issues or questions:
1. Check the console for error messages
2. Verify all dependencies are running
3. Check file permissions and paths

## 🔄 Updates
To update the script:
1. Backup your `config.lua` (customizations)
2. Replace all other files
3. Restore your custom configuration
4. Restart the resource

## 📝 License
This script is provided as-is for FiveM server use.