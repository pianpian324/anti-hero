import { useEffect, useState } from 'react';

export default function Timer({ duration, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  // Calculate progress percentage
  const progress = (timeLeft / duration) * 100;
  
  // Determine color based on time remaining
  const getProgressColor = () => {
    if (progress > 50) return 'var(--success, #22c55e)';
    if (progress > 20) return 'var(--warning, #f59e0b)';
    return 'var(--danger, #ef4444)';
  };

  return (
    <div className="quiz-card">
      <div className="flex justify-between mb-2">
        <span className="font-medium text-gray-700 dark:text-gray-300">Time Remaining</span>
        <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{timeLeft}s</span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-1000 ease-linear rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: getProgressColor()
          }}
        />
      </div>
    </div>
  );
}
