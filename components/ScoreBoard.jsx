'use client';

import React from 'react';

const ScoreBoard = ({ 
  currentScore = 0,
  correctAnswers = 0,
  totalQuestions = 10,
  timeBonus = 0
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Score Board
      </h3>

      {/* 总分 */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
          {currentScore}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          points
        </span>
      </div>

      {/* 统计信息 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">Correct Answers</span>
          <span className="font-medium text-green-600 dark:text-green-400">
            {correctAnswers}/{totalQuestions}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">Accuracy</span>
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">Time Bonus</span>
          <span className="font-medium text-purple-600 dark:text-purple-400">
            +{timeBonus}
          </span>
        </div>
      </div>

      {/* 分隔线 */}
      <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>

      {/* 提示信息 */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Answer quickly for time bonus!
      </p>
    </div>
  );
};

export default ScoreBoard;
