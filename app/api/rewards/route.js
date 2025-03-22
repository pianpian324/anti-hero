import { NextResponse } from 'next/server';
import { ClientPublicTestnet, SignerCkbPrivateKey } from "@ckb-ccc/core";
import { ccc } from "@ckb-ccc/ccc"

// 初始化管理员签名者
const adminSigner = new SignerCkbPrivateKey(new ClientPublicTestnet(), "1b8a04ba702521e92eb9f85dd2e6895cb062e6470626a26b527503ba958a0f0f");
const clusterId = "0x161e1f81d6c22f88aa302a87df564eab9a0966270fea4cc3e01692a73fbff1f7";

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, address } = body;
    console.log('Processing reward request:', { type, address });

    switch (type) {
      case 'sbt':
        // 创建 spore
        const { tx: sporeTx, id: sporeId } = await ccc.spore.createSpore({
          signer: adminSigner,
          data: {
            contentType: 'application/json',
            content: ccc.bytesFrom('{"name":"Nan Tang","resource":{"url":"https://github.com/pianpian324/anti-hero/blob/xingtian/data/wellplayed.png?raw=true","type":"image/png"}}', "utf8"),
            clusterId: clusterId,
          },
          clusterMode: "clusterCell",
        });

        // 完成交易
        await sporeTx.completeFeeBy(adminSigner, 2000n);
        const sporeTxHash = await adminSigner.sendTransaction(sporeTx);
        console.log('Spore created:', { sporeId, sporeTxHash });

        console.log("address: ", address);
        const { script: to } = await ccc.Address.fromString(address, adminSigner.client);
        console.log("to: ", to);
        // 转移 spore
        const { tx: transferSporeTx } = await ccc.spore.transferSpore({
          signer: adminSigner,
          id:sporeId,
          to,
        });

        await transferSporeTx.completeFeeBy(adminSigner);
        
        const transferSporeTxHash = await adminSigner.sendTransaction(transferSporeTx);
        console.log('Spore transferred:', { sporeId, transferSporeTxHash });

        return NextResponse.json({ 
          success: true, 
          txHash: transferSporeTxHash,
          sporeId: sporeId
        });
        break;

      // case 'ckb':   
      //   // CKB 转账
      //   const ckbTx = await ccc.ckb.transfer({
      //     signer: adminSigner,
      //     to: address,
      //     amount: 100n * 10n ** 8n, // 100 CKB
      //   });
        
      //   const ckbTxHash = await adminSigner.sendTransaction(ckbTx);

      //   return NextResponse.json({ 
      //     success: true, 
      //     txHash: ckbTxHash
      //   });

      // case 'nft':
      //   // NFT 使用 Spore 协议
      //   const { tx: nftTx, id: nftId } = await ccc.spore.createSpore({
      //     signer: adminSigner,
      //     data: {
      //       contentType: 'application/json',
      //       content: ccc.bytesFrom('{"name":"Anti-Hero NFT","description":"Exclusive NFT for high achievers","resource":{"url":"https://github.com/pianpian324/anti-hero/blob/xingtian/data/nft.png?raw=true","type":"image/png"}}', "utf8"),
      //       clusterId: clusterId,
      //     },
      //     clusterMode: "clusterCell",
      //   });

      //   await nftTx.completeFeeBy(adminSigner, 2000n);
      //   const nftTxHash = await adminSigner.sendTransaction(nftTx);

      //   // 转移 NFT
      //   const transferNftTx = await ccc.spore.transfer({
      //     signer: adminSigner,
      //     sporeId: nftId,
      //     to: address,
      //   });
        
      //   const transferNftTxHash = await adminSigner.sendTransaction(transferNftTx);

      //   return NextResponse.json({ 
      //     success: true, 
      //     txHash: transferNftTxHash,
      //     nftId: nftId
      //   });

      // default:
      //   return NextResponse.json({ 
      //     success: false, 
      //     error: 'Invalid reward type' 
      //   }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing reward:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
