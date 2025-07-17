import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../.env' });
import { prisma } from '../src/services/prisma';

(async () => {
  // Récupérer l'utilisateur de test
  const user = await prisma.user.findUnique({ where: { email: 'test@demo.fr' } });
  if (!user) {
    console.error('Utilisateur test@demo.fr introuvable');
    process.exit(1);
  }

  // Création de tâches de test
  await prisma.task.createMany({
    data: [
      { title: 'Tâche 1', completed: false, userId: user.id },
      { title: 'Tâche 2', completed: true, userId: user.id },
      { title: 'Tâche 3', completed: false, userId: user.id }
    ]
  });
  console.log('Tâches de test créées');
  process.exit(0);
})();
