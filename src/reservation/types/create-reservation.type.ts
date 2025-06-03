import { Reservation } from '../schemas';

export type CreateReservation = Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>;
