import * as Joi from 'joi';

import { LoggerLevel } from '../core/configs/logger-level.enum';

export const validationSchemaConfig = Joi.object({
  PROCESS_NAME: Joi.string().required(),
  NODE_ENV: Joi.string().valid('development', 'production', 'test', 'provision').default('production'),
  MONGODB_URI: Joi.string().required(),
  REDIS_HOST: Joi.string().default('redis'),
  REDIS_PORT: Joi.number().default(6379),
  API_KEY: Joi.string().required(),
  LOG_LEVEL: Joi.string()
    .valid(...Object.values(LoggerLevel))
    .default(LoggerLevel.Info),
});
