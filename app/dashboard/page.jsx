'use client';

import React from 'react';
import UserProfile from '@/components/UserProfile';
import { ccc } from "@ckb-ccc/connector-react";
import { useRouter } from 'next/navigation';
import { Header, Footer } from '@/components/SharedLayout';

export default function Dashboard() {
  const router = useRouter();
  const { wallet } = ccc.useCcc();
  const signer = ccc.useSigner();
  const [address, setAddress] = React.useState("");

  React.useEffect(() => {
    if (!signer) {
      router.push('/');
      return;
    }

    (async () => {
      const addr = await signer.getRecommendedAddress();
      setAddress(addr);
    })();
  }, [signer, router]);

  // 生成基于地址的随机颜色
  const getRandomColor = (address) => {
    if (!address) return '#000000';
    const hash = address.slice(2, 8);
    return `#${hash}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <Header />
          <div className="absolute top-4 right-4">
            <UserProfile />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto p-8 pt-16">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Welcome to Web5 Quiz
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Your decentralized quiz journey begins here!
          </p>
        </div>

        {/* 玩家头像 */}
        <div className="flex flex-col items-center gap-4 my-8">
          <div 
            className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white overflow-hidden"
            style={{ 
              backgroundColor: getRandomColor(address),
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)'
            }}
          >
            {wallet?.icon ? (
              <img 
                src={wallet.icon} 
                alt="Player Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              address ? address.slice(2, 4).toUpperCase() : '?'
            )}
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            Player {address ? `#${address.slice(2, 6)}` : ''}
          </div>
        </div>

        {/* 游戏信息卡片 */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="quiz-card p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Stats
            </h2>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p>Games Played: 0</p>
              <p>Win Rate: 0%</p>
              <p>Total Score: 0</p>
            </div>
          </div>

          <div className="quiz-card p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Game Settings
            </h2>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p>Difficulty: Normal</p>
              <p>Time Limit: 30s</p>
              <p>Questions: 10</p>
            </div>
          </div>
        </div>

        {/* 开始游戏按钮 */}
        <div className="w-full flex justify-end mt-4">
          <button 
            onClick={() => router.push('/quiz')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold shadow-lg hover:shadow-xl"
          >
            Start New Game
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
