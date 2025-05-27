"use client";

// import "@rainbow-me/rainbowkit/styles.css";
// import { ReactNode, useCallback, useEffect, useState } from "react";

// import {
//   getDefaultConfig,
//   RainbowKitProvider,
//   connectorsForWallets,
// } from "@rainbow-me/rainbowkit";
// import {
//   RainbowKitSiweNextAuthProvider,
//   GetSiweMessageOptions,
// } from "@rainbow-me/rainbowkit-siwe-next-auth";
// import { SessionProvider } from "next-auth/react";
// import {
//   metaMaskWallet,
//   rabbyWallet,
//   rainbowWallet,
//   uniswapWallet,
//   coinbaseWallet,
//   walletConnectWallet,
// } from "@rainbow-me/rainbowkit/wallets";

// import { useTheme } from "next-themes";

// import { createConfig, WagmiProvider } from "wagmi";
// import { optimism, arbitrum, arbitrumSepolia } from "wagmi/chains";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { publicProvider } from "wagmi/providers/public";





import { ReactNode, useCallback, useEffect, useState } from "react";
import { PrivyClientConfig, PrivyProvider, usePrivy, useWallets } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, signIn } from "next-auth/react";
import { http } from 'viem';
import { mainnet, optimism, arbitrum, arbitrumSepolia } from 'viem/chains';
// import { SiweMessage } from 'siwe';
import { getCsrfToken } from "next-auth/react";
import { useWalletClient } from "wagmi";
import { PrivyAuthHandler } from "./PrivyAuthHandler";






// interface RainbowKitProviderProps {
//   children: ReactNode;
//   autoConnect?: boolean;
// }



interface Web3ProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
}


// const optimismSepolia = {
//   id: 11155420,
//   name: "Optimism Sepolia",
//   network: "Optimism Sepolia testnet",
//   nativeCurrency: {
//     decimals: 18,
//     name: "Ethereum",
//     symbol: "ETH",
//   },
//   rpcUrls: {
//     public: {
//       http: [
//         "https://opt-sepolia.g.alchemy.com/v2/BZr3W1fqQEy2wnrcDQf1z4hiGCOhcHfp",
//       ],
//     },
//     default: {
//       http: [
//         "https://opt-sepolia.g.alchemy.com/v2/BZr3W1fqQEy2wnrcDQf1z4hiGCOhcHfp",
//       ],
//     },
//   },
//   testnet: true,
// };

// const { chains, publicClient, webSocketPublicClient } = configureChains(
//   [optimism, arbitrum],
//   [publicProvider()]
// );

// const projectId = "c52f63cb512b7b43a8724eae05cb5130";

// const wagmiConfig = getDefaultConfig({
//   appName: "Arbitrum University",
//   projectId: projectId,
//   chains: [optimism, arbitrum, arbitrumSepolia],
//   ssr: true, // If your dApp uses server side rendering (SSR)
//   wallets: [
//     {
//       groupName: "Popular",
//       wallets: [
//         metaMaskWallet,
//         coinbaseWallet,
//         walletConnectWallet,
//         rainbowWallet,
//       ],
//     },
//     { groupName: "More", wallets: [rabbyWallet, uniswapWallet] },
//   ],
// });

// Wagmi configuration
const wagmiConfig = createConfig({
  chains: [optimism, arbitrum, arbitrumSepolia],
  transports: {
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),

  },
});

// Privy configuration
const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    requireUserPasswordOnCreate: true,
    noPromptOnSignature: false,
  },
  loginMethods: ['wallet', 'google', 'farcaster'],
  appearance: {
    showWalletLoginFirst: true,
    walletList: [
      "metamask",
      "rainbow",
      "wallet_connect",
      "coinbase_wallet",
      "uniswap",
      "rabby_wallet",
      "detected_wallets"
    ],
  },
  defaultChain: optimism,
};



const queryClient = new QueryClient();

export default function Web3Provider({ children }: Web3ProviderProps) {

  // const [referrer, setReferrer] = useState<string | null>(null);
  // const searchParameter = useSearchParams();
  // useEffect(() => {
  //   // const storedReferrer = sessionStorage.getItem("referrer");
  //   const referrerAddress = searchParameter.get("referrer");
  //   setReferrer(referrerAddress);
  // }, [searchParameter]);



  // const getSiweMessageOptions: GetSiweMessageOptions = useCallback(() => {
  //   return {
  //     statement: `Sign in to The App${
  //       referrer ? ` (Referrer: ${referrer})` : ""
  //     }`,
  //   };
  // }, [referrer]);  


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
