import { Router, Request, Response } from 'express';
import { db } from '../config/firebase';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { weight, date } = req.body;
    const userId = (req as any).user.uid;

    const docRef = await db.collection('weights').add({
      weight: Number(weight),
      date: date || new Date().toISOString(),
      userId,
      createdBy: (req as any).user.email,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ id: docRef.id, message: 'Збережено' });
  } catch (error) {
    console.error('Помилка збереження ваги:', error);
    res.status(500).json({ error: 'Помилка збереження ваги' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    const snapshot = await db.collection('weights').where('userId', '==', userId).get();

    const weights = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    weights.sort((a: any, b: any) => {
      const ta = Date.parse(String(a.date || a.createdAt || 0));
      const tb = Date.parse(String(b.date || b.createdAt || 0));
      return tb - ta;
    });

    res.json(weights);
  } catch (error) {
    console.error('Помилка отримання ваги:', error);
    res.status(500).json({ error: 'Помилка отримання ваги' });
  }
});

export default router;
