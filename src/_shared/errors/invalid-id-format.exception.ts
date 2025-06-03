import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class InvalidIdFormatException extends BadRequestException {
  @ApiProperty({ example: 400, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: 'Invalid id format: 12345', description: 'Error message' })
  message: string;

  @ApiProperty({ example: 'Bad Request', description: 'Short description of the HTTP error' })
  error: string;

  constructor(id: string) {
    super(`Invalid id format: ${id}`);
  }
}
