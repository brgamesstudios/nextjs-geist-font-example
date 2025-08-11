'use client';

import { useState, useEffect } from 'react';
import MechanicDashboard from './components/MechanicDashboard';
import VehicleRepair from './components/VehicleRepair';
import PartsInventory from './components/PartsInventory';
import CustomerRequests from './components/CustomerRequests';
import { VehicleData, PartData, CustomerRequest } from './types/mechanic';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [parts, setParts] = useState<PartData[]>([]);
  const [requests, setRequests] = useState<CustomerRequest[]>([]);

  // Simulate FiveM QBCore data
  useEffect(() => {
    // This would normally come from QBCore events
    const mockVehicleData: VehicleData = {
      id: 'VH001',
      plate: 'ABC123',
      model: 'Sultan RS',
      health: 75,
      fuel: 45,
      engine: 80,
      body: 70,
      transmission: 85,
      brakes: 90,
      suspension: 75,
      owner: 'John Doe',
      lastService: '2024-01-15'
    };

    const mockParts: PartData[] = [
      { id: 'P001', name: 'Engine Block', quantity: 5, price: 2500, condition: 'new' },
      { id: 'P002', name: 'Brake Pads', quantity: 12, price: 150, condition: 'new' },
      { id: 'P003', name: 'Suspension Kit', quantity: 3, price: 800, condition: 'new' },
      { id: 'P004', name: 'Transmission', quantity: 2, price: 1200, condition: 'new' },
      { id: 'P005', name: 'Fuel Pump', quantity: 8, price: 300, condition: 'new' }
    ];

    const mockRequests: CustomerRequest[] = [
      { id: 'R001', customer: 'Mike Johnson', vehicle: 'Sultan RS', issue: 'Engine overheating', priority: 'high', status: 'pending' },
      { id: 'R002', customer: 'Sarah Wilson', vehicle: 'Buffalo', issue: 'Brake failure', priority: 'urgent', status: 'in-progress' },
      { id: 'R003', customer: 'Tom Brown', vehicle: 'Comet', issue: 'Suspension noise', priority: 'medium', status: 'completed' }
    ];

    setVehicleData(mockVehicleData);
    setParts(mockParts);
    setRequests(mockRequests);
  }, []);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MechanicDashboard vehicleData={vehicleData} />;
      case 'repair':
        return <VehicleRepair vehicleData={vehicleData} onRepair={(data) => setVehicleData(data)} />;
      case 'inventory':
        return <PartsInventory parts={parts} onUpdateParts={setParts} />;
      case 'requests':
        return <CustomerRequests requests={requests} onUpdateRequests={setRequests} />;
      default:
        return <MechanicDashboard vehicleData={vehicleData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-blue-400">QBCore Mechanic</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Mechanic ID: MECH001</span>
              <span className="text-green-400">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
              { id: 'repair', label: 'Vehicle Repair', icon: '🔧' },
              { id: 'inventory', label: 'Parts Inventory', icon: '📦' },
              { id: 'requests', label: 'Customer Requests', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-300 hover:text-gray-100 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderActiveTab()}
      </main>
    </div>
  );
}