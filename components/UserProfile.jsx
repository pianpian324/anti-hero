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
        <div className="absolute top-4 right-4 flex items-center gap-4">
            <div className="flex items-center gap-2 bg-foreground/10 rounded-full px-4 py-2">
                <img src={wallet.icon} alt="Wallet Icon" className="w-6 h-6 rounded-full" />
                <div className="text-sm">
                    <div className="font-semibold">{balance} CKB</div>
                    <div className="text-xs opacity-80">{truncateAddress(address)}</div>
                </div>
            </div>
            <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-full border-2 border-white/80 hover:bg-white/10 transition-colors"
            >
                Logout
            </button>
        </div>
    );
};

export default UserProfile;
