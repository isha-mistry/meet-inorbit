"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PrivyClientConfig } from "@privy-io/react-auth";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { http } from "viem";
import {
  mainnet,
  optimism,
  arbitrum,
  arbitrumSepolia,
  optimismSepolia,
} from "viem/chains";
import logo from "@/assets/images/logo.svg";
import { PrivyAuthHandler } from "./PrivyAuthHandler";
import { SessionProvider } from "next-auth/react";

interface Web3ProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
}

// Wagmi configuration
const wagmiConfig = createConfig({
  chains: [arbitrum, arbitrumSepolia],
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
    [optimismSepolia.id]: http(),
  },
});

// Privy configuration
const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
    requireUserPasswordOnCreate: true,
    noPromptOnSignature: false,
  },
  loginMethods: ["wallet"],
  appearance: {
    showWalletLoginFirst: true,
    logo: logo.src,
  },
  defaultChain: optimism,
};

const queryClient = new QueryClient();

export default function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={privyConfig}
    >
      <QueryClientProvider client={queryClient}>
        <PrivyAuthHandler />
        <SessionProvider>
          <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
            {children}
          </WagmiProvider>
        </SessionProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}