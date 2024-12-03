import { getAccessToken, usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BASE_URL } from "@/config/constants";

// Helper function to handle referrer storage
const handleReferrerStorage = (referrer: string | null) => {
  if (referrer && typeof window !== "undefined") {
    sessionStorage.setItem("referrer", referrer);
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
          return;
        }

        // Get verified wallets from user object
        const verifiedWallets = user.linkedAccounts
          .filter((account) => account.type === "wallet")
          .map((account) => account.address);

        // Find a wallet that is both connected and verified
        const selectedWallet = wallets.find(
          (wallet) => wallet.address && verifiedWallets.includes(wallet.address)
        );

        if (!selectedWallet) {
          return;
        }

        // Ensure we have a valid address
        if (!selectedWallet.address) {
          console.error("Selected wallet has no address");
          return;
        }

        // Check if we've already processed this wallet
        if (processedWalletRef.current === selectedWallet.address) {
          return;
        }

        // Store the processed wallet address
        processedWalletRef.current = selectedWallet.address;

        // Small delay to ensure everything is synchronized
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Create or verify account
        await createOrVerifyAccount(selectedWallet.address, token, referrer);
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

    const response = await fetch(`${BASE_URL}/api/auth/accountcreate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": walletAddress,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        address: walletAddress,
        isEmailVisible: false,
        createdAt: new Date(),
        referrer: referrer,
      }),
    });

    const responseText = await response.text();
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
