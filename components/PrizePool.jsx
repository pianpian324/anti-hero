'use client';

import React from 'react';

const PrizePool = ({
  currentScore = 0,
  totalPrizePool = 100,
  minScoreRequired = 100
}) => {
  // 计算进度百分比
  const progressPercentage = Math.min(100, (currentScore / 150) * 100);
  
  // 判断是否达到领取条件
  const isEligible = currentScore >= minScoreRequired;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Prize Pool
      </h3>

      {/* 奖池金额 */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          {totalPrizePool}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          CKB
        </span>
      </div>

      {/* 进度条 */}
      <div className="mb-4">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{currentScore} pts</span>
          <span>150 pts max</span>
        </div>
      </div>

      {/* 奖励列表 */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${currentScore >= 100 ? 'bg-green-500' : 'bg-gray-400'}`} />
          <div className="flex-1">
            <span className="text-gray-700 dark:text-gray-300">
              二狗 SBT 徽章
            </span>
            <span className="ml-2 text-sm text-gray-500">
              (100分)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${currentScore >= 120 ? 'bg-green-500' : 'bg-gray-400'}`} />
          <div className="flex-1">
            <span className="text-gray-700 dark:text-gray-300">
              100 CKB 代币
            </span>
            <span className="ml-2 text-sm text-gray-500">
              (120分)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${currentScore >= 150 ? 'bg-green-500' : 'bg-gray-400'}`} />
          <div className="flex-1">
            <span className="text-gray-700 dark:text-gray-300">
              二狗 NFT
            </span>
            <span className="ml-2 text-sm text-gray-500">
              (150分)
            </span>
          </div>
        </div>
      </div>

      {/* 领取按钮 */}
      <button
        className={`w-full py-2 px-4 rounded-lg font-medium transition-all
          ${isEligible 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        disabled={!isEligible}
      >
        {isEligible ? 'Claim Rewards' : `${minScoreRequired - currentScore} more points needed`}
      </button>

      {/* 说明文本 */}
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Complete the quiz with high scores to earn exclusive rewards!
      </p>
    </div>
  );
};

export default PrizePool;
