"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const logger_1 = require("../services/logger");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    logger_1.Logger.debug(`[authMiddleware] Header: ${authHeader}`);
    if (!token) {
        logger_1.Logger.warn('[authMiddleware] Token manquant');
        return res.status(401).json({ error: 'Token manquant' });
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            logger_1.Logger.warn(`[authMiddleware] Token invalide: ${err.message}`);
            return res.status(403).json({ error: 'Token invalide' });
        }
        logger_1.Logger.debug('[authMiddleware] Token valide');
        req.user = user;
        next();
    });
}
