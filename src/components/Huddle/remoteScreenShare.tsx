import { PeerMetadata } from "@/utils/types";
import {
  useRemotePeer,
  useRemoteScreenShare,
  useLocalPeer,
} from "@huddle01/react/hooks";
import Video from "./Media/Video";
import Audio from "./Media/Audio";
import GridContainer from "./GridContainer";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useStudioState } from "@/store/studioState";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@nextui-org/react";
import Image from "next/image";
import interact from "interactjs";

interface RemotePeerProps {
  peerId: string;
  isRemoteLessScreen: boolean;
  setIsRemoteLessScreen: (value: boolean) => void;
  onVideoTrackUpdate: (
    peerId: string,
    videoTrack: MediaStreamTrack | null
  ) => void;
}

const RemoteScreenShare = ({
  peerId,
  isRemoteLessScreen,
  setIsRemoteLessScreen,
  onVideoTrackUpdate,
}: RemotePeerProps) => {
  // const RemoteScreenShare = ({ peerId, isFullScreen, setIsFullScreen }: RemotePeerProps) => {
  const { setIsScreenShared } = useStudioState();
  const { videoTrack, audioTrack } = useRemoteScreenShare({
    peerId,
    onPlayable(data) {
      if (data) {
        setIsScreenShared(true);
      }
    },
    onClose() {
      setIsScreenShared(false);
    },
  });
  const { metadata } = useRemotePeer<PeerMetadata>({ peerId });
  const { metadata: localMetadata } = useLocalPeer<PeerMetadata>();
  const [videoStreamTrack, setVideoStreamTrack] = useState<any>("");
  const [draggablePosition, setDraggablePosition] = useState({ x: 0, y: 0 });
  const draggableRef = useRef(null);

  useEffect(() => {
    console.log("Draggable ref:", draggableRef.current);
    if (draggableRef.current) {
      const position = { x: 0, y: 0 };
      const interactable = interact(draggableRef.current).draggable({
        listeners: {
          start(event) {
            console.log(event.type, event.target);
          },
          move(event) {
            position.x += event.dx;
            position.y += event.dy;

            event.target.style.transform = `translate(${position.x}px, ${position.y}px)`;

            setDraggablePosition(position);
          },
        },
        inertia: true,
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: "parent",
            // endOnly: true
          }),
        ],
      });

      return () => {
        interactable.unset();
      };
    }
  }, [videoTrack, isRemoteLessScreen]);

  const toggleFullScreen = () => {
    setIsRemoteLessScreen(!isRemoteLessScreen);
  };

  // useEffect(() => {
  //   setVideoStreamTrack(videoTrack && new MediaStream([videoTrack]));
  //   console.log("videoTrack-remotescreen", videoTrack);
  // }, [videoTrack]);
  useEffect(() => {
    if (videoTrack) {
      const newVideoStreamTrack = new MediaStream([videoTrack]);
      setVideoStreamTrack(newVideoStreamTrack);
      onVideoTrackUpdate(peerId, videoTrack);
    } else {
      setVideoStreamTrack(null);
      onVideoTrackUpdate(peerId, null);
    }
  }, [videoTrack, peerId, onVideoTrackUpdate]);

  return (
    <>
      {videoTrack && !isRemoteLessScreen && (
        <div
          ref={draggableRef}
          className={`absolute bottom-4 left-4 bg-[#131212] bg-opacity-80 rounded-lg flex  items-center justify-center min-w-[150px] min-h-[150px] z-20 cursor-move touch-none`}
          style={{
            transform: `translate(${draggablePosition.x}px, ${draggablePosition.y}px)`,
          }}
        >
          {localMetadata?.avatarUrl && (
            <div className=" rounded-full w-20 h-20">
              <Image
                alt="image"
                src={localMetadata?.avatarUrl}
                className="maskAvatar object-cover object-center"
                width={100}
                height={100}
              />
            </div>
          )}
          <span className="absolute bottom-2 left-2 text-white">You</span>
        </div>
      )}
      {videoTrack && (
        <div className={`w-full`}>
          <GridContainer className="w-full h-full relative">
            <>
              <Tooltip
                content={isRemoteLessScreen ? "Full Screen" : "Less Screen"}
              >
                <Button
                  className="absolute bottom-4 right-4 z-10 bg-[#0a0a0a] hover:bg-[#131212] rounded-full"
                  onClick={toggleFullScreen}
                >
                  {isRemoteLessScreen ? <Maximize2 /> : <Minimize2 />}
                </Button>
              </Tooltip>
              <Video
                stream={videoStreamTrack}
                name={metadata?.displayName ?? "guest"}
              />
              {audioTrack && (
                <Audio
                  stream={audioTrack && new MediaStream([audioTrack])}
                  name={metadata?.displayName ?? "guest"}
                />
              )}
            </>
          </GridContainer>
          {/* {!isRemoteLessScreen && (
            <div
            ref={draggableRef}
              className={`absolute bottom-4 left-4 bg-[#131212] bg-opacity-80 rounded-lg flex  items-center justify-center min-w-[150px] min-h-[150px] z-20 cursor-move touch-none`}
              style={{
                transform: `translate(${draggablePosition.x}px, ${draggablePosition.y}px)`,
              }}
            >
              {localMetadata?.avatarUrl && (
                <div className=" rounded-full w-20 h-20">
                  <Image
                    alt="image"
                    src={localMetadata?.avatarUrl}
                    className="maskAvatar object-cover object-center"
                    width={100}
                    height={100}
                  />
                </div>
              )}
              <span className="absolute bottom-2 left-2 text-white">You</span>
            </div>
          )} */}
        </div>
      )}
    </>
  );
};

export default RemoteScreenShare;
