import { InternalServerErrorException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class CustomInternalServerErrorException extends InternalServerErrorException {
  @ApiProperty({ example: 500, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: 'Internal server error', description: 'Error message' })
  message: string;
}
