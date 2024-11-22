import { useEffect, useState, useCallback, useRef } from 'react';
import { getAccessToken, usePrivy, useWallets } from "@privy-io/react-auth";
import { useAccount } from 'wagmi';
import { debounce } from 'lodash';

export const useWalletAddress = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [addressSource, setAddressSource] = useState<'external' | 'embedded' | null>(null);
  
  // Maintain a ref for the current external connection status
  const externalWalletRef = useRef({
    isConnected: false,
    address: null as string | null
  });
  
  // Privy hooks
  const { ready, authenticated, user } = usePrivy();
  
  // Wagmi hook
  const { address, isConnected, isConnecting } = useAccount();

  // Update external wallet ref
  useEffect(() => {
    externalWalletRef.current = {
      isConnected,
      address: address ?? null
    };
  }, [isConnected, address]);

  // Debounced update function to prevent rapid state changes
  const debouncedUpdate = useCallback(
    debounce(() => {
      if (!ready) {
        setWalletAddress(null);
        setAddressSource(null);
        return;
      }

      // Clear state if nothing is connected
      if (!externalWalletRef.current.isConnected && !authenticated) {
        setWalletAddress(null);
        setAddressSource(null);
        return;
      }

      // External wallet takes precedence
      if (externalWalletRef.current.isConnected && externalWalletRef.current.address) {
        setWalletAddress(externalWalletRef.current.address);
        setAddressSource('external');
        return;
      }

      // Fall back to embedded wallet only if no external wallet is connected
      if (authenticated && user?.wallet?.address && !externalWalletRef.current.isConnected) {
        setWalletAddress(user.wallet.address);
        setAddressSource('embedded');
        return;
      }
    }, 200),
    [ready, authenticated, user]
  );

  // Handle external wallet changes
  useEffect(() => {
    if (ready) {
      debouncedUpdate();
    }
    
    // Cleanup
    return () => {
      debouncedUpdate.cancel();
    };
  }, [isConnected, address, ready, debouncedUpdate]);

  // Handle embedded wallet changes
  useEffect(() => {
    if (ready) {
      debouncedUpdate();
    }
  }, [authenticated, user, ready, debouncedUpdate]);

  return {
    walletAddress,
    addressSource,
    isLoading: !ready || isConnecting,
    isConnected: Boolean(walletAddress),
    // Additional helper methods
    isExternalWallet: addressSource === 'external',
    isEmbeddedWallet: addressSource === 'embedded'
  };
};

// Usage example:
// const Example = () => {
//   const { 
//     walletAddress, 
//     addressSource,
//     isLoading,
//     isConnected,
//     isExternalWallet,
//     isEmbeddedWallet
//   } = useWalletAddress();

//   if (isLoading) return <div>Loading...</div>;

//   return (
//     <div>
//       {isConnected && (
//         <div>
//           <div>Address: {walletAddress}</div>
//           <div>
//             Connected with: {isExternalWallet ? 'External Wallet' : 'Embedded Wallet'}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };