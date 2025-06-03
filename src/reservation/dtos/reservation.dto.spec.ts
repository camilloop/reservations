import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ReservationDto } from './reservation.dto';
import { ReservationStatus } from '../enums';

describe('ReservationDto', () => {
  it('should validate a correct reservation dto', async () => {
    const body: ReservationDto = {
      reservationId: 'RES123',
      guestName: 'John Doe',
      status: ReservationStatus.PENDING,
      checkInDate: '2025-06-10',
      checkOutDate: '2025-06-15',
    };

    const dto = plainToInstance(ReservationDto, body);
    const errors = await validate(dto);

    expect(errors).toEqual([]);
    expect(dto).toEqual(body);
  });

  it('should fail validation for invalid reservation dto', async () => {
    const body = {
      reservationId: '',
      guestName: '',
      status: 'INVALID_STATUS',
      checkInDate: 'invalid-date',
      checkOutDate: 'invalid-date',
    };

    const dto = plainToInstance(ReservationDto, body);
    const errors = await validate(dto);

    expect(errors.length).toBe(5);
    expect(errors[0].constraints).toBeDefined();
  });

  it('should transform Excel date objects to ISO strings', async () => {
    const body = {
      reservationId: 'RES123',
      guestName: 'John Doe',
      status: ReservationStatus.PENDING,
      checkInDate: new Date('2024-05-01'),
      checkOutDate: new Date('2024-05-07'),
    };

    const dto = plainToInstance(ReservationDto, body);
    const errors = await validate(dto);

    expect(errors).toEqual([]);
    expect(dto.checkInDate).toBe('2024-05-01');
    expect(dto.checkOutDate).toBe('2024-05-07');
  });

  it('should transform Excel date strings with GMT to ISO strings', async () => {
    const body = {
      reservationId: 'RES123',
      guestName: 'John Doe',
      status: ReservationStatus.PENDING,
      checkInDate: 'Wed May 01 2024 02:00:00 GMT+0200 (Central European Summer Time)',
      checkOutDate: 'Tue May 07 2024 02:00:00 GMT+0200 (Central European Summer Time)',
    };

    const dto = plainToInstance(ReservationDto, body);
    const errors = await validate(dto);

    expect(errors).toEqual([]);
    expect(dto.checkInDate).toBe('2024-05-01');
    expect(dto.checkOutDate).toBe('2024-05-07');
  });

  it('should transform Excel serial date numbers to ISO strings', async () => {
    const body = {
      reservationId: 'RES123',
      guestName: 'John Doe',
      status: ReservationStatus.PENDING,
      checkInDate: '45413',
      checkOutDate: '45419',
    };

    const dto = plainToInstance(ReservationDto, body);
    const errors = await validate(dto);

    expect(errors).toEqual([]);
    expect(dto.checkInDate).toBe('2024-05-01');
    expect(dto.checkOutDate).toBe('2024-05-07');
  });
});
