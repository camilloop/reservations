import { NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class WorksheetNotFoundException extends NotFoundException {
  @ApiProperty({ example: 404, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: 'Worksheet not found', description: 'Error message' })
  message: string;

  @ApiProperty({ example: 'Not Found', description: 'Short description of the HTTP error' })
  error: string;

  constructor() {
    super('Worksheet not found');
  }
}
