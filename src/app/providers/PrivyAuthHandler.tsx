import { getAccessToken, usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BASE_URL } from "@/config/constants";
import { fetchApi } from "@/utils/api";

// Helper function to handle referrer storage
const handleReferrerStorage = (referrer: string | null) => {
  if (referrer && typeof window !== 'undefined') {
    sessionStorage.setItem('referrer', referrer);
  }
};

export function PrivyAuthHandler() {
  const { user, ready, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const searchParams = useSearchParams();
  const processedWalletRef = useRef<string | null>(null);
  const [referrer, setReferrer] = useState<string | null>(null);

  // Handle referrer on mount and when searchParams change
  useEffect(() => {
    const referrerFromURL = searchParams.get("referrer");
    const storedReferrer = sessionStorage.getItem("referrer");
    
    const finalReferrer = referrerFromURL || storedReferrer;
    if (finalReferrer) {
      setReferrer(finalReferrer);
      handleReferrerStorage(finalReferrer);
    }
  }, [searchParams, referrer]);

  useEffect(() => {
    const handleUserLogin = async () => {
      if (!ready || !user) return;

      try {
        const token = await getAccessToken();
        const referrer = searchParams.get("referrer");

        // Wait for wallets to be properly initialized
        if (!wallets || wallets.length === 0) {
          console.log("Waiting for wallets to initialize...");
          return;
        }

        // Log available wallets for debugging
        // console.log("Available wallets:", wallets.map(w => ({
        //   address: w.address?.toLowerCase(),
        //   type: w.walletClientType
        // })));

        // Get verified wallets from user object
        const verifiedWallets = user.linkedAccounts
          .filter(account => account.type === 'wallet')
          .map(account => account.address.toLowerCase());

        // console.log("Verified wallets:", verifiedWallets);

        // Find a wallet that is both connected and verified
        const selectedWallet = wallets.find(wallet => 
          wallet.address && 
          verifiedWallets.includes(wallet.address.toLowerCase())
        );

        if (!selectedWallet) {
          console.log("No verified wallet found. Available wallets:", 
            wallets.map(w => w.address?.toLowerCase()));
          // console.log("Verified addresses:", verifiedWallets);
          return;
        }

        // Ensure we have a valid address
        if (!selectedWallet.address) {
          console.error("Selected wallet has no address");
          return;
        }

        // Check if we've already processed this wallet
        const walletAddress = selectedWallet.address.toLowerCase();
        if (processedWalletRef.current === walletAddress) {
          console.log("Wallet already processed:", walletAddress);
          return;
        }

        // Log selected wallet for debugging
        // console.log("Selected wallet:", {
        //   address: walletAddress,
        //   type: selectedWallet.walletClientType
        // });

        // Store the processed wallet address
        processedWalletRef.current = walletAddress;

        // Small delay to ensure everything is synchronized
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create or verify account
        await createOrVerifyAccount(walletAddress, token, referrer);

      } catch (error) {
        console.error("Error handling user login:", error);
      }
    };

    handleUserLogin();
  }, [user, ready, wallets]);

  return null;
}

// Updated createOrVerifyAccount function
async function createOrVerifyAccount(
  walletAddress: string,
  token: string | null,
  referrer: string | null
) {
  try {
    // Ensure wallet address is lowercase
    const normalizedAddress = walletAddress.toLowerCase();
    console.log("121..",normalizedAddress);
    
    // console.log("Creating/verifying account for address:", normalizedAddress);

    const response = await fetch(`${BASE_URL}/api/auth/accountcreate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": normalizedAddress,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        address: normalizedAddress,
        isEmailVisible: false,
        createdAt: new Date(),
        referrer: referrer,
      }),
    });

    const responseText = await response.text();
    // console.log("Server response:", response.status, responseText);

    if (response.status === 200) {
      console.log("Account created successfully");
    } else if (response.status === 409) {
      console.log("Account already exists");
    } else {
      throw new Error(`Failed to create/verify account: ${responseText}`);
    }
  } catch (error) {
    console.error("Error creating/verifying account:", error);
    throw error;
  }
}