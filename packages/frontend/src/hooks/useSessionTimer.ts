import { useEffect, useState } from 'react';

export default function useSessionTimer(startIso?: string | null) {
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  useEffect(() => {
    if (!startIso) {
      setElapsedMs(0);
      return;
    }

    const start = new Date(startIso).getTime();
    const update = () => setElapsedMs(Math.max(0, Date.now() - start));

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startIso]);

  const minutes = Math.floor(elapsedMs / 60000);
  const seconds = Math.floor((elapsedMs % 60000) / 1000);
  const label = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { elapsedMs, minutes, seconds, label };
}
