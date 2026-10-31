export type FilterStageType = {
  id: string;
  stageNumber: number;
  name: string;
  nameAr: string;
  defaultIntervalDays: number; // e.g. 90, 180, 360, 720
  defaultCost: number; // Wholesale cost to company
  defaultPrice: number; // Retail price to customer
  description: string;
  descriptionAr: string;
};

export type CustomerStageConfig = {
  stageNumber: number;
  stageName: string;
  intervalDays: number;
  lastServicedDate: string; // ISO date YYYY-MM-DD (initial install or last changed)
  currentDueDate: string; // ISO date YYYY-MM-DD
  postponedUntil?: string; // ISO date YYYY-MM-DD if postponed
  postponeReason?: string;
  customPrice?: number;
  notes?: string;
};

export type MaintenanceStatus = 'due' | 'completed' | 'postponed' | 'deleted';

export type MaintenanceTicket = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  stageNumber: number;
  stageName: string;
  scheduledDueDate: string; // YYYY-MM-DD
  status: MaintenanceStatus;
  
  // Postpone details
  postponedUntil?: string;
  postponeDays?: number;
  postponeReason?: string;
  postponedAt?: string;

  // Completion details
  completedDate?: string;
  costCharged?: number;
  cartridgeCost?: number;
  paymentStatus?: 'paid' | 'partial' | 'unpaid';
  amountPaid?: number;
  technicianName?: string;
  completionNotes?: string;

  // Deletion details
  deletedAt?: string;
  deletionReason?: string;
  
  createdAt: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  secondaryPhone?: string;
  address: string;
  cityOrArea: string;
  dateAdded: string; // YYYY-MM-DD
  filterModel: string; // e.g. "7-Stage RO System"
  stages: CustomerStageConfig[];
  notes: string;
  balance: number; // Positive = customer owes money; Negative = credit
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  date: string;
  items: {
    description: string;
    stageNumber?: number;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Card' | 'Vodafone Cash / Wallet' | 'Other';
  notes?: string;
};

export type FilterSystemPreset = {
  id: string;
  name: string;
  nameAr: string;
  stagesCount: number;
  stages: {
    stageNumber: number;
    name: string;
    nameAr: string;
    intervalDays: number;
    price: number;
    cost: number;
  }[];
};
