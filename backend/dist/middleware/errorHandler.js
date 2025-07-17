"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logger_1 = require("../services/logger");
function errorHandler(err, req, res, next) {
    logger_1.Logger.error(`[errorHandler] ${err.message}`);
    res.status(err.status || 500).json({ error: err.message || 'Erreur interne du serveur' });
}
