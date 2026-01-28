import { Router, Request, Response } from 'express';
import { db } from '../config/firebase';

const router = Router();

router.get('/month', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();

    const snapshot = await db.collection('trainingSession')
      .where('createdAt', '>=', start)
      .where('createdAt', '<=', end)
      .get();

    const counts: Record<string, { userId: string; display: string; count: number }> = {};
    snapshot.docs.forEach(doc => {
      const d: any = doc.data();
      const userId = d.userId || 'unknown';
      const display = d.createdBy || d.userId || 'anonymous';
      if (!counts[userId]) counts[userId] = { userId, display, count: 0 };
      counts[userId].count += 1;
    });

    const arr = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 20);
    res.json(arr);
  } catch (error) {
    console.error('Помилка отримання рейтингу:', error);
    res.status(500).json({ error: 'Помилка отримання рейтингу' });
  }
});

export default router;
