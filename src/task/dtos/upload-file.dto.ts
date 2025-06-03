import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'XLSX file with reservations' })
  @IsNotEmpty()
  file: Express.Multer.File;
}
