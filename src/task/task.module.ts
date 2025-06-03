import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';

import { Task, TaskSchema } from './schemas';
import { TaskController } from './controllers/task.controller';
import { FileProcessingProcessor, FileProcessingService, TaskService } from './services';
import { ReservationModule } from '../reservation/reservation.module';
import { TaskRepository } from './repositories/mongodb';
import { LoggerMiddleware } from '../_shared/core/logger/logger.middleware';
import { TaskProducer } from './services/producer';
import { TaskStatusGateway } from './gateways/task-status.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    BullModule.registerQueue({
      name: 'tasks',
    }),
    ReservationModule,
  ],
  controllers: [TaskController],
  providers: [
    TaskService,
    FileProcessingService,
    FileProcessingProcessor,
    Logger,
    TaskRepository,
    TaskProducer,
    TaskStatusGateway,
  ],
  exports: [TaskService],
})
export class TaskModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes(TaskController);
  }
}
