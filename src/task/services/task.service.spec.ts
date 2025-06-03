import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

import { TaskService } from './task.service';
import { TaskRepository } from '../repositories/mongodb';
import { TaskProducer } from './producer';
import { TaskNotFoundException, ReportForTaskNotFoundException } from '../errors';
import { TaskStatusResponseDto } from '../dtos';
import { TaskStatus } from '../enums';
import { Task } from '../schemas';
import { TaskStatusGateway } from '../gateways/task-status.gateway';

describe('TaskService', () => {
  let service: TaskService;
  let taskRepository: jest.Mocked<TaskRepository>;
  let taskProducer: jest.Mocked<TaskProducer>;
  let taskStatusGateway: jest.Mocked<TaskStatusGateway>;

  const mockTask: Task = {
    id: '507f1f77bcf86cd799439011',
    filePath: '/uploads/reservations-1748851554908-787153009.xlsx',
    status: TaskStatus.PENDING,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: TaskRepository,
          useValue: createMock<TaskRepository>(),
        },
        {
          provide: TaskProducer,
          useValue: createMock<TaskProducer>(),
        },
        {
          provide: TaskStatusGateway,
          useValue: createMock<TaskStatusGateway>(),
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskRepository = module.get(TaskRepository);
    taskProducer = module.get(TaskProducer);
    taskStatusGateway = module.get(TaskStatusGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task and add it to queue', async () => {
      const filePath = '/uploads/test-file.xlsx';
      taskRepository.create.mockResolvedValue(mockTask);
      taskProducer.addToQueue.mockResolvedValue(undefined);

      const result = await service.createTask(filePath);

      expect(taskRepository.create).toHaveBeenCalledWith({ filePath });
      expect(taskProducer.addToQueue).toHaveBeenCalledWith(mockTask);
      expect(result).toEqual({ taskId: mockTask.id });
    });

    it('should throw error when repository create fails', async () => {
      const filePath = '/uploads/test-file.xlsx';
      const error = new Error('Database error');
      taskRepository.create.mockRejectedValue(error);

      await expect(service.createTask(filePath)).rejects.toThrow(error);
      expect(taskRepository.create).toHaveBeenCalledWith({ filePath });
      expect(taskProducer.addToQueue).not.toHaveBeenCalled();
    });

    it('should throw error when producer addToQueue fails', async () => {
      const filePath = '/uploads/test-file.xlsx';
      const error = new Error('Queue error');
      taskRepository.create.mockResolvedValue(mockTask);
      taskProducer.addToQueue.mockRejectedValue(error);

      await expect(service.createTask(filePath)).rejects.toThrow(error);
      expect(taskRepository.create).toHaveBeenCalledWith({ filePath });
      expect(taskProducer.addToQueue).toHaveBeenCalledWith(mockTask);
    });
  });

  describe('getTaskStatus', () => {
    it('should return task status when task exists', async () => {
      const taskId = '507f1f77bcf86cd799439011';
      taskRepository.findById.mockResolvedValue(mockTask);

      const expectedResponse: TaskStatusResponseDto = {
        id: mockTask.id,
        status: mockTask.status,
      };

      const result = await service.getTaskStatus(taskId);

      expect(taskStatusGateway.notifyTaskStatusUpdate).toHaveBeenCalledWith(taskId, expectedResponse);
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw TaskNotFoundException when task does not exist', async () => {
      const taskId = '507f1f77bcf86cd799439011';
      taskRepository.findById.mockResolvedValue(null);

      await expect(service.getTaskStatus(taskId)).rejects.toThrow(new TaskNotFoundException(taskId));
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    });

    it('should return task status without report when report is undefined', async () => {
      const taskId = '507f1f77bcf86cd799439011';
      const taskWithoutReport = { ...mockTask, report: undefined };
      taskRepository.findById.mockResolvedValue(taskWithoutReport);

      const expectedResponse: TaskStatusResponseDto = {
        id: taskWithoutReport.id,
        status: taskWithoutReport.status,
        errorReport: undefined,
      };

      const result = await service.getTaskStatus(taskId);

      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when repository findById fails', async () => {
      const taskId = '507f1f77bcf86cd799439011';
      const error = new Error('Database error');
      taskRepository.findById.mockRejectedValue(error);

      await expect(service.getTaskStatus(taskId)).rejects.toThrow(error);
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    });
  });

  describe('getTaskReport', () => {
    it('should return task report when task exists and has report', async () => {
      const taskId = '507f1f77bcf86cd799439011';
      const mockTaskWithReport = {
        ...mockTask,
        errorReport: [
          {
            row: 1,
            reason: 'Data validation error',
            suggestion: 'Fix the data in the row',
          },
        ],
      };
      taskRepository.findById.mockResolvedValue(mockTaskWithReport);

      const result = await service.getTaskReport(taskId);

      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(mockTaskWithReport.errorReport);
    });

    it('should throw TaskNotFoundException when task does not exist', async () => {
      const taskId = '507f1f77bcf86cd799439011';
      taskRepository.findById.mockResolvedValue(null);

      await expect(service.getTaskReport(taskId)).rejects.toThrow(new TaskNotFoundException(taskId));
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    });

    it('should throw ReportForTaskNotFoundException when task exists but has no report', async () => {
      const taskId = '507f1f77bcf86cd799439011';
      const taskWithoutReport = { ...mockTask, report: undefined };
      taskRepository.findById.mockResolvedValue(taskWithoutReport);

      await expect(service.getTaskReport(taskId)).rejects.toThrow(new ReportForTaskNotFoundException(taskId));
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    });

    it('should throw error when repository findById fails', async () => {
      const taskId = '507f1f77bcf86cd799439011';
      const error = new Error('Database error');
      taskRepository.findById.mockRejectedValue(error);

      await expect(service.getTaskReport(taskId)).rejects.toThrow(error);
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    });
  });
});
