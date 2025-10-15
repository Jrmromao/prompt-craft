type LogLevel = 'info' | 'error' | 'warn' | 'debug';

class Logger {
  private static instance: Logger;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, meta?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
    };

    switch (level) {
      case 'error':
        console.error(JSON.stringify(logEntry));
        break;
      case 'warn':
        console.warn(JSON.stringify(logEntry));
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(JSON.stringify(logEntry));
        }
        break;
      default:
    }
  }

  public info(message: string, meta?: Record<string, any>) {
    this.log('info', message, meta);
  }

  public error(message: string, meta?: Record<string, any>) {
    this.log('error', message, meta);
  }

  public warn(message: string, meta?: Record<string, any>) {
    this.log('warn', message, meta);
  }

  public debug(message: string, meta?: Record<string, any>) {
    this.log('debug', message, meta);
  }
}

export const logger = Logger.getInstance(); 