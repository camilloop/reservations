import { Response } from 'express';
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Logger,
  UseFilters,
  Get,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  getSchemaPath,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiSecurity,
} from '@nestjs/swagger';

import { TaskService } from '../services';
import { TaskStatusResponseDto, UploadFileDto } from '../dtos';
import { LoggerExceptionFilter } from '../../_shared/core/logger/logger.exception-filter';
import { createFileUploadConfig } from '../../_shared/configs/file-upload.config';
import {
  InvalidIdFormatException,
  WrongFileExtensionException,
  CustomInternalServerErrorException,
} from '../../_shared/errors';
import { ReportForTaskNotFoundException, TaskNotFoundException } from '../errors';
import { ApiKeyGuard } from '../../_shared/core/auth/api-key.guard';

@ApiTags('tasks')
@Controller('tasks')
@UseFilters(LoggerExceptionFilter)
@ApiExtraModels(
  WrongFileExtensionException,
  CustomInternalServerErrorException,
  CustomInternalServerErrorException,
  TaskNotFoundException,
  ReportForTaskNotFoundException,
  InvalidIdFormatException,
)
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly logger: Logger,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload XLSX file with reservations for processing' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'XLSX file with reservations',
    type: UploadFileDto,
  })
  @ApiOkResponse({
    description: 'File uploaded successfully, task created',
    schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', example: '507f1f77bcf86cd799439011' },
      },
    },
  })
  @ApiBadRequestResponse({
    schema: {
      $ref: getSchemaPath(WrongFileExtensionException),
    },
  })
  @ApiInternalServerErrorResponse({
    schema: {
      $ref: getSchemaPath(CustomInternalServerErrorException),
    },
  })
  @UseInterceptors(FileInterceptor('file', createFileUploadConfig('reservations')))
  async uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
  ): Promise<{ taskId: string }> {
    this.logger.debug(`File uploaded: ${file.filename}`);

    return await this.taskService.createTask(file.path);
  }

  @Get('status/:taskId')
  @ApiOperation({ summary: 'Get task status by ID' })
  @ApiOkResponse({
    description: 'Task status retrieved successfully',
    type: TaskStatusResponseDto,
  })
  @ApiNotFoundResponse({
    schema: {
      $ref: getSchemaPath(TaskNotFoundException),
    },
  })
  @ApiBadRequestResponse({
    content: {
      'application/json': {
        schema: {
          $ref: getSchemaPath(InvalidIdFormatException),
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    schema: {
      $ref: getSchemaPath(CustomInternalServerErrorException),
    },
  })
  async getTaskStatus(@Param('taskId') taskId: string): Promise<TaskStatusResponseDto> {
    return await this.taskService.getTaskStatus(taskId);
  }

  @Get('report/:taskId')
  @ApiOperation({ summary: 'Download task processing report' })
  @ApiOkResponse({
    description: 'Report downloaded successfully',
    content: {
      'application/json': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      oneOf: [{ $ref: getSchemaPath(TaskNotFoundException) }, { $ref: getSchemaPath(ReportForTaskNotFoundException) }],
    },
  })
  @ApiBadRequestResponse({
    content: {
      'application/json': {
        schema: {
          $ref: getSchemaPath(InvalidIdFormatException),
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    schema: {
      $ref: getSchemaPath(CustomInternalServerErrorException),
    },
  })
  async getTaskReport(@Param('taskId') taskId: string, @Res() res: Response): Promise<void> {
    const report = await this.taskService.getTaskReport(taskId);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="task-report-${taskId}.json"`);

    res.send(JSON.stringify(report, null, 2));
  }
}
