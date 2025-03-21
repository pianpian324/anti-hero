'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';

const QuizTimer = ({ duration = 10, onTimeout, isActive = true }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const timerRef = useRef(null);
  const hasTimedOut = useRef(false);

  // 计算进度百分比
  const progress = (timeLeft / duration) * 100;

  // 获取颜色
  const getColor = useCallback(() => {
    if (progress > 60) return 'from-green-500 to-green-600';
    if (progress > 30) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  }, [progress]);

  // 清理计时器
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // 重置计时器
  useEffect(() => {
    hasTimedOut.current = false;
    setTimeLeft(duration);
  }, [duration]);

  // 处理活动状态变化
  useEffect(() => {
    clearTimer();
    hasTimedOut.current = false;

    if (isActive) {
      setTimeLeft(duration);
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1 && !hasTimedOut.current) {
            clearTimer();
            hasTimedOut.current = true;
            onTimeout?.();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return clearTimer;
  }, [isActive, duration, onTimeout]);

  // 如果计时器不活跃，显示满进度条
  const displayProgress = isActive ? progress : 100;
  const displayColor = isActive ? getColor() : 'from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700';

  return (
    <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`absolute top-0 left-0 h-full bg-gradient-to-r ${displayColor} transition-all duration-1000 ease-linear`}
        style={{ width: `${displayProgress}%` }}
      />
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 text-sm font-medium text-gray-700 dark:text-gray-300">
        {isActive ? `${timeLeft}s` : 'Done'}
      </div>
    </div>
  );
};

export default QuizTimer;
