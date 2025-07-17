

console.log('[DEBUG] Chargement de dotenv...');
import * as dotenv from 'dotenv';
const dotenvResult = dotenv.config({ path: __dirname + '/../.env' });
if (dotenvResult.error) {
  console.error('[DEBUG] Erreur lors du chargement de .env:', dotenvResult.error);
} else {
  console.log('[DEBUG] .env chargé avec succès');
}

console.log('[DEBUG] Import du client Prisma...');
import { prisma } from '../src/services/prisma';
console.log('[DEBUG] Import de bcryptjs...');
import * as bcrypt from 'bcryptjs';


console.log('[DEBUG] Début du script d\'insertion utilisateur...');
(async () => {
  try {
    console.log('[DEBUG] Hachage du mot de passe...');
    const hash = await bcrypt.hash('demo123', 10);
    console.log('[DEBUG] Mot de passe haché:', hash);
    console.log('[DEBUG] Création de l\'utilisateur dans la base de données...');
    const user = await prisma.user.create({
      data: {
        email: 'test@demo.fr',
        password: hash,
        name: 'Test User'
      }
    });
    console.log('[DEBUG] Utilisateur créé avec succès:', user);
  } catch (error) {
    console.error('[DEBUG] Erreur lors de la création de l\'utilisateur:', error);
  } finally {
    console.log('[DEBUG] Fin du script d\'insertion utilisateur.');
    process.exit(0);
  }
})();
