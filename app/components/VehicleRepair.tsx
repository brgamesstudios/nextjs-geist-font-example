'use client';

import { useState } from 'react';
import { VehicleData, RepairAction } from '../types/mechanic';

interface VehicleRepairProps {
  vehicleData: VehicleData | null;
  onRepair: (data: VehicleData) => void;
}

export default function VehicleRepair({ vehicleData, onRepair }: VehicleRepairProps) {
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [repairProgress, setRepairProgress] = useState<number>(0);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairHistory, setRepairHistory] = useState<RepairAction[]>([]);
  const [notes, setNotes] = useState('');

  if (!vehicleData) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg">No vehicle selected</div>
        <div className="text-gray-500 text-sm mt-2">Select a vehicle to start repairs</div>
      </div>
    );
  }

  const components = [
    { key: 'engine', name: 'Engine', icon: '🔧', currentHealth: vehicleData.engine },
    { key: 'body', name: 'Body', icon: '🚗', currentHealth: vehicleData.body },
    { key: 'transmission', name: 'Transmission', icon: '⚙️', currentHealth: vehicleData.transmission },
    { key: 'brakes', name: 'Brakes', icon: '🛑', currentHealth: vehicleData.brakes },
    { key: 'suspension', name: 'Suspension', icon: '📏', currentHealth: vehicleData.suspension },
    { key: 'fuel', name: 'Fuel System', icon: '⛽', currentHealth: vehicleData.fuel }
  ];

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

  const calculateRepairCost = (component: string, currentHealth: number) => {
    const baseCosts: { [key: string]: number } = {
      engine: 500,
      body: 300,
      transmission: 400,
      brakes: 200,
      suspension: 350,
      fuel: 150
    };
    
    const healthDeficit = 100 - currentHealth;
    return Math.round(baseCosts[component] * (healthDeficit / 100));
  };

  const calculateRepairTime = (component: string, currentHealth: number) => {
    const baseTimes: { [key: string]: number } = {
      engine: 45,
      body: 30,
      transmission: 40,
      brakes: 25,
      suspension: 35,
      fuel: 20
    };
    
    const healthDeficit = 100 - currentHealth;
    return Math.round(baseTimes[component] * (healthDeficit / 100));
  };

  const startRepair = async (component: string) => {
    if (isRepairing) return;
    
    setSelectedComponent(component);
    setIsRepairing(true);
    setRepairProgress(0);

    const repairTime = calculateRepairTime(component, vehicleData[component as keyof VehicleData] as number);
    const interval = setInterval(() => {
      setRepairProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          completeRepair(component);
          return 100;
        }
        return prev + (100 / (repairTime * 60)); // Update every second
      });
    }, 1000);
  };

  const completeRepair = (component: string) => {
    const repairAction: RepairAction = {
      type: component as any,
      cost: calculateRepairCost(component, vehicleData[component as keyof VehicleData] as number),
      timeRequired: calculateRepairTime(component, vehicleData[component as keyof VehicleData] as number)
    };

    setRepairHistory(prev => [...prev, repairAction]);
    
    // Update vehicle data
    const updatedVehicle = {
      ...vehicleData,
      [component]: 100,
      health: Math.round(
        (vehicleData.engine + vehicleData.body + vehicleData.transmission + 
         vehicleData.brakes + vehicleData.suspension + vehicleData.fuel) / 6
      )
    };
    
    onRepair(updatedVehicle);
    setIsRepairing(false);
    setRepairProgress(0);
    setSelectedComponent('');
  };

  const cancelRepair = () => {
    setIsRepairing(false);
    setRepairProgress(0);
    setSelectedComponent('');
  };

  return (
    <div className="space-y-6">
      {/* Repair Status */}
      {isRepairing && (
        <div className="bg-blue-900 border border-blue-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-blue-200">
              🔧 Repairing {components.find(c => c.key === selectedComponent)?.name}
            </h3>
            <button
              onClick={cancelRepair}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
          
          <div className="w-full bg-blue-800 rounded-full h-4 mb-4">
            <div 
              className="bg-blue-400 h-4 rounded-full transition-all duration-1000"
              style={{ width: `${repairProgress}%` }}
            ></div>
          </div>
          
          <div className="text-center text-blue-200">
            <div className="text-2xl font-bold">{Math.round(repairProgress)}%</div>
            <div className="text-sm">Repair in progress...</div>
          </div>
        </div>
      )}

      {/* Component Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {components.map((component) => (
          <div key={component.key} className="bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{component.icon}</div>
              <h3 className="text-lg font-semibold text-white">{component.name}</h3>
            </div>
            
            <div className="text-center mb-4">
              <div className={`text-2xl font-bold ${getHealthColor(component.currentHealth)}`}>
                {component.currentHealth}%
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${getHealthBarColor(component.currentHealth)}`}
                  style={{ width: `${component.currentHealth}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Repair Cost:</span>
                <span className="text-green-400">${calculateRepairCost(component.key, component.currentHealth)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time Required:</span>
                <span className="text-blue-400">{calculateRepairTime(component.key, component.currentHealth)} min</span>
              </div>
            </div>
            
            <button
              onClick={() => startRepair(component.key)}
              disabled={isRepairing || component.currentHealth >= 100}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                component.currentHealth >= 100
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {component.currentHealth >= 100 ? 'Fully Repaired' : 'Start Repair'}
            </button>
          </div>
        ))}
      </div>

      {/* Repair History */}
      {repairHistory.length > 0 && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Repair History</h3>
          <div className="space-y-3">
            {repairHistory.map((repair, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300 capitalize">{repair.type} repaired</span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-green-400">${repair.cost}</span>
                  <span className="text-blue-400">{repair.timeRequired} min</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-gray-300">Total Cost:</span>
              <span className="text-green-400">
                ${repairHistory.reduce((sum, repair) => sum + repair.cost, 0)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-gray-300">Total Time:</span>
              <span className="text-blue-400">
                {repairHistory.reduce((sum, repair) => sum + repair.timeRequired, 0)} min
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Notes Section */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Repair Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about the repair work..."
          className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="mt-3 flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}