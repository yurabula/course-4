import { EventEmitter } from 'events';

export const eventBus = new EventEmitter();

export const EVENTS = {
  SESSION_CREATED: 'session:created'
} as const;

export type Events = typeof EVENTS[keyof typeof EVENTS];
