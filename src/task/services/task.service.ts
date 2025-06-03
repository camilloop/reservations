import { Injectable } from '@nestjs/common';

import { TaskStatusResponseDto } from '../dtos';
import { TaskRepository } from '../repositories/mongodb';
import { ReportForTaskNotFoundException, TaskNotFoundException } from '../errors';
import { TaskProducer } from './producer';
import { ErrorReport, Task } from '../schemas';
import { TaskStatus } from '../enums';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly taskProducer: TaskProducer,
  ) {}

  async createTask(filePath: string): Promise<{ taskId: string }> {
    const task = await this.taskRepository.create({ filePath });
    await this.taskProducer.addToQueue(task);

    return { taskId: task.id };
  }

  async getTaskStatus(taskId: string): Promise<TaskStatusResponseDto> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new TaskNotFoundException(taskId);
    }

    return {
      id: task.id,
      status: task.status,
      errorReport: task.errorReport,
    };
  }

  async getTaskReport(taskId: string): Promise<ErrorReport[]> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new TaskNotFoundException(taskId);
    }

    if (task.errorReport === undefined || task.errorReport.length === 0) {
      throw new ReportForTaskNotFoundException(taskId);
    }

    return task.errorReport;
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task | null> {
    return await this.taskRepository.updateFields(id, { status });
  }

  async updateStatusWithErrors(id: string, status: TaskStatus, errorReport: ErrorReport[]): Promise<Task | null> {
    return await this.taskRepository.updateFields(id, { status, errorReport });
  }
}
