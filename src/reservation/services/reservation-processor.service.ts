import { Injectable, Logger } from '@nestjs/common';

import { ReservationRepository } from '../repositories/mongodb';
import { ReservationDto } from '../dtos';
import { ReservationStatus } from '../enums';
import { Reservation } from '../schemas';
import { CreateReservation, UpdateReservation } from '../types';

@Injectable()
export class ReservationProcessorService {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly logger: Logger,
  ) {}

  async process(reservationDto: ReservationDto): Promise<void> {
    const existingReservation = await this.reservationRepository.findByReservationId(reservationDto.reservationId);
    const reservationPayload = this.#createReservationPayload(reservationDto);

    if (this.#isCancelledOrCompleted(reservationDto.status)) {
      await this.#handleCancelledOrCompletedReservation(reservationPayload, existingReservation);
    } else {
      await this.#handleActiveReservation(reservationPayload, existingReservation);
    }
  }

  #createReservationPayload(reservationDto: ReservationDto): UpdateReservation {
    return {
      reservationId: reservationDto.reservationId,
      guestName: reservationDto.guestName,
      status: reservationDto.status,
      checkInDate: new Date(reservationDto.checkInDate),
      checkOutDate: new Date(reservationDto.checkOutDate),
    };
  }

  #isCancelledOrCompleted(status: ReservationStatus): boolean {
    return status === ReservationStatus.CANCELLED || status === ReservationStatus.COMPLETED;
  }

  async #handleCancelledOrCompletedReservation(
    reservationPayload: UpdateReservation,
    existingReservation: Reservation | null,
  ): Promise<void> {
    if (existingReservation) {
      await this.reservationRepository.update(existingReservation.id, reservationPayload);
      this.logger.debug(
        `Updated existing reservation ${reservationPayload.reservationId} with status ${reservationPayload.status}`,
      );
    } else {
      this.logger.debug(
        `Skipping cancelled/completed reservation ${reservationPayload.reservationId} - not found in database`,
      );
    }
  }

  async #handleActiveReservation(
    reservationPayload: UpdateReservation | CreateReservation,
    existingReservation: Reservation | null,
  ): Promise<void> {
    if (existingReservation) {
      await this.reservationRepository.update(existingReservation.id, reservationPayload);
      this.logger.debug(`Updated existing reservation ${reservationPayload.reservationId}`);
    } else {
      await this.reservationRepository.create(reservationPayload);
      this.logger.debug(`Created new reservation ${reservationPayload.reservationId}`);
    }
  }
}
