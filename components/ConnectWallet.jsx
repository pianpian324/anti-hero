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
    const [isFirstMount, setIsFirstMount] = useState(true);

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

        // 仅在钱包首次连接时跳转
        if (wallet && isFirstMount) {
            setIsFirstMount(false);
            router.push('/dashboard');
        }

        return () => {};
    }, [signer, router, wallet, isFirstMount]);

    const handleConnect = async () => {
        try {
            await open();
        } catch (error) {
            console.error('Connect failed:', error);
        }
    };

    const renderConnectWalletBtn = () => {
        return (
            <div className="flex justify-center w-full">
                <button 
                    className="cursor-pointer rounded-full border-2 border-solid border-gray-200 transition-colors flex items-center justify-center bg-white text-gray-900 gap-2 hover:bg-gray-100 text-sm sm:text-base font-bold h-10 sm:h-12 px-8 sm:px-10"
                    onClick={handleConnect}
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
                    className="cursor-pointer rounded-full border-2 border-solid border-gray-200 transition-colors flex items-center justify-center bg-white text-gray-900 gap-2 hover:bg-gray-100 text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8"
                    onClick={handleConnect}
                >
                    <div className="rounded-full mr-2">
                        {wallet && <img src={wallet.icon} alt="avatar" className="w-6 h-6" />}
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">
                            {balance} CKB
                        </h2>
                        <p className="text-xs flex items-center gap-2 text-gray-600">
                            {truncateAddress(address)}
                        </p>
                    </div>
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            {!wallet ? renderConnectWalletBtn() : renderConnectedWalletInfo()}
        </div>
    );
};

export default ConnectWallet;