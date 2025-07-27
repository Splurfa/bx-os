import { useState, useEffect } from "react";

interface LiveTimerProps {
  startTime: Date;
}

const LiveTimer = ({ startTime }: LiveTimerProps) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const updateElapsed = () => {
      const now = new Date();
      const diffMs = now.getTime() - startTime.getTime();
      setElapsed(Math.floor(diffMs / 1000)); // elapsed seconds
    };

    updateElapsed(); // Initial update
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const getTimerColor = () => {
    const diffMins = Math.floor(elapsed / 60);
    if (diffMins <= 10) return 'text-green-500';
    if (diffMins <= 15) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <span className={`font-mono text-xs ${getTimerColor()}`}>
      {minutes}:{seconds.toString().padStart(2, '0')}
    </span>
  );
};

export default LiveTimer;