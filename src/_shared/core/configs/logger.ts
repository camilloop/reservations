import { createLogger, format, Logger, transports } from 'winston';
// eslint-disable-next-line import/no-duplicates
import DailyRotateFile from 'winston-daily-rotate-file';
// eslint-disable-next-line import/no-duplicates
import 'winston-daily-rotate-file';

import { LoggerLevel } from './logger-level.enum';

export const logger = (level: LoggerLevel): Logger => {
  const fileTransport: DailyRotateFile = new transports.DailyRotateFile({
    filename: '%DATE%.log',
    dirname: './logs',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    createSymlink: true,
    level: level || LoggerLevel.Info,
  });

  const consoleTransport = new transports.Console({
    format: format.combine(
      format.colorize(),
      format.timestamp(),
      format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`),
    ),
    level: level || LoggerLevel.Info,
  });

  return createLogger({
    level: level || LoggerLevel.Info,
    transports: [consoleTransport, fileTransport],
    format: format.combine(
      format.timestamp(),
      format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`),
    ),
  });
};
