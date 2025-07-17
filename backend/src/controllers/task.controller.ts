import { Request, Response } from 'express';
import { prisma } from '../services/prisma';

export const TaskController = {
  async getAll(req: Request, res: Response) {
    try {
      const tasks = await prisma.task.findMany();
      res.json({
        data: tasks,
        message: 'Liste des tâches',
        meta: {
          method: req.method,
          path: req.originalUrl,
          status: 200,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur', error });
    }
  },
  async getOne(req: Request, res: Response) {
    try {
      const task = await prisma.task.findUnique({ where: { id: Number(req.params.id) } });
      if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur', error });
    }
  },
  async create(req: Request, res: Response) {
    try {
      const { title, completed, userId } = req.body;
      if (!userId) return res.status(400).json({ message: 'userId obligatoire' });
      const task = await prisma.task.create({ data: { title, completed: !!completed, userId } });
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur', error });
    }
  },
  async update(req: Request, res: Response) {
    try {
      const data: any = {};
      if (typeof req.body.title !== 'undefined') data.title = req.body.title;
      if (typeof req.body.completed !== 'undefined') data.completed = !!req.body.completed;
      if (Object.keys(data).length === 0) {
        return res.status(400).json({ message: 'Aucune donnée à mettre à jour' });
      }
      const task = await prisma.task.update({
        where: { id: Number(req.params.id) },
        data
      });
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur', error });
    }
  },
  async delete(req: Request, res: Response) {
    try {
      await prisma.task.delete({ where: { id: Number(req.params.id) } });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur', error });
    }
  }
};
