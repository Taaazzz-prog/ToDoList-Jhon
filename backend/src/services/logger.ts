import fs from 'fs';
import path from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private static logFile = path.join(__dirname, '../../logs/backend.log');
  private static level: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'debug';

  private static write(level: LogLevel, message: string) {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    fs.appendFileSync(Logger.logFile, logMsg, { encoding: 'utf8' });
    if (Logger.level === 'debug' || level !== 'debug') {
      // Affiche tout sauf debug si niveau > debug
      // Sinon tout
      // eslint-disable-next-line no-console
      console.log(logMsg.trim());
    }
  }

  static debug(msg: string) { Logger.write('debug', msg); }
  static info(msg: string) { Logger.write('info', msg); }
  static warn(msg: string) { Logger.write('warn', msg); }
  static error(msg: string) { Logger.write('error', msg); }
}
