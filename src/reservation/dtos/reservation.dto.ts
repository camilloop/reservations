import { IsString, IsEnum, IsDateString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

import { ReservationStatus } from '../enums';

const convertExcelDate = (value: string | Date): string => {
  if (!value) return value;

  if (typeof value === 'string' && /^\d+$/.test(value)) {
    const excelDate = parseInt(value, 10);
    const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }

  if (value instanceof Date || (typeof value === 'string' && value.includes('GMT'))) {
    const date = new Date(value);
    return date.toISOString().split('T')[0];
  }

  return value;
};

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
    return convertExcelDate(value);
  })
  @IsDateString()
  checkInDate: string;

  @Transform(({ value }) => {
    return convertExcelDate(value);
  })
  @IsDateString()
  checkOutDate: string;
}
