'use client';

import React from 'react';
import { ccc } from "@ckb-ccc/connector-react";
import { truncateAddress } from "../utils/stringUtils";
import { useRouter } from 'next/navigation';

const UserProfile = () => {
    const router = useRouter();
    const { wallet, disconnect } = ccc.useCcc();
    const signer = ccc.useSigner();
    const [balance, setBalance] = React.useState("");
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

        (async () => {
            const capacity = await signer.getBalance();
            setBalance(ccc.fixedPointToString(capacity));
        })();
    }, [signer, router]);

    const handleLogout = async () => {
        try {
            // 断开钱包连接
            await disconnect();
            // 清除状态
            setBalance("");
            setAddress("");
            // 重定向到首页
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!wallet) {
        return null;
    }

    return (
        <div className="flex items-center gap-3 h-9">
            <div className="flex items-center gap-2 rounded-lg px-2 py-1">
                <img src={wallet.icon} alt="Wallet Icon" className="w-6 h-6 rounded-full" />
                <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                        {balance} CKB
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {truncateAddress(address)}
                    </div>
                </div>
            </div>
            <button
                onClick={handleLogout}
                className="text-sm h-9 px-3 rounded-lg"
            >
                Logout
            </button>
        </div>
    );
};

export default UserProfile;
