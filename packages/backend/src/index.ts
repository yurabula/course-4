import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './config/firebase';
import authRoutes, { verifyToken } from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Backend працює!' });
});

app.use('/api/auth', authRoutes);

app.get('/api/items', verifyToken, async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('items').get();
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(items);
  } catch (error) {
    console.error('Помилка:', error);
    res.status(500).json({ error: 'Помилка отримання даних' });
  }
});

app.get('/api/trainings', verifyToken, async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('trainings').get();
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(items);
  } catch (error) {
    console.error('Помилка:', error);
    res.status(500).json({ error: 'Помилка отримання даних' });
  }
});

app.post('/api/items', verifyToken, async (req: Request, res: Response) => {
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
    
    res.status(201).json({ 
      id: docRef.id, 
      message: 'Створено успішно' 
    });
  } catch (error) {
    console.error('Помилка:', error);
    res.status(500).json({ error: 'Помилка створення документа' });
  }
});

app.post('/api/trainings', verifyToken, async (req: Request, res: Response) => {
  try {
    const { name, img } = req.body;
    const userId = (req as any).user.uid;
    
    const docRef = await db.collection('trainings').add({
      name,
      img,
      userId,
      createdBy: (req as any).user.email,
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json({ 
      id: docRef.id, 
      message: 'Створено успішно' 
    });
  } catch (error) {
    console.error('Помилка:', error);
    res.status(500).json({ error: 'Помилка створення документа' });
  }
});

app.post('/api/trainingSession', verifyToken, async (req: Request, res: Response) => {
  try {
    const { name, img, startTime, endTime, trainingId } = req.body;
    const userId = (req as any).user.uid;
    
    const docRef = await db.collection('trainingSession').add({
      startTime,
      endTime,
      trainingId,
      userId,
      createdBy: (req as any).user.email,
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json({ 
      id: docRef.id, 
      message: 'Створено успішно' 
    });
  } catch (error) {
    console.error('Помилка:', error);
    res.status(500).json({ error: 'Помилка створення документа' });
  }
});

app.delete('/api/items/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.uid;
    
    const doc = await db.collection('items').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Документ не знайдено' });
    }
    
    const data = doc.data();
    if (data?.userId !== userId) {
      return res.status(403).json({ 
        error: 'Ви не маєте прав видаляти цей елемент' 
      });
    }
    
    await db.collection('items').doc(id).delete();
    res.json({ message: 'Видалено успішно' });
  } catch (error) {
    console.error('Помилка:', error);
    res.status(500).json({ error: 'Помилка видалення' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
});