import { ApiProperty } from '@nestjs/swagger';

export class ErrorReport {
  @ApiProperty({
    description: 'Row number where the error occurred',
    example: 5,
  })
  row: number;

  @ApiProperty({
    description: 'Reason for the processing error',
    example: 'Invalid date format',
  })
  reason: string;

  @ApiProperty({
    description: 'Suggestion to fix the error',
    example: 'Use YYYY-MM-DD format for dates',
  })
  suggestion: string;
}
