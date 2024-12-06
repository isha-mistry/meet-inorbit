import React from "react";
import { useRemoteAudio } from "@huddle01/react";
import Audio from "./Audio";

interface Props {
  peerId: string;
}

const PeerAudioTrack: React.FC<Props> = ({ peerId }) => {
  const { state, stream } = useRemoteAudio({
    peerId,
    onClose: (data) => handleClose(data),
  });

  // const { toast } = useToast();

  const handleClose = (reason?: {
    code: number;
    tag: string;
    message: string;
  }) => {
    if (reason?.tag === "CLOSED_BY_ADMIN")
      // toast({
      //   title: "Host Muted you",
      // });
      console.log("Host muted you.");
  };

  if (stream && state === "playable") return <Audio stream={stream} />;

  return null;
};

export default React.memo(PeerAudioTrack);
