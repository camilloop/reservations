import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';

import { HealthModule } from './_shared/core/health/health.module';
import { validationSchemaConfig } from './_shared/configs/validation-schema';
import { LoggerModule } from './_shared/core/logger/logger.module';
import { TaskModule } from './task/task.module';
import { ReservationModule } from './reservation/reservation.module';
import { AuthModule } from './_shared/core/auth/auth.module';

@Module({
  imports: [
    HealthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: validationSchemaConfig,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI!),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    LoggerModule,
    TaskModule,
    ReservationModule,
    AuthModule,
  ],
  providers: [Logger],
})
export class AppModule {}
