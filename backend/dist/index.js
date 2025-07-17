"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("./services/logger");
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
// Chargement des variables d'environnement
const envPath = path_1.default.join(__dirname, '../.env');
dotenv_1.default.config({ path: envPath });
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
// Middleware de log ultra complet
app.use((req, res, next) => {
    logger_1.Logger.info(`Requête entrante: ${req.method} ${req.url} | IP: ${req.ip}`);
    res.on('finish', () => {
        logger_1.Logger.info(`Réponse: ${req.method} ${req.url} | Status: ${res.statusCode}`);
    });
    next();
});
// Routes d'authentification
app.use('/auth', auth_routes_1.default);
app.get('/health', (req, res) => {
    logger_1.Logger.debug('Vérification de santé demandée');
    res.status(200).json({ status: 'ok', date: new Date().toISOString() });
});
// Gestion des erreurs globales
app.use(errorHandler_1.errorHandler);
app.listen(port, () => {
    logger_1.Logger.info(`Serveur backend démarré sur le port ${port} (env: ${process.env.NODE_ENV})`);
});
