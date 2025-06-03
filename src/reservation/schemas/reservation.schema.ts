import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { ReservationStatus } from '../enums';

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Reservation {
  @ApiProperty({ description: 'Unique identifier of the reservation' })
  id: string;

  @Prop({ required: true, unique: true })
  @ApiProperty({ description: 'Reservation ID from external system', example: '12345' })
  reservationId: string;

  @Prop({ required: true })
  @ApiProperty({ description: 'Guest name', example: 'Jan Nowak' })
  guestName: string;

  @Prop({ required: true, enum: ReservationStatus })
  @ApiProperty({ description: 'Reservation status', enum: ReservationStatus })
  status: ReservationStatus;

  @Prop({ required: true })
  @ApiProperty({ description: 'Check-in date', example: '2024-05-01' })
  checkInDate: Date;

  @Prop({ required: true })
  @ApiProperty({ description: 'Check-out date', example: '2024-05-07' })
  checkOutDate: Date;

  @Prop({ default: Date.now })
  @ApiProperty({ description: 'Record creation date' })
  createdAt: Date;

  @Prop({ default: Date.now })
  @ApiProperty({ description: 'Record last update date' })
  updatedAt: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
