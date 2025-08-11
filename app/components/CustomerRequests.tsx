'use client';

import { useState } from 'react';
import { CustomerRequest } from '../types/mechanic';

interface CustomerRequestsProps {
  requests: CustomerRequest[];
  onUpdateRequests: (requests: CustomerRequest[]) => void;
}

export default function CustomerRequests({ requests, onUpdateRequests }: CustomerRequestsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null);
  const [showAddRequest, setShowAddRequest] = useState(false);
  const [newRequest, setNewRequest] = useState({
    customer: '',
    vehicle: '',
    issue: '',
    priority: 'medium' as const,
    estimatedCost: 0,
    notes: ''
  });

  const filteredRequests = requests
    .filter(request => 
      (request.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
       request.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
       request.issue.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === 'all' || request.status === filterStatus) &&
      (filterPriority === 'all' || request.priority === filterPriority)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
        case 'customer':
          return a.customer.localeCompare(b.customer);
        case 'vehicle':
          return a.vehicle.localeCompare(b.vehicle);
        default:
          return 0;
      }
    });

  const addRequest = () => {
    if (newRequest.customer && newRequest.vehicle && newRequest.issue) {
      const request: CustomerRequest = {
        id: `R${Date.now()}`,
        ...newRequest,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onUpdateRequests([...requests, request]);
      setNewRequest({ customer: '', vehicle: '', issue: '', priority: 'medium', estimatedCost: 0, notes: '' });
      setShowAddRequest(false);
    }
  };

  const updateRequestStatus = (requestId: string, newStatus: string) => {
    const updatedRequests = requests.map(request => {
      if (request.id === requestId) {
        return { ...request, status: newStatus as any, updatedAt: new Date().toISOString() };
      }
      return request;
    });
    onUpdateRequests(updatedRequests);
  };

  const updateRequestPriority = (requestId: string, newPriority: string) => {
    const updatedRequests = requests.map(request => {
      if (request.id === requestId) {
        return { ...request, priority: newPriority as any, updatedAt: new Date().toISOString() };
      }
      return request;
    });
    onUpdateRequests(updatedRequests);
  };

  const removeRequest = (requestId: string) => {
    onUpdateRequests(requests.filter(request => request.id !== requestId));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-900';
      case 'high': return 'text-orange-400 bg-orange-900';
      case 'medium': return 'text-yellow-400 bg-yellow-900';
      case 'low': return 'text-green-400 bg-green-900';
      default: return 'text-gray-400 bg-gray-900';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-900';
      case 'in-progress': return 'text-blue-400 bg-blue-900';
      case 'completed': return 'text-green-400 bg-green-900';
      case 'cancelled': return 'text-red-400 bg-red-900';
      default: return 'text-gray-400 bg-gray-900';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📋';
      case 'low': return '📝';
      default: return '📋';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'in-progress': return '🔧';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const inProgressCount = requests.filter(r => r.status === 'in-progress').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;
  const urgentCount = requests.filter(r => r.priority === 'urgent').length;

  return (
    <div className="space-y-6">
      {/* Request Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-400">{requests.length}</div>
          <div className="text-gray-400 text-sm">Total Requests</div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-yellow-400">{pendingCount}</div>
          <div className="text-gray-400 text-sm">Pending</div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-400">{inProgressCount}</div>
          <div className="text-gray-400 text-sm">In Progress</div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-400">{completedCount}</div>
          <div className="text-gray-400 text-sm">Completed</div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-red-400">{urgentCount}</div>
          <div className="text-gray-400 text-sm">Urgent</div>
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
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Sort by Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="customer">Sort by Customer</option>
              <option value="vehicle">Sort by Vehicle</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddRequest(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            + New Request
          </button>
        </div>
      </div>

      {/* Add Request Modal */}
      {showAddRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">New Customer Request</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Customer Name</label>
                <input
                  type="text"
                  value={newRequest.customer}
                  onChange={(e) => setNewRequest({ ...newRequest, customer: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter customer name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Vehicle</label>
                <input
                  type="text"
                  value={newRequest.vehicle}
                  onChange={(e) => setNewRequest({ ...newRequest, vehicle: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter vehicle model"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Issue Description</label>
                <textarea
                  value={newRequest.issue}
                  onChange={(e) => setNewRequest({ ...newRequest, issue: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the issue"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select
                    value={newRequest.priority}
                    onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value as any })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Est. Cost</label>
                  <input
                    type="number"
                    value={newRequest.estimatedCost}
                    onChange={(e) => setNewRequest({ ...newRequest, estimatedCost: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={newRequest.notes}
                  onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddRequest(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addRequest}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Create Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-white">Request Details</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Customer Information</h4>
                <div className="space-y-2 text-gray-300">
                  <div><span className="font-medium">Name:</span> {selectedRequest.customer}</div>
                  <div><span className="font-medium">Vehicle:</span> {selectedRequest.vehicle}</div>
                  <div><span className="font-medium">Issue:</span> {selectedRequest.issue}</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Request Details</h4>
                <div className="space-y-2 text-gray-300">
                  <div><span className="font-medium">Priority:</span> {selectedRequest.priority}</div>
                  <div><span className="font-medium">Status:</span> {selectedRequest.status}</div>
                  <div><span className="font-medium">Created:</span> {new Date(selectedRequest.createdAt).toLocaleDateString()}</div>
                  <div><span className="font-medium">Updated:</span> {new Date(selectedRequest.updatedAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
            
            {selectedRequest.notes && (
              <div className="mt-4">
                <h4 className="text-lg font-medium text-white mb-2">Notes</h4>
                <div className="text-gray-300 bg-gray-700 p-3 rounded-lg">
                  {selectedRequest.notes}
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-gray-800 rounded-lg shadow-lg p-6 hover:bg-gray-750 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">{getPriorityIcon(request.priority)}</span>
                  <span className="text-2xl">{getStatusIcon(request.status)}</span>
                  <h3 className="text-lg font-semibold text-white">{request.customer}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                  <div><span className="font-medium">Vehicle:</span> {request.vehicle}</div>
                  <div><span className="font-medium">Issue:</span> {request.issue}</div>
                  <div><span className="font-medium">Created:</span> {new Date(request.createdAt).toLocaleDateString()}</div>
                </div>
                
                {request.estimatedCost > 0 && (
                  <div className="mt-2 text-green-400 font-medium">
                    Estimated Cost: ${request.estimatedCost.toLocaleString()}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => setSelectedRequest(request)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  View
                </button>
                
                <select
                  value={request.status}
                  onChange={(e) => updateRequestStatus(request.id, e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <select
                  value={request.priority}
                  onChange={(e) => updateRequestPriority(request.id, e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                
                <button
                  onClick={() => removeRequest(request.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No requests found</div>
            <div className="text-gray-500 text-sm mt-2">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Try adjusting your search or filters' 
                : 'Create your first customer request to get started'
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}