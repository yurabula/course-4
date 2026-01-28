import { Router, Request, Response } from 'express';
import { db } from '../config/firebase';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    const snapshot = await db.collection('trainingSession').where('userId', '==', userId).get();

    const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    sessions.sort((a: any, b: any) => {
      const getTime = (s: any) => {
        if (s?.createdAt) return Date.parse(String(s.createdAt));
        if (s?.startTime) return Date.parse(String(s.startTime));
        return 0;
      };
      return getTime(b) - getTime(a);
    });

    res.json(sessions);
  } catch (error) {
    console.error('Помилка отримання сесій:', error);
    res.status(500).json({ error: 'Помилка отримання сесій' });
  }
});

export default router;
