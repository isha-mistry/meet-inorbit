import { PeerListIcons } from "@/utils/PeerListIcons";
import { useStudioState } from "@/store/studioState";
import { useRemotePeer } from "@huddle01/react/hooks";
import { Role } from "@huddle01/server-sdk/auth";
import Image from "next/image";
import type { FC } from "react";

interface AcceptDenyPeerProps {
  peerId: string;
}

const AcceptDenyPeer: FC<AcceptDenyPeerProps> = ({ peerId }) => {
  const { metadata, updateRole } = useRemotePeer<{
    displayName: string;
    avatarUrl: string;
    isHandRaised: boolean;
  }>({ peerId });

  const { removeRequestedPeers } = useStudioState();

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <Image
          src={metadata?.avatarUrl ?? ""}
          alt="default"
          width={30}
          height={30}
          priority
          quality={100}
          className="object-contain rounded-full"
        />
        <div className="text-slate-400 tex-sm font-normal">
          {metadata?.displayName}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div
          role="presentation"
          onClick={() => {
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
            removeRequestedPeers(peerId);
          }}
          className="cursor-pointer"
        >
          {PeerListIcons.accept}
        </div>
        <div
          role="presentation"
          onClick={() => {
            removeRequestedPeers(peerId);
          }}
          className="cursor-pointer"
        >
          {PeerListIcons.deny}
        </div>
      </div>
    </div>
  );
};

export default AcceptDenyPeer;
