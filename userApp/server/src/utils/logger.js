import pino from 'pino';
import env from '../config/env.js';

const isProduction = env.NODE_ENV === 'production';

const logger = pino({
  level: isProduction ? 'info' : 'debug',
  base: isProduction ? { service: 'devbits-api' } : undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(isProduction ? {} : {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname'
      }
    }
  })
});

export default logger;
