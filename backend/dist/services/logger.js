"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class Logger {
    static write(level, message) {
        const timestamp = new Date().toISOString();
        const logMsg = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
        fs_1.default.appendFileSync(Logger.logFile, logMsg, { encoding: 'utf8' });
        if (Logger.level === 'debug' || level !== 'debug') {
            // Affiche tout sauf debug si niveau > debug
            // Sinon tout
            // eslint-disable-next-line no-console
            console.log(logMsg.trim());
        }
    }
    static debug(msg) { Logger.write('debug', msg); }
    static info(msg) { Logger.write('info', msg); }
    static warn(msg) { Logger.write('warn', msg); }
    static error(msg) { Logger.write('error', msg); }
}
exports.Logger = Logger;
Logger.logFile = path_1.default.join(__dirname, '../../logs/backend.log');
Logger.level = process.env.LOG_LEVEL || 'debug';
