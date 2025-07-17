"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../services/logger");
const prisma_1 = require("../services/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = '2h';
class AuthController {
    static async login(req, res) {
        logger_1.Logger.debug(`[AuthController.login] Body: ${JSON.stringify(req.body)}`);
        const { email, password } = req.body;
        try {
            const user = await prisma_1.prisma.user.findUnique({ where: { email } });
            if (!user) {
                logger_1.Logger.warn(`[AuthController.login] Utilisateur non trouvé: ${email}`);
                return res.status(401).json({ error: 'Identifiants invalides' });
            }
            const valid = await bcryptjs_1.default.compare(password, user.password);
            if (!valid) {
                logger_1.Logger.warn(`[AuthController.login] Mot de passe invalide pour ${email}`);
                return res.status(401).json({ error: 'Identifiants invalides' });
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            logger_1.Logger.info(`[AuthController.login] Connexion réussie pour ${email}`);
            res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
        }
        catch (err) {
            logger_1.Logger.error(`[AuthController.login] Erreur serveur: ${err}`);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
}
exports.AuthController = AuthController;
