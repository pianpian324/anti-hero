'use client';

import React, { useState, useCallback } from 'react';
import { RewardService } from '@/services/rewardService';
import { ccc } from '@ckb-ccc/connector-react';

const PrizePool = ({
  currentScore = 0,
  totalPrizePool = 100,
  minScoreRequired = 100,
  userAddress
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const signer = ccc.useSigner();
  const [claimedRewards, setClaimedRewards] = useState({
    sbt: false,
    ckb: false,
    nft: false
  });

  // 初始化已领取状态
  React.useEffect(() => {
    const initClaimedStatus = async () => {
      if (userAddress) {
        const status = await RewardService.checkRewardsClaimed(userAddress);
        setClaimedRewards(status);
      }
    };
    initClaimedStatus();
  }, [userAddress]);

  // 处理奖励领取
  const handleClaimRewards = useCallback(async () => {
    if (!userAddress || isLoading) return;
    console.log('Claiming rewards...');
    setIsLoading(true);
    try {
      // 根据分数发放不同奖励
      if (currentScore >= 100 && !claimedRewards.sbt) {
        console.log('Claiming SBT...');
        const sbtResult = await RewardService.mintSBT(userAddress);
        if (sbtResult.success) {
          setClaimedRewards(prev => ({ ...prev, sbt: true }));
        }
      }

      if (currentScore >= 120 && !claimedRewards.ckb) {
        const ckbResult = await RewardService.sendCKB(userAddress, 100);
        if (ckbResult.success) {
          setClaimedRewards(prev => ({ ...prev, ckb: true }));
        }
      }

      if (currentScore >= 150 && !claimedRewards.nft) {
        const nftResult = await RewardService.mintNFT(userAddress);
        if (nftResult.success) {
          setClaimedRewards(prev => ({ ...prev, nft: true }));
        }
      }
    } catch (error) {
      console.error('Failed to claim rewards:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, currentScore, claimedRewards, isLoading]);

  // 计算进度百分比
  const progressPercentage = Math.min(100, (currentScore / 150) * 100);
  
  // 判断是否达到领取条件
  const isEligible = currentScore >= minScoreRequired;

  // 获取奖励状态图标
  const getRewardIcon = (type, threshold) => {
    if (claimedRewards[type]) {
      return '✅';
    }
    return currentScore >= threshold ? '🎁' : '🔒';
  };

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
              二狗 SBT 徽章 {getRewardIcon('sbt', 100)}
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
              100 CKB 代币 {getRewardIcon('ckb', 120)}
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
              二狗 NFT {getRewardIcon('nft', 150)}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              (150分)
            </span>
          </div>
        </div>
      </div>
      {/* <button onClick={() => RewardService.mintSBT(userAddress)}>mint test dob</button> */}
      {/* 领取按钮 */}
      <button
        onClick={handleClaimRewards}
        disabled={!isEligible || isLoading || !userAddress}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-all
          ${isEligible && !isLoading
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Claiming...
          </span>
        ) : isEligible ? (
          'Claim Rewards'
        ) : (
          `${minScoreRequired - currentScore} more points needed`
        )}
      </button>

      {/* 说明文本 */}
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        {!userAddress ? (
          'Please connect your wallet to claim rewards'
        ) : (
          'Complete the quiz with high scores to earn exclusive rewards!'
        )}
      </p>
    </div>
  );
};

export default PrizePool;
