import { Error } from 'mongoose';
import { Row } from 'exceljs';
import * as ExcelJS from 'exceljs';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Injectable, Logger } from '@nestjs/common';

import { TaskService } from './task.service';
import { Task, ErrorReport } from '../schemas';
import { TaskStatus } from '../enums';
import { ReservationDto } from '../../reservation/dtos';
import { ReservationStatus } from '../../reservation/enums';
import { ReservationProcessorService } from '../../reservation/services';

const EXCEL_COLUMNS = {
  RESERVATION_ID: 1,
  GUEST_NAME: 2,
  STATUS: 3,
  CHECK_IN_DATE: 4,
  CHECK_OUT_DATE: 5,
};

const MAX_ERRORS = 100;

@Injectable()
export class FileProcessingService {
  constructor(
    private readonly taskService: TaskService,
    private readonly reservationProcessorService: ReservationProcessorService,
    private readonly logger: Logger,
  ) {}

  async process(task: Task): Promise<void> {
    try {
      await this.taskService.updateStatus(task.id, TaskStatus.IN_PROGRESS);
      const errors = await this.#streamAndProcessFile(task.filePath);

      await this.taskService.updateStatusWithErrors(task.id, TaskStatus.COMPLETED, errors);
      this.logger.debug(`File processing completed for task ${task.id} with ${errors.length} errors`);
    } catch (error) {
      await this.#handleProcessingError(task.id, error);
      throw error;
    }
  }

  async #streamAndProcessFile(filePath: string): Promise<ErrorReport[]> {
    const errors: ErrorReport[] = [];
    let rowIndex = 0;

    const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(filePath, {
      styles: 'ignore',
      worksheets: 'emit',
    });

    for await (const worksheet of workbookReader) {
      for await (const row of worksheet) {
        rowIndex++;

        if (rowIndex === 1 || !row || this.#isRowEmpty(row)) {
          continue;
        }

        try {
          await this.#processReservationRow(row, rowIndex, errors);
          if (errors.length >= MAX_ERRORS) {
            this.logger.warn(
              `Maximum number of errors (${MAX_ERRORS}) reached. Stopping file processing at row ${rowIndex}.`,
            );
            return errors;
          }
        } catch (error) {
          this.logger.error(`Error processing row ${rowIndex}: ${error.message}`);

          if (errors.length < MAX_ERRORS) {
            errors.push(this.#createErrorReport(rowIndex, `Unexpected error: ${error.message}`));
          } else {
            this.logger.warn(
              `Maximum number of errors (${MAX_ERRORS}) reached. Stopping file processing at row ${rowIndex}.`,
            );
            return errors;
          }
        }
      }
    }

    return errors;
  }

  #isRowEmpty(row: Row): boolean {
    const reservationId = row.getCell(EXCEL_COLUMNS.RESERVATION_ID).value;
    const guestName = row.getCell(EXCEL_COLUMNS.GUEST_NAME).value;
    const status = row.getCell(EXCEL_COLUMNS.STATUS).value;
    const checkInDate = row.getCell(EXCEL_COLUMNS.CHECK_IN_DATE).value;
    const checkOutDate = row.getCell(EXCEL_COLUMNS.CHECK_OUT_DATE).value;

    return !reservationId && !guestName && !status && !checkInDate && !checkOutDate;
  }

  async #processReservationRow(row: Row, rowIndex: number, errors: ErrorReport[]): Promise<void> {
    const reservationData = {
      reservationId: row.getCell(EXCEL_COLUMNS.RESERVATION_ID).value?.toString(),
      guestName: row.getCell(EXCEL_COLUMNS.GUEST_NAME).value?.toString(),
      status: row.getCell(EXCEL_COLUMNS.STATUS).value?.toString(),
      checkInDate: row.getCell(EXCEL_COLUMNS.CHECK_IN_DATE).value?.toString(),
      checkOutDate: row.getCell(EXCEL_COLUMNS.CHECK_OUT_DATE).value?.toString(),
    };

    const reservationDto = plainToClass(ReservationDto, reservationData);
    const validationErrors = await validate(reservationDto);
    if (validationErrors.length > 0) {
      this.#addValidationErrors(validationErrors, rowIndex, errors);
      return;
    }

    try {
      await this.reservationProcessorService.process(reservationDto);
    } catch (error) {
      errors.push(
        this.#createErrorReport(
          rowIndex,
          `Database operation failed: ${error.message}`,
          'Please check the data and try again',
        ),
      );
    }
  }

  #addValidationErrors(validationErrors: ValidationError[], rowIndex: number, errors: ErrorReport[]): void {
    for (const validationError of validationErrors) {
      if (errors.length >= MAX_ERRORS) return;

      const constraints = validationError.constraints;
      if (constraints) {
        const errorMessages = Object.values(constraints);
        errors.push(
          this.#createErrorReport(
            rowIndex,
            `Validation error in ${validationError.property}: ${errorMessages.join(', ')}`,
            this.#getValidationSuggestion(validationError.property),
          ),
        );
      }
    }
  }

  #createErrorReport(row: number, reason: string, suggestion?: string): ErrorReport {
    return {
      row,
      reason,
      suggestion: suggestion || 'Please check the data format and try again',
    };
  }

  async #handleProcessingError(taskId: string, error: Error): Promise<void> {
    this.logger.error(`File processing failed for task ${taskId}: ${error.message}`);
    const errors: ErrorReport[] = [
      this.#createErrorReport(
        0,
        `File processing failed: ${error.message}`,
        'Please verify the data format and try again',
      ),
    ];
    await this.taskService.updateStatusWithErrors(taskId, TaskStatus.FAILED, errors);
  }

  #getValidationSuggestion(property: string): string {
    const suggestions = {
      reservationId: 'Provide a valid reservation ID (non-empty string)',
      guestName: 'Provide a valid guest name (non-empty string)',
      status: `Status must be one of: ${Object.values(ReservationStatus).join(', ')}`,
      checkInDate: 'Use YYYY-MM-DD date format or valid Excel date',
      checkOutDate: 'Use YYYY-MM-DD date format or valid Excel date',
    };

    return suggestions[property as keyof typeof suggestions] || 'Please check the data format and requirements';
  }
}
