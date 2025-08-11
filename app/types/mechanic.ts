export interface VehicleData {
  id: string;
  plate: string;
  model: string;
  health: number;
  fuel: number;
  engine: number;
  body: number;
  transmission: number;
  brakes: number;
  suspension: number;
  owner: string;
  lastService: string;
}

export interface PartData {
  id: string;
  name: string;
  quantity: number;
  price: number;
  condition: 'new' | 'used' | 'damaged';
}

export interface CustomerRequest {
  id: string;
  customer: string;
  vehicle: string;
  issue: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  estimatedCost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RepairAction {
  type: 'engine' | 'body' | 'transmission' | 'brakes' | 'suspension' | 'fuel';
  partId?: string;
  cost: number;
  timeRequired: number; // in minutes
}

export interface RepairHistory {
  id: string;
  vehicleId: string;
  mechanicId: string;
  actions: RepairAction[];
  totalCost: number;
  totalTime: number;
  completedAt: string;
  notes: string;
}