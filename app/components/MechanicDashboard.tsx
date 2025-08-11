'use client';

import { VehicleData } from '../types/mechanic';

interface MechanicDashboardProps {
  vehicleData: VehicleData | null;
}

export default function MechanicDashboard({ vehicleData }: MechanicDashboardProps) {
  if (!vehicleData) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg">No vehicle selected</div>
        <div className="text-gray-500 text-sm mt-2">Select a vehicle to view dashboard</div>
      </div>
    );
  }

  const getHealthColor = (value: number) => {
    if (value >= 80) return 'text-green-400';
    if (value >= 60) return 'text-yellow-400';
    if (value >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHealthBarColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    if (value >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Overview Card */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Vehicle Overview</h2>
          <div className="text-right">
            <div className="text-sm text-gray-400">Plate</div>
            <div className="text-lg font-mono text-blue-400">{vehicleData.plate}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-400 mb-2">Model</div>
            <div className="text-lg font-semibold text-white">{vehicleData.model}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-2">Owner</div>
            <div className="text-lg font-semibold text-white">{vehicleData.owner}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-2">Last Service</div>
            <div className="text-lg font-semibold text-white">{vehicleData.lastService}</div>
          </div>
        </div>
      </div>

      {/* Health Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Health */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Overall Health</h3>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getHealthColor(vehicleData.health)}`}>
              {vehicleData.health}%
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 mt-3">
              <div 
                className={`h-3 rounded-full ${getHealthBarColor(vehicleData.health)}`}
                style={{ width: `${vehicleData.health}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Fuel Level */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Fuel Level</h3>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getHealthColor(vehicleData.fuel)}`}>
              {vehicleData.fuel}%
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 mt-3">
              <div 
                className={`h-3 rounded-full ${getHealthBarColor(vehicleData.fuel)}`}
                style={{ width: `${vehicleData.fuel}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Component Health */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Component Health</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Engine', value: vehicleData.engine, icon: '🔧' },
            { name: 'Body', value: vehicleData.body, icon: '🚗' },
            { name: 'Transmission', value: vehicleData.transmission, icon: '⚙️' },
            { name: 'Brakes', value: vehicleData.brakes, icon: '🛑' },
            { name: 'Suspension', value: vehicleData.suspension, icon: '📏' },
            { name: 'Fuel System', value: vehicleData.fuel, icon: '⛽' }
          ].map((component) => (
            <div key={component.name} className="text-center">
              <div className="text-2xl mb-2">{component.icon}</div>
              <div className="text-sm text-gray-400 mb-1">{component.name}</div>
              <div className={`text-lg font-semibold ${getHealthColor(component.value)}`}>
                {component.value}%
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${getHealthBarColor(component.value)}`}
                  style={{ width: `${component.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
            🔧 Start Repair
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
            ⛽ Refuel
          </button>
          <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
            📋 Generate Report
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
            💰 Estimate Cost
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">Engine diagnostic completed</span>
            </div>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <span className="text-blue-400">🔧</span>
              <span className="text-gray-300">Brake pads replaced</span>
            </div>
            <span className="text-sm text-gray-500">1 day ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <span className="text-yellow-400">⚠️</span>
              <span className="text-gray-300">Suspension inspection needed</span>
            </div>
            <span className="text-sm text-gray-500">3 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}