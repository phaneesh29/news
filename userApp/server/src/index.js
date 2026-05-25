import http from 'http';
import app from './app.js';
import env from './config/env.js';
import logger from './utils/logger.js';

const server = http.createServer(app);

const gracefulShutdown = (signal) => {
  logger.warn(`${signal} received. Shutting down gracefully...`);
  
  server.close(() => {
    logger.info('Http server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};


process.on('uncaughtException', (err) => {
  logger.error(err, 'UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error(err, 'UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

server.listen(env.PORT, () => {
  logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});
