import { Reservation } from '../schemas';

export type UpdateReservation = Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>;
