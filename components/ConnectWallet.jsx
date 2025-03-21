/* eslint-disable */
"use client";

import React, { useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { truncateAddress } from "../utils/stringUtils";
import { useRouter } from 'next/navigation';

const ConnectWallet = () => {
    const router = useRouter();
    const { open, wallet } = ccc.useCcc();
    const [balance, setBalance] = useState("");
    const [address, setAddress] = useState("");
    const signer = ccc.useSigner();

    useEffect(() => {
        if (!signer) {
            return;
        }
      
        (async () => {
            const addr = await signer.getRecommendedAddress();
            setAddress(addr);
        })();

        (async () => {
            const capacity = await signer.getBalance();
            setBalance(ccc.fixedPointToString(capacity));
        })();

        // 当钱包连接成功后跳转到dashboard页面
        if (wallet) {
            router.push('/dashboard');
        }

        return () => {};
    }, [signer, router, wallet]);

    const renderConnectWalletBtn = () => {
        return (
            <div className="flex justify-center w-full">
                <button 
                    className="cursor-pointer rounded-full border-2 border-solid border-white/80 transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base font-bold h-10 sm:h-12 px-8 sm:px-10"
                    onClick={open}
                >
                    Connect Wallet
                </button>
            </div>
        );
    }

    const renderConnectedWalletInfo = () => {
        return (
            <div className="flex justify-center w-full">
                <button 
                    className="cursor-pointer rounded-full border-2 border-solid border-white/80 transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8"
                    onClick={open}
                >
                    <div className="rounded-full mr-2">
                        {wallet && <img src={wallet.icon} alt="avatar" className="w-6 h-6" />}
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold">
                            {balance} CKB
                        </h2>
                        <p className="text-xs flex items-center gap-2">
                            {truncateAddress(address, 10, 6)}
                        </p>
                    </div>
                </button>
            </div>
        );
    }

    return (
        <div className="flex justify-center w-full">
            {wallet ? renderConnectedWalletInfo() : renderConnectWalletBtn()}
        </div>
    );
};

export default ConnectWallet;