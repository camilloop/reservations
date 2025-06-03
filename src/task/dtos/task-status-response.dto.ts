import { OmitType } from '@nestjs/swagger';

import { Task } from '../schemas';

export class TaskStatusResponseDto extends OmitType(Task, ['filePath', 'createdAt'] as const) {}
