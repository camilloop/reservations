import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Reservations API')
  .setDescription('Reservations API')
  .setVersion('1.0')
  .build();
