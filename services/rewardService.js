'use client';

// 模拟奖励发放的延迟
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export class RewardService {
  // 铸造二狗 SBT 徽章
  static async mintSBT(address) {
    console.log('Minting SBT... in mintSBT');
    try {
    
      // 调用 API
      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'sbt',
          address,
        }),
      });
      console.log('create spore Response:', response);

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to mint SBT');
      }

      return {
        success: true,
        txHash: data.txHash,
        sporeId: data.sporeId,
        type: 'SBT'
      };
    } catch (error) {
      console.error('Failed to mint SBT:', error);
      return {
        success: false,
        error: error.message,
        type: 'SBT'
      };
    }
  }

  // 发送 CKB 代币
  static async sendCKB(address, amount) {
    try {
      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ckb',
          address,
          amount
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to send CKB');
      }

      return {
        success: true,
        txHash: data.txHash,
        type: 'CKB'
      };
    } catch (error) {
      console.error('Failed to send CKB:', error);
      return {
        success: false,
        error: error.message,
        type: 'CKB'
      };
    }
  }

  // 铸造二狗 NFT
  static async mintNFT(address) {
    try {
      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'nft',
          address
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to mint NFT');
      }

      return {
        success: true,
        txHash: data.txHash,
        type: 'NFT'
      };
    } catch (error) {
      console.error('Failed to mint NFT:', error);
      return {
        success: false,
        error: error.message,
        type: 'NFT'
      };
    }
  }

  // 检查奖励是否已领取
  static async checkRewardsClaimed(address) {
    try {
      // TODO: 实现奖励领取状态检查
      // 这里应该调用后端 API 来检查用户的奖励领取状态
      await delay(500);
      return {
        sbt: false,
        ckb: false,
        nft: false
      };
    } catch (error) {
      console.error('Failed to check rewards status:', error);
      return {
        sbt: false,
        ckb: false,
        nft: false
      };
    }
  }
}
