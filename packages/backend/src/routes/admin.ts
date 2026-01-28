import { Router, Request, Response } from 'express';
import { db } from '../config/firebase';

const router = Router();

router.get('/popular-trainings', async (req: Request, res: Response) => {
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

    const counts: Record<string, { trainingId: string; name: string; count: number }> = {};
    snapshot.docs.forEach(doc => {
      const d: any = doc.data();
      const tid = d.trainingId || d.name || 'unknown';
      const name = d.name || 'Unknown';
      if (!counts[tid]) counts[tid] = { trainingId: tid, name, count: 0 };
      counts[tid].count += 1;
    });

    const arr = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 20);
    res.json(arr);
  } catch (error) {
    console.error('Помилка отримання популярних тренувань:', error);
    res.status(500).json({ error: 'Помилка отримання даних' });
  }
});

// GET /api/admin/users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('trainingSession').get();
    const map: Record<string, { userId: string; display: string }> = {};
    snapshot.docs.forEach(doc => {
      const d: any = doc.data();
      const uid = d.userId || 'unknown';
      const display = d.createdBy || uid;
      if (!map[uid]) map[uid] = { userId: uid, display };
    });
    res.json(Object.values(map));
  } catch (error) {
    console.error('Помилка отримання користувачів:', error);
    res.status(500).json({ error: 'Помилка отримання даних' });
  }
});

router.get('/user-progress', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();

    const sessionsAllSnap = await db.collection('trainingSession').where('userId', '==', userId).get();
    const weightsSnap = await db.collection('weights').where('userId', '==', userId).get();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const sessionsCounts = new Array<number>(daysInMonth).fill(0);
    sessionsAllSnap.docs.forEach(doc => {
      const d: any = doc.data();
      const dateStr = d.startTime || d.createdAt;
      if (!dateStr) return;
      const dt = new Date(dateStr);
      if (dt.getFullYear() === year && dt.getMonth() === month) {
        sessionsCounts[dt.getDate() - 1] += 1;
      }
    });

    const weightMap: Record<number, number> = {};
    const weightTimes: Record<number, number> = {};
    weightsSnap.docs.forEach(doc => {
      const d: any = doc.data();
      const dateStr = d.date || d.createdAt;
      if (!dateStr) return;
      const dt = new Date(dateStr);
      if (dt.getFullYear() === year && dt.getMonth() === month) {
        const day = dt.getDate();
        const t = dt.getTime();
        if (!weightTimes[day] || t > weightTimes[day]) {
          weightMap[day] = Number(d.weight);
          weightTimes[day] = t;
        }
      }
    });

    const weightsPerDay = new Array<number | null>(daysInMonth).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const v = weightMap[d];
      weightsPerDay[d - 1] = typeof v === 'number' ? v : null;
    }

    res.json({ days: daysInMonth, sessionsCounts, weightsPerDay });
  } catch (error) {
    console.error('Помилка отримання прогресу користувача:', error);
    res.status(500).json({ error: 'Помилка' });
  }
});

router.get('/average-activity', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();

    const snap = await db.collection('trainingSession').where('createdAt', '>=', start).where('createdAt', '<=', end).get();

    const total = snap.size;
    const users = new Set<string>();
    const perDay: Record<string, number> = {};
    snap.docs.forEach(doc => {
      const d: any = doc.data();
      const uid = d.userId || 'unknown';
      users.add(uid);
      const dateStr = d.startTime || d.createdAt;
      const dayKey = dateStr ? dateStr.slice(0,10) : 'unknown';
      perDay[dayKey] = (perDay[dayKey] || 0) + 1;
    });

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const avgPerUser = users.size ? total / users.size : 0;
    const avgPerDay = daysInMonth ? total / daysInMonth : 0;

    res.json({ total, uniqueUsers: users.size, avgPerUser, avgPerDay, perDay });
  } catch (error) {
    console.error('Помилка отримання середньої активності:', error);
    res.status(500).json({ error: 'Помилка' });
  }
});

export default router;
