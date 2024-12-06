import { usePeerIds } from "@huddle01/react";
import PeerAudioTrack from "./PeerAudioTrack";

const AudioController = () => {
  const { peerIds } = usePeerIds({ labels: ["audio"] });

  return (
    <>
      {peerIds.map((peerId) => (
        <PeerAudioTrack peerId={peerId} key={`audioPorts-${peerId}`} />
      ))}
    </>
  );
};

export default AudioController;
