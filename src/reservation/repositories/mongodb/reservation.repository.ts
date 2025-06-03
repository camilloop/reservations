import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Reservation } from '../../schemas';
import { InvalidIdFormatException } from '../../../_shared/errors';
import { CreateReservation, UpdateReservation } from '../../types';

@Injectable()
export class ReservationRepository {
  constructor(@InjectModel(Reservation.name) private reservationModel: Model<Reservation>) {}

  async findByReservationId(reservationId: string): Promise<Reservation | null> {
    return await this.reservationModel.findOne({ reservationId }).exec();
  }

  async create(reservation: CreateReservation): Promise<Reservation> {
    return await this.reservationModel.create(reservation);
  }

  async update(id: string, reservation: UpdateReservation): Promise<Reservation | null> {
    try {
      return await this.reservationModel
        .findByIdAndUpdate(id, { ...reservation, updatedAt: new Date() }, { new: true })
        .exec();
    } catch (error) {
      if (error.name === 'CastError' && error.kind === 'ObjectId') {
        throw new InvalidIdFormatException(id);
      }

      throw error;
    }
  }
}
