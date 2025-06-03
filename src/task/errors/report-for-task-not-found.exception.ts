import { NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ReportForTaskNotFoundException extends NotFoundException {
  @ApiProperty({ example: 404, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: 'Report for task with id 12345 not found', description: 'Error message' })
  message: string;

  @ApiProperty({ example: 'Not Found', description: 'Short description of the HTTP error' })
  error: string;

  constructor(id: string) {
    super(`Report for task with id ${id} not found`);
  }
}
