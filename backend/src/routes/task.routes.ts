import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';

const router = Router();

// CRUD basique pour les tâches
router.get('/', TaskController.getAll);
router.post('/', TaskController.create);
router.get('/:id', TaskController.getOne);
router.put('/:id', TaskController.update);
router.delete('/:id', TaskController.delete);

export default router;
