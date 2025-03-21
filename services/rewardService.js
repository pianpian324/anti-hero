'use client';

import { ccc } from "@ckb-ccc/connector-react";

// 模拟奖励发放的延迟
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export class RewardService {
  // 铸造二狗 SBT 徽章
  static async mintSBT(address, signer) {
    /**
 * create cluster
 */
    const { tx: clusterTx, id: clusterId } = await ccc.spore.createSporeCluster({
      signer,
      data: {
        name: "Anti-Hero",
        description: "Make by Rock Web5 Code Campaign team 'William Castle'and'Nerve 2 Dog'.",
      },
    });

    console.log(2)
    await clusterTx.completeFeeBy(signer, 2000n);
    const clusterTxHash = await signer.sendTransaction(clusterTx);
    console.log("Create cluster tx sent:", clusterTxHash, `Cluster ID: ${clusterId}`);
    //await signer.client.waitTransaction(clusterTxHash);
    //console.log("Create cluster tx committed:", getExplorerTxUrl(clusterTxHash), `Cluster ID: ${clusterId}`);

    /**
     * create spore
     */
    // testnet
    //const clusterId = '0x3ae41180f64a22ad6c73058d27f956f8195c17bab3bc03222b5e5683771407c4';
    // mainnet
    //const clusterId = '0xf9e6cba2730adfca0ee0fe1fccbb8edb64a3af0db29157dbcd8516de36375104';
    const { tx: sporeTx, id: sporeId } = await ccc.spore.createSpore({
      signer,
      data: {
        contentType: 'application/json',
        content: ccc.bytesFrom('{"name":"Nan Tang","resource":{"url":"https://github.com/pianpian324/anti-hero/blob/xingtian/data/wellplayed.png?raw=true","type":"image/png"}}', "utf8"),
        clusterId: clusterId,
      },
      clusterMode: "clusterCell",
    });
    await sporeTx.completeFeeBy(signer, 2000n);
    const sporeTxHash = await signer.sendTransaction(sporeTx);
    console.log("Mint DOB tx sent:", sporeTxHash, `Spore ID: ${sporeId}`);
    await signer.client.waitTransaction(sporeTxHash);
    console.log("Mint DOB tx committed:", getExplorerTxUrl(sporeTxHash), `Spore ID: ${sporeId}`);

    // TODO: 实现 SBT 铸造逻辑
    console.log('Minting SBT for address:', address);
    return {
      success: true,
      txHash: '0x...',
      type: 'SBT'
    };
  }

  // 发送 CKB 代币
  static async sendCKB(address, amount) {
    await delay(1000);
    // TODO: 实现 CKB 转账逻辑
    console.log('Sending CKB to address:', address, 'amount:', amount);
    return {
      success: true,
      txHash: '0x...',
      type: 'CKB'
    };
  }

  // 铸造二狗 NFT
  static async mintNFT(address) {
    await delay(1000);
    // TODO: 实现 NFT 铸造逻辑
    console.log('Minting NFT for address:', address);
    return {
      success: true,
      txHash: '0x...',
      type: 'NFT'
    };
  }

  // 检查奖励是否已领取
  static async checkRewardsClaimed(address) {
    await delay(500);
    // TODO: 实现奖励领取状态检查
    return {
      sbt: false,
      ckb: false,
      nft: false
    };
  }
}
