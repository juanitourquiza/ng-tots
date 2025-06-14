export interface Space {
  id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  location: string;
  isActive: boolean;
  amenities: string[];
  imageUrl: string;
  size?: number;
  availableTimes?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  reservations?: any[];
}

export interface SpaceFilter {
  capacity?: number;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  fromDate?: Date;
  toDate?: Date;
}

export interface SpaceAvailability {
  spaceId: number;
  available: boolean;
  conflictingReservations?: number[];
  message?: string;
}
