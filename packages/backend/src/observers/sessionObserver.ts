import { eventBus, EVENTS } from '../lib/eventBus';

eventBus.on(EVENTS.SESSION_CREATED, (data: any) => {
  try {
    console.log('[Observer] session created:', data?.id, 'user:', data?.userId);
  } catch (e) {
    console.warn('[Observer] error handling session created', e);
  }
});

export default null;
