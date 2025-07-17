import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Logger } from '../services/logger';
import { prisma } from '../services/prisma';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = '2h';

export class AuthController {
  static async login(req: Request, res: Response) {
    Logger.debug(`[AuthController.login] Body: ${JSON.stringify(req.body)}`);
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        Logger.warn(`[AuthController.login] Utilisateur non trouvé: ${email}`);
        return res.status(401).json({ error: 'Identifiants invalides' });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        Logger.warn(`[AuthController.login] Mot de passe invalide pour ${email}`);
        return res.status(401).json({ error: 'Identifiants invalides' });
      }
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      Logger.info(`[AuthController.login] Connexion réussie pour ${email}`);
      res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
      Logger.error(`[AuthController.login] Erreur serveur: ${err}`);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // register sera implémenté après validation du login
}
