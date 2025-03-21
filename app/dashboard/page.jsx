'use client';

import React from 'react';

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto p-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Welcome to Web5 Quiz
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Your decentralized quiz journey begins here!
        </p>
      </div>

      {/* 后续可以添加更多内容 */}
      <div className="w-full">
        {/* 临时占位内容 */}
        <div className="quiz-card p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Getting Started
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to your dashboard! More features coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
