import React, { useState } from "react";
import { ChevronDown, Copy, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import toast, { Toaster } from "react-hot-toast";
import OPLogo from "@/assets/images/daos/op.png";
import ArbLogo from "@/assets/images/daos/arb.png";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";

interface ChainSwitcherHeaderProps {
  address?: string;
  currentChainId?: number;
  switchChain?: (params: { chainId: number }) => void;
  ensAvatar?: string | null;
}

const ChainSwitcherHeader: React.FC<ChainSwitcherHeaderProps> = ({
  address = "",
  currentChainId,
  switchChain,
  ensAvatar,
}) => {
  const [copied, setCopied] = useState(false);
  const { logout } = usePrivy();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const getSlicedAddress = (addr: string): string => {
    if (!addr) return "";
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast("Copied", {
        duration: 1500,
        style: {
          background: "#333",
          color: "#fff",
          borderRadius: "4px",
          fontSize: "12px",
        },
      });
    }
  };

  const { chains } = useSwitchChain();
  const currentChain = chains.find((chain) => chain.id === currentChainId);

  const desiredChains = [
    { id: 10, name: "Optimism", icon: OPLogo },
    { id: 42161, name: "Arbitrum", icon: ArbLogo },
    { id: 421614, name: "Arbitrum Sepolia", icon: ArbLogo },
  ];

  const handleLogout = async () => {
    try {
      if (isConnected) disconnect();
      await logout();
      localStorage.removeItem("persistentWalletAddress");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const userOnWrongNetwork = !desiredChains.some(
    (chain) => chain.id === currentChainId
  );

  // Find the current chain's logo or use the first chain's logo as default
  const currentChainLogo = currentChain
    ? desiredChains.find((chain) => chain.id === currentChain.id)?.icon
    : desiredChains[0].icon;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between bg-gray-100 px-3 py-1 rounded-full shadow-sm space-x-2">
        {/* Address and Avatar */}
        <div className="flex items-center space-x-2">
          {ensAvatar && (
            <img
              alt="ENS Avatar"
              src={ensAvatar}
              className="w-6 h-6 rounded-full"
            />
          )}
          <span className="text-sm text-gray-800 font-medium">
            {getSlicedAddress(address)}
          </span>
          <Copy
            size={14}
            onClick={copyToClipboard}
            className={`cursor-pointer ${
              copied ? "text-green-500" : "text-gray-500 hover:text-gray-700"
            }`}
          />
        </div>

        {/* Chain Switcher */}
        {/* {currentChainLogo && ( */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center bg-white rounded-full px-2 py-1 text-sm font-poppins">
            <Image
              src={currentChainLogo ? currentChainLogo : ""}
              alt="Current Chain"
              width={100}
              height={100}
              className="mr-1 w-5 h-5"
            />
            <ChevronDown size={12} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white rounded-md shadow-lg">
            {desiredChains.map((chain) => (
              <DropdownMenuItem
                key={chain.id}
                disabled={chain.id === currentChainId}
                onClick={() => switchChain?.({ chainId: chain.id })}
                className="flex items-center text-sm px-2 py-1.5 hover:bg-gray-100"
              >
                <Image
                  src={chain.icon}
                  alt={chain.name}
                  width={100}
                  height={100}
                  className="mr-2 w-5 h-5"
                />
                {chain.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* )} */}
        {/* Disconnect Button */}
        {address && (
          <button
            onClick={handleLogout}
            className="p-1 hover:bg-gray-200 rounded-full"
            aria-label="Disconnect wallet"
          >
            <LogOut size={14} className="text-red-500" />
          </button>
        )}

        {/* Wrong Network Indicator */}
        {userOnWrongNetwork && (
          <span className="text-sm text-red-500 ml-1">Wrong</span>
        )}

        <Toaster />
      </div>
    </div>
  );
};

ChainSwitcherHeader.displayName = "ChainSwitcherHeader";

export default ChainSwitcherHeader;
