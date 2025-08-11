'use client';

import { useState } from 'react';
import { PartData } from '../types/mechanic';

interface PartsInventoryProps {
  parts: PartData[];
  onUpdateParts: (parts: PartData[]) => void;
}

export default function PartsInventory({ parts, onUpdateParts }: PartsInventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [showAddPart, setShowAddPart] = useState(false);
  const [newPart, setNewPart] = useState({
    name: '',
    quantity: 1,
    price: 0,
    condition: 'new' as const
  });

  const filteredParts = parts
    .filter(part => 
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCondition === 'all' || part.condition === filterCondition)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'quantity':
          return b.quantity - a.quantity;
        case 'price':
          return b.price - a.price;
        case 'condition':
          return a.condition.localeCompare(b.condition);
        default:
          return 0;
      }
    });

  const addPart = () => {
    if (newPart.name && newPart.quantity > 0 && newPart.price >= 0) {
      const part: PartData = {
        id: `P${Date.now()}`,
        ...newPart
      };
      onUpdateParts([...parts, part]);
      setNewPart({ name: '', quantity: 1, price: 0, condition: 'new' });
      setShowAddPart(false);
    }
  };

  const updatePartQuantity = (partId: string, change: number) => {
    const updatedParts = parts.map(part => {
      if (part.id === partId) {
        const newQuantity = Math.max(0, part.quantity + change);
        return { ...part, quantity: newQuantity };
      }
      return part;
    });
    onUpdateParts(updatedParts);
  };

  const removePart = (partId: string) => {
    onUpdateParts(parts.filter(part => part.id !== partId));
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'text-green-400';
      case 'used': return 'text-yellow-400';
      case 'damaged': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConditionBadge = (condition: string) => {
    const colors = {
      new: 'bg-green-600',
      used: 'bg-yellow-600',
      damaged: 'bg-red-600'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[condition as keyof typeof colors]} text-white`}>
        {condition.charAt(0).toUpperCase() + condition.slice(1)}
      </span>
    );
  };

  const totalValue = parts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
  const totalParts = parts.reduce((sum, part) => sum + part.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Inventory Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-400">{parts.length}</div>
          <div className="text-gray-400 text-sm">Part Types</div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-400">{totalParts}</div>
          <div className="text-gray-400 text-sm">Total Parts</div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-yellow-400">${totalValue.toLocaleString()}</div>
          <div className="text-gray-400 text-sm">Total Value</div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-400">
            {parts.filter(p => p.quantity < 5).length}
          </div>
          <div className="text-gray-400 text-sm">Low Stock</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search parts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>

            {/* Filter */}
            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Conditions</option>
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="damaged">Damaged</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="quantity">Sort by Quantity</option>
              <option value="price">Sort by Price</option>
              <option value="condition">Sort by Condition</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddPart(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            + Add Part
          </button>
        </div>
      </div>

      {/* Add Part Modal */}
      {showAddPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Add New Part</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Part Name</label>
                <input
                  type="text"
                  value={newPart.name}
                  onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter part name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={newPart.quantity}
                    onChange={(e) => setNewPart({ ...newPart, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
                  <input
                    type="number"
                    value={newPart.price}
                    onChange={(e) => setNewPart({ ...newPart, price: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Condition</label>
                <select
                  value={newPart.condition}
                  onChange={(e) => setNewPart({ ...newPart, condition: e.target.value as any })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddPart(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addPart}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Add Part
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parts Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Part</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Condition</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredParts.map((part) => (
                <tr key={part.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{part.name}</div>
                    <div className="text-sm text-gray-400">ID: {part.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getConditionBadge(part.condition)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updatePartQuantity(part.id, -1)}
                        className="bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full text-sm font-bold"
                      >
                        -
                      </button>
                      <span className={`text-lg font-semibold ${part.quantity < 5 ? 'text-red-400' : 'text-white'}`}>
                        {part.quantity}
                      </span>
                      <button
                        onClick={() => updatePartQuantity(part.id, 1)}
                        className="bg-green-600 hover:bg-green-700 text-white w-6 h-6 rounded-full text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    ${part.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-semibold">
                    ${(part.price * part.quantity).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => removePart(part.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      🗑️ Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredParts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No parts found</div>
            <div className="text-gray-500 text-sm mt-2">
              {searchTerm || filterCondition !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Add your first part to get started'
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}