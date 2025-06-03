import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ReservationProcessorService } from './services';
import { Reservation, ReservationSchema } from './schemas';
import { ReservationRepository } from './repositories/mongodb';

@Module({
  imports: [MongooseModule.forFeature([{ name: Reservation.name, schema: ReservationSchema }])],
  providers: [ReservationRepository, ReservationProcessorService, Logger],
  exports: [ReservationProcessorService],
})
export class ReservationModule {}
