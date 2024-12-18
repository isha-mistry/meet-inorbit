import Image from "next/image";
import { usePeerIds, useRemotePeer } from "@huddle01/react/hooks";
import { Role } from "@huddle01/server-sdk/auth";
import { useStudioState } from "@/store/studioState";
import { X, CheckCircle, XCircle } from "lucide-react";

type AcceptRequestProps = {
  peerId: string;
  onClose?: () => void;
};

const AcceptRequest: React.FC<AcceptRequestProps> = ({ peerId, onClose }) => {
  const { metadata, updateRole } = useRemotePeer<{
    displayName: string;
    avatarUrl: string;
    isHandRaised: boolean;
  }>({ peerId });

  const { setShowAcceptRequest, removeRequestedPeers } = useStudioState();

  const handleAccept = () => {
    updateRole(Role.SPEAKER, {
      custom: {
        admin: true,
        canConsume: true,
        canProduce: true,
        canProduceSources: {
          cam: true,
          mic: true,
          screen: true,
        },
        canRecvData: true,
        canSendData: true,
        canUpdateMetadata: true,
      },
    });
    setShowAcceptRequest(false);
    removeRequestedPeers(peerId);
    onClose?.();
  };

  const handleDeny = () => {
    setShowAcceptRequest(false);
    removeRequestedPeers(peerId);
    onClose?.();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-end p-6 pointer-events-none">
      <div className="w-full max-w-xs bg-gray-900 rounded-2xl shadow-2xl border border-gray-700/50 animate-slide-up pointer-events-auto">
        <div className="flex flex-col items-center p-5 space-y-4">
          <div className="relative w-20 h-20 mb-2">
            <Image
              src={metadata?.avatarUrl ?? "/default-avatar.png"}
              alt={metadata?.displayName ?? "User"}
              fill
              className="object-cover rounded-full border-4 border-gray-700"
              priority
            />
            {metadata?.isHandRaised && (
              <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black rounded-full p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M11 5h2v14h-2z" />
                  <path d="M18 8h2v8h-2z" />
                  <path d="M4 8h2v8H4z" />
                </svg>
              </div>
            )}
          </div>

          <div className="text-center">
            <h2 className="text-lg font-bold text-white mb-1">
              {metadata?.displayName}
            </h2>
            <p className="text-xs text-gray-400">
              Wants to become a speaker in the room
            </p>
          </div>

          <div className="flex w-full space-x-3">
            <button
              onClick={handleAccept}
              className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors group"
            >
              <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">Accept</span>
            </button>

            <button
              onClick={handleDeny}
              className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg transition-colors group"
            >
              <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">Deny</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptRequest;
