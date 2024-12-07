import { PeerMetadata } from "@/utils/types";
import {
  useDataMessage,
  useLocalScreenShare,
  usePeerIds,
  useRemoteAudio,
  useRemotePeer,
  useRemoteScreenShare,
  useRemoteVideo,
} from "@huddle01/react/hooks";
import Video from "./Media/Video";
import Audio from "./Media/Audio";
import GridContainer from "./GridContainer";
import clsx from "clsx";
import { useStudioState } from "@/store/studioState";
import Camera from "./Media/Camera";
import { Role } from "@huddle01/server-sdk/auth";
import { NestedPeerListIcons } from "@/utils/PeerListIcons";
import { useState } from "react";
import Image from "next/image";

interface RemotePeerProps {
  peerId: string;
  className?: string;
}

const RemotePeer = ({ peerId, className }: RemotePeerProps) => {
  const { stream: videoStream } = useRemoteVideo({ peerId });
  const { stream: audioStream, isAudioOn, state } = useRemoteAudio({ peerId });
  const { metadata } = useRemotePeer<PeerMetadata>({ peerId });
  const { isScreenShared } = useStudioState();
  const { peerIds } = usePeerIds({
    roles: [Role.HOST, Role.GUEST, Role.CO_HOST],
  });
  const [reaction, setReaction] = useState("");

  useDataMessage({
    onMessage(payload, from, label) {
      if (from === peerId) {
        if (label === "reaction") {
          setReaction(payload);
          setTimeout(() => {
            setReaction("");
          }, 5000);
        }
      }
    },
  });

  return (
    <div
      className={clsx(
        `bg-[#202020] bg-opacity-80 relative rounded-lg flex flex-col items-center justify-center min-w-[150px] min-h-[150px] w-full ${
          isAudioOn
            ? "p-[3px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"
            : "bg-[#202020] bg-opacity-80"
        }`,
        className
      )}
    >
      <div className="bg-[#202020] flex flex-col rounded-md w-full h-full items-center justify-center">
        <div className="absolute left-4 top-4 text-3xl z-10">{reaction}</div>
        {metadata?.isHandRaised && (
          <span className="absolute top-4 right-4 text-4xl text-gray-200 font-medium">
            ✋
          </span>
        )}
        {videoStream ? (
          <Camera
            stream={videoStream}
            name={metadata?.displayName ?? "guest"}
          />
        ) : (
          <div className="flex w-24 h-24 rounded-full">
            {metadata?.avatarUrl && (
              <div className=" rounded-full w-24 h-24">
                <Image
                  src={metadata?.avatarUrl}
                  alt="image"
                  className="maskAvatar object-cover"
                  width={100}
                  height={100}
                />
              </div>
            )}
          </div>
        )}
        <span className="absolute bottom-4 left-4 text-white font-medium">
          {metadata?.displayName}
        </span>
        <span className="absolute bottom-4 right-4">
          {isAudioOn
            ? NestedPeerListIcons.active.mic
            : NestedPeerListIcons.inactive.mic}
        </span>
        {/* {audioStream && (
        <Audio stream={audioStream} name={metadata?.displayName ?? "guest"} />
      )} */}
      </div>
    </div>
  );
};

export default RemotePeer;
