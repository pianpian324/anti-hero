'use client';

import React, { useEffect, useState, useCallback } from 'react';

const QuizTimer = ({ duration = 10, onTimeout, isActive = true }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  // 计算进度百分比
  const progress = (timeLeft / duration) * 100;

  // 获取颜色
  const getColor = useCallback(() => {
    if (progress > 60) return 'from-green-500 to-green-600';
    if (progress > 30) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  }, [progress]);

  // 重置计时器
  useEffect(() => {
    if (isActive) {
      setTimeLeft(duration);
    }
  }, [duration, isActive]);

  // 计时器逻辑
  useEffect(() => {
    let timer;
    
    if (isActive) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            onTimeout?.();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      // 当计时器不活跃时，保持当前时间
      clearInterval(timer);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isActive, onTimeout]);

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
