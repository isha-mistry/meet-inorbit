import React, { useState } from 'react';
import Image from 'next/image';
import { Copy, ChevronDown, LogOut } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAccount, useDisconnect } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import toast from 'react-hot-toast';
import OPLogo from "@/assets/images/daos/op.png";
import ArbLogo from "@/assets/images/daos/arb.png";

interface MobileChainSwitcherProps {
  login: () => void;
  getDisplayImage: () => string;
  address?: string;
  currentChainId?: number;
  switchChain?: (params: { chainId: number }) => void;
  ensAvatar?: string | null;
  authenticated?: boolean;
}

const MobileChainSwitcher: React.FC<MobileChainSwitcherProps> = ({
  login,
  getDisplayImage,
  address = '',
  currentChainId,
  switchChain,
  ensAvatar,
  authenticated = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { logout } = usePrivy();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const getSlicedAddress = (addr: string): string => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  };

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast('Address copied');
    }
  };

  const handleLogout = async () => {
    try {
      if (isConnected) disconnect();
      await logout();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const desiredChains = [
    { id: 10, name: 'Optimism', icon: OPLogo },
    { id: 42161, name: 'Arbitrum', icon: ArbLogo },
    { id: 421614, name: 'Arbitrum Sepolia', icon: ArbLogo },
  ];

  const currentChain = desiredChains.find(chain => chain.id === currentChainId);
  const userOnWrongNetwork = !desiredChains.some(chain => chain.id === currentChainId);

  return (
    <>
      <div className="sm:hidden flex items-center">
        <button
          onClick={() => (authenticated ? setIsModalOpen(true) : login())}
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-black font-bold text-black shadow-md hover:shadow-lg transform transition duration-200 ease-in-out"
        >
          <Image src={getDisplayImage()} alt="User Avatar" width={32} height={32} className="rounded-full" />
        </button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-gray-50 p-6 rounded-xl shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex flex-col items-center">
              <Image src={ensAvatar || getDisplayImage()} alt="User Avatar" width={50} height={50} className="rounded-full border-2 border-gray-300" />
              <p className="text-gray-800 font-semibold mt-2">{getSlicedAddress(address)}</p>
              <button
                onClick={copyToClipboard}
                className={`flex items-center mt-1 px-2 py-1 text-sm rounded-md transition ${
                  copied ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                aria-label="Copy address"
              >
                <Copy size={16} className="mr-1" />
                {copied ? 'Copied!' : 'Copy Address'}
              </button>
            </div>

            <div className="w-full flex items-center justify-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center bg-gray-200 rounded-lg px-4 py-2 hover:bg-gray-300">
                  {currentChain ? (
                    <>
                      <span className="font-semibold text-gray-800">{currentChain.name}</span>
                      <ChevronDown size={16} className="ml-1" />
                    </>
                  ) : (
                    <span className="text-red-600">Select Network</span>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white rounded-lg shadow-md">
                  {desiredChains.map(chain => (
                    <DropdownMenuItem
                      key={chain.id}
                      onClick={() => switchChain?.({ chainId: chain.id })}
                      disabled={chain.id === currentChainId}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                    >
                      <Image src={chain.icon} alt={chain.name} className="w-5 h-5" />
                      <span className="text-gray-800">{chain.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
            >
              <LogOut size={20} className="mr-2" />
              Disconnect
            </button>

            {userOnWrongNetwork && (
              <p className="text-sm text-red-500 font-semibold mt-2">
                ⚠️ Wrong Network
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MobileChainSwitcher;
