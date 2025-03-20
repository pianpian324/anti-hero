"use client"

import { useState } from 'react';

export default function ConnectWallet({ onConnect }) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      // TODO: 实现实际的钱包连接逻辑
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟连接延迟
      onConnect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className={`quiz-button-primary w-full sm:w-auto ${
        isConnecting ? 'opacity-75 cursor-wait' : ''
      }`}
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
