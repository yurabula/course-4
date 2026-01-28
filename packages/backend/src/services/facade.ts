import { db } from '../config/firebase';

export interface IFirebaseFacade {
  createTrainingSession(payload: any): Promise<any>;
  createTraining(payload: any): Promise<any>;
  createItem(payload: any): Promise<any>;
}

class FirebaseFacade implements IFirebaseFacade {
  async createTrainingSession(payload: any) {
    const docRef = await db.collection('trainingSession').add(payload);
    return { id: docRef.id };
  }

  async createTraining(payload: any) {
    const docRef = await db.collection('trainings').add(payload);
    return { id: docRef.id };
  }

  async createItem(payload: any) {
    const docRef = await db.collection('items').add(payload);
    return { id: docRef.id };
  }
}

export const firebaseFacade = new FirebaseFacade();

export default firebaseFacade;
