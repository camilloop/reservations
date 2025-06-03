import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class WrongFileExtensionException extends BadRequestException {
  @ApiProperty({ example: 400, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: 'Wrong file extension .pdf. Only .xlsx files are allowed', description: 'Error message' })
  message: string;

  @ApiProperty({ example: 'Bad Request', description: 'Short description of the HTTP error' })
  error: string;

  constructor(allowedExtensions: string[], fileExtension: string) {
    super(`Wrong file extension: ${fileExtension}. Only ${allowedExtensions.join(', ')} files are allowed`);
  }
}
