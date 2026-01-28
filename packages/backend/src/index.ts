import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes, { verifyToken } from './routes/auth';
import itemsRoutes from './routes/items';
import trainingsRoutes from './routes/trainings';
import trainingSessionRoutes from './routes/trainingSession';
import sessionsRoutes from './routes/sessions';
import weightsRoutes from './routes/weights';
import rankingsRoutes from './routes/rankings';
import adminRoutes from './routes/admin';
import './observers/sessionObserver';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Backend працює!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/items', verifyToken, itemsRoutes);
app.use('/api/trainings', verifyToken, trainingsRoutes);
app.use('/api/trainingSession', verifyToken, trainingSessionRoutes);
app.use('/api/sessions', verifyToken, sessionsRoutes);
app.use('/api/weights', verifyToken, weightsRoutes);
app.use('/api/rankings', verifyToken, rankingsRoutes);
app.use('/api/admin', verifyToken, adminRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
});