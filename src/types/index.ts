export enum UserRole {
  ADMIN = 'admin',
  RIDER = 'rider',
  SUPPORT = 'support',
  CUSTOMER = 'customer'
}

export enum UserStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum OrderType {
  STANDARD = 'standard',
  PRIME = 'prime',
  EMERGENCY = 'emergency'
}

export enum OrderStatus {
  PLACED = 'placed',
  ASSIGNED = 'assigned',
  PICKED_UP = 'picked_up',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit'
}

export enum TransactionCategory {
  DELIVERY_FEE = 'delivery_fee',
  PAYOUT = 'payout',
  INCENTIVE = 'incentive',
  ADJUSTMENT = 'adjustment'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiderProfile {
  riderId: string;
  vehicleType: string;
  licenseNumber: string;
  documents: Record<string, string>;
  isOnline: boolean;
  currentLocation?: Coordinates;
  walletBalance: number;
  rating: number;
  totalDeliveries: number;
}

export interface Order {
  orderId: string;
  type: OrderType;
  status: OrderStatus;
  customerId: string;
  riderId?: string;
  pickup: {
    address: string;
    coords: Coordinates;
  };
  dropoff: {
    address: string;
    coords: Coordinates;
  };
  items: Array<{name: string; quantity: number}>;
  pricing: {
    total: number;
    currency: string;
  };
  createdAt: string;
  updatedAt: string;
}
