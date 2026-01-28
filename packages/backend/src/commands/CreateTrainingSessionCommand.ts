import { Command } from './Command';
import { IFirebaseFacade } from '../services/facade';

export class CreateTrainingSessionCommand implements Command {
  private facade: IFirebaseFacade;
  private payload: any;

  constructor(facade: IFirebaseFacade, payload: any) {
    this.facade = facade;
    this.payload = payload;
  }

  async execute() {
    return this.facade.createTrainingSession(this.payload);
  }
}
