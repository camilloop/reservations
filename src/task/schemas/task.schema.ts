import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { TaskStatus } from '../enums';
import { ErrorReport } from './error-report.schema';

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
export class Task {
  @ApiProperty({ description: 'Unique identifier of the task', example: '507f1f77bcf86cd799439011' })
  id: string;

  @Prop({ required: true })
  @ApiProperty({ description: 'Path to the uploaded file', example: '/uploads/reservations_123.xlsx' })
  filePath: string;

  @Prop({ required: true, enum: TaskStatus, default: TaskStatus.PENDING })
  @ApiProperty({ description: 'Current status of the task', enum: TaskStatus })
  status: TaskStatus;

  @Prop({ default: Date.now })
  @ApiProperty({ description: 'Task creation date', example: '2024-04-13T10:00:00.000Z' })
  createdAt: Date;

  @Prop({ type: [Object], default: [] })
  @ApiProperty({
    type: [ErrorReport],
    description: 'List of processing errors',
    required: false,
  })
  errorReport?: ErrorReport[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
