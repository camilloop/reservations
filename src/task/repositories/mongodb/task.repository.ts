import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Task } from '../../schemas';
import { InvalidIdFormatException } from '../../../_shared/errors';
import { CreateTask } from '../../types';

@Injectable()
export class TaskRepository {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async findById(id: string): Promise<Task | null> {
    try {
      return await this.taskModel.findById(id).exec();
    } catch (error) {
      if (error.name === 'CastError' && error.kind === 'ObjectId') {
        throw new InvalidIdFormatException(id);
      }

      throw error;
    }
  }

  async create(task: CreateTask): Promise<Task> {
    return await this.taskModel.create(task);
  }

  async updateFields(id: string, updateFields: Partial<Task>): Promise<Task | null> {
    try {
      return await this.taskModel.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).exec();
    } catch (error) {
      if (error.name === 'CastError' && error.kind === 'ObjectId') {
        throw new InvalidIdFormatException(id);
      }

      throw error;
    }
  }
}
