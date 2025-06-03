import { NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class TaskNotFoundException extends NotFoundException {
  @ApiProperty({ example: 404, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: 'Task with id 12345 not found', description: 'Error message' })
  message: string;

  @ApiProperty({ example: 'Not Found', description: 'Short description of the HTTP error' })
  error: string;

  constructor(id: string) {
    super(`Task with id ${id} not found`);
  }
}
