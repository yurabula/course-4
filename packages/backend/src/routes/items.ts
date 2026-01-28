import { Router, Request, Response } from 'express';
import { db } from '../config/firebase';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('items').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (error) {
    console.error('Помилка:', error);
    res.status(500).json({ error: 'Помилка отримання даних' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = (req as any).user.uid;

    const docRef = await db.collection('items').add({
      name,
      description,
      userId,
      createdBy: (req as any).user.email,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ id: docRef.id, message: 'Створено успішно' });
  } catch (error) {
    console.error('Помилка:', error);
    res.status(500).json({ error: 'Помилка створення документа' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.uid;

    const doc = await db.collection('items').doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Документ не знайдено' });

    const data = doc.data();
    if (data?.userId !== userId) {
      return res.status(403).json({ error: 'Ви не маєте прав видаляти цей елемент' });
    }

    await db.collection('items').doc(id).delete();
    res.json({ message: 'Видалено успішно' });
  } catch (error) {
    console.error('Помилка:', error);
    res.status(500).json({ error: 'Помилка видалення' });
  }
});

export default router;
