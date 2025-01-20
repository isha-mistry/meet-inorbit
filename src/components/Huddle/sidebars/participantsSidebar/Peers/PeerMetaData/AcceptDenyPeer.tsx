import { PeerListIcons } from "@/utils/PeerListIcons";
import { useStudioState } from "@/store/studioState";
import { useDataMessage, useRemotePeer } from "@huddle01/react/hooks";
import { Role } from "@huddle01/server-sdk/auth";
import Image from "next/image";
import type { FC } from "react";
import { SpeakerRequestAction } from "@/utils/types";

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
  const { sendData } = useDataMessage();

  useDataMessage({
    onMessage: (payload, from, label) => {
      if (label === "speakerRequestResponse") {
        const { action, targetPeerId } = JSON.parse(payload);
        if (targetPeerId === peerId) {
          removeRequestedPeers(targetPeerId);
        }
      }
    },
  });

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
        <div className="text-slate-400 text-sm font-normal">
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
            sendData({
              to: "*", // Send to all peers
              payload: JSON.stringify({
                action: "ACCEPT",
                targetPeerId: peerId,
              }),
              label: "speakerRequestResponse",
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
            sendData({
              to: "*", // Send to all peers
              payload: JSON.stringify({
                action: "REJECT",
                targetPeerId: peerId,
              }),
              label: "speakerRequestResponse",
            });
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
