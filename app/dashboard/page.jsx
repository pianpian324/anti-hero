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
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="quiz-card p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Your Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="stat-item p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Games Played</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
              <div className="stat-item p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Win Rate</p>
                <p className="text-2xl font-bold text-blue-500">0%</p>
              </div>
              <div className="stat-item p-3 bg-gray-50 dark:bg-gray-700 rounded-lg col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Score</p>
                <p className="text-2xl font-bold text-orange-500">0</p>
              </div>
            </div>
          </div>

          <div className="quiz-card p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Game Settings
            </h2>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.push('/knowledge')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <img src="/file.svg" alt="file icon" className="w-5 h-5" />
                  知识库
                </button>
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center h-9 mb-2">
                  <label className="text-2xl font-semibold text-gray-900 dark:text-white">
                    选AI模型
                  </label>
                </div>
                <select className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option>神经二狗LLM</option>
                  <option>通义千问</option>
                  <option>DeepSeek V3</option>
                  <option>DeepSeek R1</option>
                  <option>豆包</option>
                </select>
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center h-9 mb-2">
                  <label className="text-2xl font-semibold text-gray-900 dark:text-white">
                    AI玩家数量
                  </label>
                </div>
                <input
                  type="number"
                  min="0"
                  max="10"
                  defaultValue="1"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
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
