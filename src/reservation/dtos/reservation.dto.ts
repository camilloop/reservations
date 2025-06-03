import { IsString, IsEnum, IsDateString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

import { ReservationStatus } from '../enums';

export class ReservationDto {
  @IsString()
  @IsNotEmpty()
  reservationId: string;

  @IsString()
  @IsNotEmpty()
  guestName: string;

  @IsEnum(ReservationStatus)
  status: ReservationStatus;

  @Transform(({ value }) => {
    if (value instanceof Date || (typeof value === 'string' && value.includes('GMT'))) {
      const date = new Date(value);
      return date.toISOString().split('T')[0];
    }
    return value;
  })
  @IsDateString()
  checkInDate: string;

  @Transform(({ value }) => {
    if (value instanceof Date || (typeof value === 'string' && value.includes('GMT'))) {
      const date = new Date(value);
      return date.toISOString().split('T')[0];
    }
    return value;
  })
  @IsDateString()
  checkOutDate: string;
}
