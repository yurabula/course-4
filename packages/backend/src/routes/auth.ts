// packages/backend/src/routes/auth.ts
import { Router, Request, Response } from 'express';
import { auth } from '../config/firebase';

const router = Router();

// Middleware для перевірки токена
export const verifyToken = async (req: Request, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Токен не надано' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    const decodedToken = await auth.verifyIdToken(token);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    console.error('Помилка верифікації токена:', error);
    res.status(401).json({ error: 'Невалідний токен' });
  }
};

// Реєстрація користувача
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, displayName } = req.body;

    // Валідація
    if (!email || !password || !displayName) {
      return res.status(400).json({ 
        error: 'Email, пароль та ім\'я обов\'язкові' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Пароль має бути мінімум 6 символів' 
      });
    }

    // Створення користувача через Firebase Admin
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: false
    });

    // Генерація custom token для автоматичного входу
    const customToken = await auth.createCustomToken(userRecord.uid);

    res.status(201).json({
      message: 'Користувача успішно зареєстровано',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      },
      customToken
    });
  } catch (error: any) {
    console.error('Помилка реєстрації:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ 
        error: 'Користувач з таким email вже існує' 
      });
    }
    
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ 
        error: 'Невалідний email' 
      });
    }

    res.status(500).json({ error: 'Помилка сервера при реєстрації' });
  }
});

// Отримання інформації про поточного користувача
router.get('/me', verifyToken, async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user.uid;
    const userRecord = await auth.getUser(uid);

    res.json({
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified,
        photoURL: userRecord.photoURL,
        createdAt: userRecord.metadata.creationTime
      }
    });
  } catch (error) {
    console.error('Помилка отримання користувача:', error);
    res.status(500).json({ error: 'Помилка отримання даних користувача' });
  }
});

// Оновлення профілю користувача
router.put('/profile', verifyToken, async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user.uid;
    const { displayName, photoURL } = req.body;

    const updateData: any = {};
    if (displayName) updateData.displayName = displayName;
    if (photoURL) updateData.photoURL = photoURL;

    await auth.updateUser(uid, updateData);

    const updatedUser = await auth.getUser(uid);

    res.json({
      message: 'Профіль оновлено',
      user: {
        uid: updatedUser.uid,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        photoURL: updatedUser.photoURL
      }
    });
  } catch (error) {
    console.error('Помилка оновлення профілю:', error);
    res.status(500).json({ error: 'Помилка оновлення профілю' });
  }
});

// Відправка листа для скидання паролю
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email обов\'язковий' });
    }

    // Генерація посилання для скидання паролю
    const link = await auth.generatePasswordResetLink(email);

    // В реальному проекті тут буде відправка email
    console.log(`Password reset link for ${email}: ${link}`);

    res.json({
      message: 'Якщо email існує, лист з інструкціями буде надіслано',
      // В продакшені не повертайте link!
      resetLink: link
    });
  } catch (error: any) {
    console.error('Помилка відновлення паролю:', error);
    
    // З міркувань безпеки завжди повертаємо успіх
    res.json({
      message: 'Якщо email існує, лист з інструкціями буде надіслано'
    });
  }
});

// Видалення користувача
router.delete('/delete-account', verifyToken, async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user.uid;
    await auth.deleteUser(uid);

    res.json({ message: 'Акаунт успішно видалено' });
  } catch (error) {
    console.error('Помилка видалення акаунту:', error);
    res.status(500).json({ error: 'Помилка видалення акаунту' });
  }
});

// Перевірка валідності токена
router.post('/verify-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Токен не надано' });
    }

    const decodedToken = await auth.verifyIdToken(token);

    res.json({
      valid: true,
      uid: decodedToken.uid,
      email: decodedToken.email
    });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Невалідний токен' });
  }
});

export default router;