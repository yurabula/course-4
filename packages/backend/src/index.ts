import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './config/firebase';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// Базовий роут
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Backend працює!' });
});

// Отримання всіх items
app.get('/api/items', async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('items').get();
    const items = snapshot.docs.map((doc: { id: any; data: () => any; }) => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(items);
  } catch (error) {
    console.error('Помилка:', error);
    res.status(500).json({ error: 'Помилка отримання даних' });
  }
});

// Створення нового item
app.post('/api/items', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const docRef = await db.collection('items').add({
      name,
      description,
      createdAt: new Date().toISOString()
    });
    res.status(201).json({ id: docRef.id, message: 'Створено успішно' });
  } catch (error) {
    console.error('Помилка:', error);
    res.status(500).json({ error: 'Помилка створення документа' });
  }
});

// Видалення item
app.delete('/api/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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