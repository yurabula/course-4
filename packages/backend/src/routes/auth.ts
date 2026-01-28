import { Router, Request, Response } from 'express';
import { auth } from '../config/firebase';

const router = Router();

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

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, displayName, gender, age } = req.body;

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

    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: false
    });

    try {
      const { db } = require('../config/firebase');
      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName,
        gender: gender || null,
        age: age ? Number(age) : null,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Не вдалося записати профіль користувача у Firestore:', e);
    }

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

router.get('/me', verifyToken, async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user.uid;
    const userRecord = await auth.getUser(uid);

    let profile: any = {};
    try {
      const { db } = require('../config/firebase');
      const doc = await db.collection('users').doc(uid).get();
      if (doc.exists) profile = doc.data();
    } catch (e) {
      console.warn('Не вдалося прочитати профіль з Firestore:', e);
    }

    res.json({
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified,
        photoURL: userRecord.photoURL,
        createdAt: userRecord.metadata.creationTime,
        gender: profile.gender || null,
        age: profile.age || null
      }
    });
  } catch (error) {
    console.error('Помилка отримання користувача:', error);
    res.status(500).json({ error: 'Помилка отримання даних користувача' });
  }
});

router.put('/profile', verifyToken, async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user.uid;
    const { displayName, photoURL, gender, age } = req.body;

    const updateData: any = {};
    if (displayName) updateData.displayName = displayName;
    if (photoURL) updateData.photoURL = photoURL;

    if (Object.keys(updateData).length > 0) {
      await auth.updateUser(uid, updateData);
    }

    try {
      const { db } = require('../config/firebase');
      const docRef = db.collection('users').doc(uid);
      const toUpdate: any = {};
      if (gender !== undefined) toUpdate.gender = gender;
      if (age !== undefined) toUpdate.age = age !== null ? Number(age) : null;
      if (displayName !== undefined) toUpdate.displayName = displayName;
      if (photoURL !== undefined) toUpdate.photoURL = photoURL;
      if (Object.keys(toUpdate).length > 0) await docRef.set(toUpdate, { merge: true });
    } catch (e) {
      console.warn('Не вдалося оновити профіль у Firestore:', e);
    }

    const updatedUser = await auth.getUser(uid);

    let profile: any = {};
    try {
      const { db } = require('../config/firebase');
      const doc = await db.collection('users').doc(uid).get();
      if (doc.exists) profile = doc.data();
    } catch (e) {
      console.warn('Не вдалося прочитати профіль з Firestore:', e);
    }

    res.json({
      message: 'Профіль оновлено',
      user: {
        uid: updatedUser.uid,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        photoURL: updatedUser.photoURL,
        gender: profile.gender || null,
        age: profile.age || null
      }
    });
  } catch (error) {
    console.error('Помилка оновлення профілю:', error);
    res.status(500).json({ error: 'Помилка оновлення профілю' });
  }
});

router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email обов\'язковий' });
    }

    const link = await auth.generatePasswordResetLink(email);

    console.log(`Password reset link for ${email}: ${link}`);

    res.json({
      message: 'Якщо email існує, лист з інструкціями буде надіслано',
      resetLink: link
    });
  } catch (error: any) {
    console.error('Помилка відновлення паролю:', error);
    
    res.json({
      message: 'Якщо email існує, лист з інструкціями буде надіслано'
    });
  }
});

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