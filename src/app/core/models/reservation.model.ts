import { Space } from './space.model';
import { User } from './user.model';

export interface Reservation {
  id: number;
  user?: User;
  space?: Space;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'approved' | 'rejected' | 'canceled';
  notes?: string;
  attendees: number;
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReservationRequest {
  spaceId: number;
  startTime: string;
  endTime: string;
  attendees: number;
  notes?: string;
}
