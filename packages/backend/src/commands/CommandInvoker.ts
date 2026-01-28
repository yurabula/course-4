import { Command } from './Command';

export class CommandInvoker {
  async execute(command: Command) {
    return command.execute();
  }
}
