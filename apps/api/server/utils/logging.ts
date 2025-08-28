import winston from 'winston';
import { join } from 'path';

let loggerInstance: winston.Logger;

function createLogger() {
  const transports: any[] = [
  ];

  if (import.meta.dev) {
    transports.push(
      new winston.transports.Console({
        level: 'silly',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.label({ label: 'ENVO', message: true }),
          winston.format.cli(),
        )
      }),
      new winston.transports.File({
        level: 'error',
        filename: 'error.log',
        dirname: join(process.cwd(), 'logs'),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.label({ label: 'ENVO', message: true }),
          winston.format.simple()
        )
      }),
      new winston.transports.File({
        level: 'info',
        filename: 'info.log',
        dirname: join(process.cwd(), 'logs'),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.label({ label: 'ENVO', message: true }),
          winston.format.simple()
        )
      }),
      new winston.transports.File({
        level: 'http',
        filename: 'access.log',
        dirname: join(process.cwd(), 'logs'),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.label({ label: 'ENVO', message: true }),
          winston.format.simple()
        )
      })
    );
  } else {
    // TODO: setup http transport
  }
  return winston.createLogger({
    transports
  })
}

export function useLogger() {
  if (!loggerInstance) {
    loggerInstance = createLogger();
  }
  return loggerInstance;
}