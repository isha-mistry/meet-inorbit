import React, { useState } from "react";
import { Calendar, ChevronDown, Copy, LogOut, Wallet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { daoConfigs } from "@/config/daos";

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
  const { logout, user, authenticated } = usePrivy();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { chains } = useSwitchChain();

  const getCurrentDAO = () => {
    return Object.values(daoConfigs).find(dao => dao.chainId === currentChainId);
  };

  const currentDAO = getCurrentDAO();

  const getSlicedAddress = (addr: string): string => {
    if (!addr) return "";
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast("Copied");
    }
  };

  const handleLogout = async () => {
    try {
      if (isConnected) disconnect();
      await logout();
      localStorage.removeItem("persistentWalletAddress");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const userOnWrongNetwork = !Object.values(daoConfigs).some(
    (dao) => dao.chainId === currentChainId
  );

  return (
    <div className="relative group w-full flex bg-gradient-to-br from-blue-50 to-blue-100 rounded-full hover:scale-105 p-1 transform-none transition-all duration-300 shadow-md hover:shadow-lg">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center text-blue-800 px-3 py-2 rounded-full hover:bg-blue-200 transition-all duration-300 group relative transform-none border-none hover:scale-105">
          <div className="flex items-center">
            <Wallet
              size={16}
              className="mr-2 size-5 text-blue-600 group-hover:rotate-6 transition-transform"
            />
            <span className="text-sm mr-2">{getSlicedAddress(address)}</span>
            {currentDAO && (
              <Image
                src={currentDAO.logo}
                alt={`${currentDAO.name} Logo`}
                width={20}
                height={20}
                className="mr-1 rounded-full"
              />
            )}
            <ChevronDown size={12} className="ml-1" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="animate-slide-down w-[194px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-xl p-4">
          <div className="mb-4 pb-2 border-b border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-1">
              Connected as:
            </h3>
            <div className="flex items-center space-x-2">
              <Wallet size={16} className="text-blue-600" />
              <span className="text-sm text-gray-700">
                {getSlicedAddress(address)}
              </span>
              <Copy
                size={14}
                onClick={copyToClipboard}
                className={`cursor-pointer transition-colors duration-200 ${
                  copied ? "text-green-500" : "text-gray-500 hover:text-blue-700"
                }`}
              />
            </div>
          </div>

          <div className="mb-4 pb-2 border-b border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">
              Switch Network:
            </h3>
            {Object.entries(daoConfigs).map(([key, dao]) => (
              <DropdownMenuItem
                key={dao.chainId}
                disabled={dao.chainId === currentChainId}
                onClick={() => switchChain?.({ chainId: dao.chainId })}
                className={`flex items-center text-sm px-2 py-1.5 rounded-md mb-1 transition-colors duration-200 ${
                  dao.chainId === currentChainId
                    ? "bg-[#acd1fd] text-gray-900 cursor-not-allowed"
                    : "hover:bg-blue-200 text-gray-800 cursor-pointer"
                }`}
              >
                <Image
                  src={dao.logo}
                  alt={`${dao.name} Logo`}
                  width={20}
                  height={20}
                  className="mr-2 rounded-full"
                />
                <span className="flex-1 text-nowrap">{dao.name}</span>
                {dao.chainId === currentChainId && (
                  <span className="text-xs text-green-500 ml-2">•</span>
                )}
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center text-sm px-2 py-1.5 hover:bg-red-100 rounded-md text-red-600 transition-colors duration-200"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChainSwitcherHeader;