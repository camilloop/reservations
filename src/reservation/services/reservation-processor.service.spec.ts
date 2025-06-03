import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

import { ReservationProcessorService } from './reservation-processor.service';
import { ReservationRepository } from '../repositories/mongodb';
import { ReservationDto } from '../dtos';
import { ReservationStatus } from '../enums';
import { Reservation } from '../schemas';

describe('ReservationProcessorService', () => {
  let service: ReservationProcessorService;
  let reservationRepository: jest.Mocked<ReservationRepository>;
  let logger: jest.Mocked<Logger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationProcessorService,
        {
          provide: ReservationRepository,
          useValue: createMock<ReservationRepository>(),
        },
        {
          provide: Logger,
          useValue: createMock<Logger>(),
        },
      ],
    }).compile();

    service = module.get<ReservationProcessorService>(ReservationProcessorService);
    reservationRepository = module.get(ReservationRepository);
    logger = module.get(Logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('process', () => {
    const mockReservationDto: ReservationDto = {
      reservationId: 'RES-123',
      guestName: 'John Doe',
      status: ReservationStatus.PENDING,
      checkInDate: '2024-01-15',
      checkOutDate: '2024-01-20',
    };

    const mockExistingReservation: Reservation = {
      id: 'existing-id',
      reservationId: 'RES-123',
      guestName: 'John Doe',
      status: ReservationStatus.PENDING,
      checkInDate: new Date('2024-01-15'),
      checkOutDate: new Date('2024-01-20'),
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
    };

    describe('when reservation is cancelled', () => {
      const cancelledReservationDto: ReservationDto = {
        ...mockReservationDto,
        status: ReservationStatus.CANCELLED,
      };

      it('should update existing cancelled reservation', async () => {
        reservationRepository.findByReservationId.mockResolvedValue(mockExistingReservation);

        await service.process(cancelledReservationDto);

        expect(reservationRepository.findByReservationId).toHaveBeenCalledWith('RES-123');
        expect(reservationRepository.update).toHaveBeenCalledWith('existing-id', {
          reservationId: 'RES-123',
          guestName: 'John Doe',
          status: ReservationStatus.CANCELLED,
          checkInDate: new Date('2024-01-15'),
          checkOutDate: new Date('2024-01-20'),
        });
        expect(logger.debug).toHaveBeenCalledWith('Updated existing reservation RES-123 with status anulowana');
      });

      it('should skip cancelled reservation when not found in database', async () => {
        reservationRepository.findByReservationId.mockResolvedValue(null);

        await service.process(cancelledReservationDto);

        expect(reservationRepository.findByReservationId).toHaveBeenCalledWith('RES-123');
        expect(reservationRepository.update).not.toHaveBeenCalled();
        expect(reservationRepository.create).not.toHaveBeenCalled();
        expect(logger.debug).toHaveBeenCalledWith(
          'Skipping cancelled/completed reservation RES-123 - not found in database',
        );
      });
    });

    describe('when reservation is completed', () => {
      const completedReservationDto: ReservationDto = {
        ...mockReservationDto,
        status: ReservationStatus.COMPLETED,
      };

      it('should update existing completed reservation', async () => {
        reservationRepository.findByReservationId.mockResolvedValue(mockExistingReservation);

        await service.process(completedReservationDto);

        expect(reservationRepository.findByReservationId).toHaveBeenCalledWith('RES-123');
        expect(reservationRepository.update).toHaveBeenCalledWith('existing-id', {
          reservationId: 'RES-123',
          guestName: 'John Doe',
          status: ReservationStatus.COMPLETED,
          checkInDate: new Date('2024-01-15'),
          checkOutDate: new Date('2024-01-20'),
        });
        expect(logger.debug).toHaveBeenCalledWith('Updated existing reservation RES-123 with status zrealizowana');
      });

      it('should skip completed reservation when not found in database', async () => {
        reservationRepository.findByReservationId.mockResolvedValue(null);

        await service.process(completedReservationDto);

        expect(reservationRepository.findByReservationId).toHaveBeenCalledWith('RES-123');
        expect(reservationRepository.update).not.toHaveBeenCalled();
        expect(reservationRepository.create).not.toHaveBeenCalled();
        expect(logger.debug).toHaveBeenCalledWith(
          'Skipping cancelled/completed reservation RES-123 - not found in database',
        );
      });
    });

    describe('when reservation is active (PENDING)', () => {
      it('should update existing active reservation', async () => {
        reservationRepository.findByReservationId.mockResolvedValue(mockExistingReservation);

        await service.process(mockReservationDto);

        expect(reservationRepository.findByReservationId).toHaveBeenCalledWith('RES-123');
        expect(reservationRepository.update).toHaveBeenCalledWith('existing-id', {
          reservationId: 'RES-123',
          guestName: 'John Doe',
          status: ReservationStatus.PENDING,
          checkInDate: new Date('2024-01-15'),
          checkOutDate: new Date('2024-01-20'),
        });
        expect(logger.debug).toHaveBeenCalledWith('Updated existing reservation RES-123');
      });

      it('should create new active reservation when not found in database', async () => {
        reservationRepository.findByReservationId.mockResolvedValue(null);

        await service.process(mockReservationDto);

        expect(reservationRepository.findByReservationId).toHaveBeenCalledWith('RES-123');
        expect(reservationRepository.create).toHaveBeenCalledWith({
          reservationId: 'RES-123',
          guestName: 'John Doe',
          status: ReservationStatus.PENDING,
          checkInDate: new Date('2024-01-15'),
          checkOutDate: new Date('2024-01-20'),
        });
        expect(logger.debug).toHaveBeenCalledWith('Created new reservation RES-123');
      });
    });

    describe('when reservation is pending', () => {
      const pendingReservationDto: ReservationDto = {
        ...mockReservationDto,
        status: ReservationStatus.PENDING,
      };

      it('should update existing pending reservation', async () => {
        reservationRepository.findByReservationId.mockResolvedValue(mockExistingReservation);

        await service.process(pendingReservationDto);

        expect(reservationRepository.findByReservationId).toHaveBeenCalledWith('RES-123');
        expect(reservationRepository.update).toHaveBeenCalledWith('existing-id', {
          reservationId: 'RES-123',
          guestName: 'John Doe',
          status: ReservationStatus.PENDING,
          checkInDate: new Date('2024-01-15'),
          checkOutDate: new Date('2024-01-20'),
        });
        expect(logger.debug).toHaveBeenCalledWith('Updated existing reservation RES-123');
      });

      it('should create new pending reservation when not found in database', async () => {
        reservationRepository.findByReservationId.mockResolvedValue(null);

        await service.process(pendingReservationDto);

        expect(reservationRepository.findByReservationId).toHaveBeenCalledWith('RES-123');
        expect(reservationRepository.create).toHaveBeenCalledWith({
          reservationId: 'RES-123',
          guestName: 'John Doe',
          status: ReservationStatus.PENDING,
          checkInDate: new Date('2024-01-15'),
          checkOutDate: new Date('2024-01-20'),
        });
        expect(logger.debug).toHaveBeenCalledWith('Created new reservation RES-123');
      });
    });
  });

  describe('error handling', () => {
    const mockReservationDto: ReservationDto = {
      reservationId: 'RES-123',
      guestName: 'John Doe',
      status: ReservationStatus.PENDING,
      checkInDate: '2024-01-15',
      checkOutDate: '2024-01-20',
    };

    it('should handle repository findByReservationId error', async () => {
      const error = new Error('Database connection error');
      reservationRepository.findByReservationId.mockRejectedValue(error);

      await expect(service.process(mockReservationDto)).rejects.toThrow('Database connection error');
    });

    it('should handle repository update error', async () => {
      const mockExistingReservation: Reservation = {
        id: 'existing-id',
        reservationId: 'RES-123',
      } as Reservation;

      reservationRepository.findByReservationId.mockResolvedValue(mockExistingReservation);
      const error = new Error('Update failed');
      reservationRepository.update.mockRejectedValue(error);

      await expect(service.process(mockReservationDto)).rejects.toThrow('Update failed');
    });

    it('should handle repository create error', async () => {
      reservationRepository.findByReservationId.mockResolvedValue(null);
      const error = new Error('Create failed');
      reservationRepository.create.mockRejectedValue(error);

      await expect(service.process(mockReservationDto)).rejects.toThrow('Create failed');
    });
  });
});
