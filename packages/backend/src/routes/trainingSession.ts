import { Router, Request, Response } from 'express';
import { firebaseFacade } from '../services/facade';
import { CreateTrainingSessionCommand } from '../commands/CreateTrainingSessionCommand';
import { CommandInvoker } from '../commands/CommandInvoker';
import { eventBus, EVENTS } from '../lib/eventBus';

const router = Router();
const invoker = new CommandInvoker();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, img, startTime, endTime, trainingId, durationMinutes, calories } = req.body;
    const userId = (req as any).user.uid;

    const payload = {
      name: name || null,
      img: img || null,
      startTime,
      endTime,
      trainingId,
      durationMinutes: durationMinutes || null,
      calories: calories || null,
      userId,
      createdBy: (req as any).user.email,
      createdAt: new Date().toISOString()
    };

    const cmd = new CreateTrainingSessionCommand(firebaseFacade, payload);
    const result = await invoker.execute(cmd);

    try { eventBus.emit(EVENTS.SESSION_CREATED, { userId, payload, id: result.id }); } catch (e) { /* ignore */ }

    res.status(201).json({ id: result.id, message: 'Створено успішно' });
  } catch (error) {
    console.error('Помилка:', error);
    res.status(500).json({ error: 'Помилка створення документа' });
  }
});

export default router;
