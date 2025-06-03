import { Queue } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';

import { Task } from '../../schemas';

@Injectable()
export class TaskProducer {
  constructor(
    @InjectQueue('tasks') private fileProcessingQueue: Queue,
    private readonly logger: Logger,
  ) {}

  async addToQueue(task: Task): Promise<void> {
    await this.fileProcessingQueue.add('process-reservations', task, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 10,
      removeOnFail: 5,
    });

    this.logger.debug(`Task created with ID: ${task.id}`);
  }
}
