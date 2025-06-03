import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';

import { FileProcessingService } from '../services';
import { Task } from '../schemas';

@Processor('tasks')
export class FileProcessingProcessor extends WorkerHost {
  constructor(
    private readonly fileProcessingService: FileProcessingService,
    private readonly logger: Logger,
  ) {
    super();
  }

  async process(job: Job<Task, void>): Promise<void> {
    const task = job.data;
    this.logger.debug(`Processing job ${job.id} for task ${task.id}`);

    try {
      await this.fileProcessingService.process(task);
      this.logger.debug(`Job ${job.id} completed for task ${task.id}`);
    } catch (error) {
      this.logger.error(`Job ${job.id} failed for task ${task.id}: ${error.message}`);
      throw error;
    }
  }
}
