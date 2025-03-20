/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useMemo } from "react";
import { ccc } from "@ckb-ccc/connector-react";

export function LayoutProvider({ children }) {
    
    const defaultClient = useMemo(() => {
        return process.env.REACT_APP_IS_MAINNET === "true"
            ? new ccc.ClientPublicMainnet()
            : new ccc.ClientPublicTestnet();
    }, []);

    return (
        <ccc.Provider
            connectorProps={{
                style: {
                    "--background": "#232323 !important",
                    "--divider": "rgba(255, 255, 255, 0.1) !important",
                    "--btn-primary": "#2D2F2F !important",
                    "--btn-primary-hover": "#515151 !important",
                    "--btn-secondary": "#2D2F2F !important",
                    "--btn-secondary-hover": "#515151 !important",
                    "--icon-primary": "#FFFFFF !important",
                    "--icon-secondary": "rgba(255, 255, 255, 0.6) !important",
                    color: "#ffffff !important",
                    "--tip-color": "#666 !important",
                },
            }}
            defaultClient={defaultClient}
            clientOptions={[
                {
                    name: "CKB Testnet",
                    client: new ccc.ClientPublicTestnet(),
                },
                {
                    name: "CKB Mainnet",
                    client: new ccc.ClientPublicMainnet(),
                },
            ]}
        >
            {children}
        </ccc.Provider>
    );
}