"use client";

import RemotePeer from "@/components/Huddle/remotePeer";
import { useStudioState } from "@/store/studioState";
import { BasicIcons } from "@/utils/BasicIcons";
import {
  useDataMessage,
  useDevices,
  useLocalAudio,
  useLocalMedia,
  useLocalPeer,
  useLocalScreenShare,
  useLocalVideo,
  usePeerIds,
  useRemoteAudio,
  useRemotePeer,
  useRemoteScreenShare,
  useRoom,
} from "@huddle01/react/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import BottomBar from "@/components/Huddle/Bottombar/bottomBar";
import { Button } from "@/components/ui/button";
import { PeerMetadata } from "@/utils/types";
import ChatBar from "@/components/Huddle/sidebars/ChatBar/chatbar";
import ParticipantsBar from "@/components/Huddle/sidebars/participantsSidebar/participantsBar";
import Video from "@/components/Huddle/Media/Video";
import { Role } from "@huddle01/server-sdk/auth";
import clsx from "clsx";
import GridContainer from "@/components/Huddle/GridContainer";
import RemoteScreenShare from "@/components/Huddle/remoteScreenShare";
import Camera from "@/components/Huddle/Media/Camera";
import AttestationModal from "@/components/ComponentUtils/AttestationModal";
import { useAccount } from "wagmi";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import { RotatingLines } from "react-loader-spinner";
import Link from "next/link";
import { Tooltip } from "@nextui-org/react";
import { PiRecordFill } from "react-icons/pi";
import ParticipantTile from "@/components/Huddle/ParticipantTile";
import { NestedPeerListIcons } from "@/utils/PeerListIcons";
// import logo from "@/assets/images/daos/CCLogo1.png";
import Image from "next/image";
import { headers } from "next/headers";
// import UpdateSessionDetails from "@/components/MeetingPreview/UpdateSessionDetails";
import PopupSlider from "@/components/FeedbackPopup/PopupSlider";
import MeetingRecordingModal from "@/components/ComponentUtils/MeetingRecordingModal";
import toast from "react-hot-toast";
import {
  handleCloseMeeting,
  startRecording,
} from "@/components/Huddle/HuddleUtils";
import { APP_BASE_URL, BASE_URL } from "@/config/constants";
import { fetchApi } from "@/utils/api";
import { Fullscreen, Maximize2, Minimize2 } from "lucide-react";
import Audio from "@/components/Huddle/Media/Audio";
import AudioController from "@/components/Huddle/Media/AudioController";
import interact from "interactjs";
import AcceptRequest from "@/components/Modals/AcceptRequest";
import Prompts from "@/components/ui/Prompts";
import { IoCopy } from "react-icons/io5";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

const GlobalScrollbarStyles = `
  /* Webkit (Chrome, Safari, newer versions of Opera) */
  ::-webkit-scrollbar {
    width: 8px;
    background-color: transparent;
  }
  
  ::-webkit-scrollbar-track {
    background-color: #2a2a2a;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background-color: #7b7b7b; /* Blue shade matching your design */
    border-radius: 10px;
    transition: background-color 0.3s ease;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background-color: #0a0a0a; /* Lighter blue on hover */
  }
  
  /* Firefox scrollbar */
  * {
    scrollbar-width: thin;
    scrollbar-color: #44474e #2a2a2a;
  }
`;

export default function Component({ params }: { params: { roomId: string } }) {
  const { isVideoOn, enableVideo, disableVideo, stream } = useLocalVideo();
  const { login, authenticated } = usePrivy();
  const {
    isAudioOn,
    enableAudio,
    disableAudio,
    stream: audioStream,
  } = useLocalAudio();
  const { fetchStream } = useLocalMedia();
  const { setPreferredDevice: setCamPrefferedDevice } = useDevices({
    type: "cam",
  });
  const { setPreferredDevice: setAudioPrefferedDevice } = useDevices({
    type: "mic",
  });
  const {
    name,
    isChatOpen,
    isParticipantsOpen,
    addChatMessage,
    activeBg,
    videoDevice,
    audioInputDevice,
    layout,
    isScreenShared,
    setIsScreenShared,
    avatarUrl,
    isRecording,
    setIsRecording,
    meetingRecordingStatus,
    setMeetingRecordingStatus,
    setShowAcceptRequest,
    addRequestedPeers,
    showAcceptRequest,
  } = useStudioState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { peerIds } = usePeerIds({
    roles: [Role.HOST, Role.SPEAKER, Role.LISTENER, Role.CO_HOST],
  });
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();
  const { peerId } = useLocalPeer();
  const { metadata, role } = useLocalPeer<PeerMetadata>();
  const { videoTrack, shareStream } = useLocalScreenShare();
  const [modalOpen, setModalOpen] = useState(false);
  const [hostModalOpen, setHostModalOpen] = useState(false);
  const [hostAddress, setHostAddress] = useState<any>();
  const [daoName, setDaoName] = useState<any>();
  const { address } = useAccount();
  const { push } = useRouter();
  const path = usePathname();
  const [isAllowToEnter, setIsAllowToEnter] = useState<boolean>();
  const [notAllowedMessage, setNotAllowedMessage] = useState<string>();
  const [videoStreamTrack, setVideoStreamTrack] = useState<any>("");
  const [showFeedbackPopups, setShowFeedbackPopups] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [meetingData, setMeetingData] = useState<any>();
  const { sendData } = useDataMessage();
  const meetingCategory = usePathname().split("/")[2];
  const { walletAddress } = useWalletAddress();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isRemoteFullScreen, setIsRemoteFullScreen] = useState(false);

  const draggableRef = useRef(null);
  const [draggablePosition, setDraggablePosition] = useState({ x: 0, y: 0 });
  const [requestedPeerId, setRequestedPeerId] = useState("");
  const [tooltipContent, setTooltipContent] = useState("Copy");
  const [animatingButtons, setAnimatingButtons] = useState<{
    [key: string]: boolean;
  }>({});

  const [isSmallScreen, setIsSmallScreen] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const firstSlideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isScreenShared) {
      setIsFullScreen(false);
      setIsRemoteFullScreen(false);
    }
  }, []);

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
  }, [shareStream, !isFullScreen, isSmallScreen]);

  const [remoteVideoTracks, setRemoteVideoTracks] = useState<
    Record<string, MediaStreamTrack | null>
  >({});

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = GlobalScrollbarStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const handleVideoTrackUpdate = useCallback(
    (peerId: string, videoTrack: MediaStreamTrack | null) => {
      setRemoteVideoTracks((prev) => ({
        ...prev,
        [peerId]: videoTrack,
      }));
    },
    []
  );

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleCopy = () => {
    if (typeof window === "undefined") return;

    navigator.clipboard.writeText(`${BASE_URL}${path}/lobby`);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  // Function to truncate long addresses
  const truncateAddress = (address: string, maxLength = 30) => {
    if (address.length <= maxLength) return address;
    return address.slice(0, maxLength) + "...";
  };

  // let meetingType;

  // if (meetingCategory === "officehours") {
  //   meetingType = 2;
  // } else if (meetingCategory === "session") {
  //   meetingType = 1;
  // } else {
  //   meetingType = 0;
  // }

  const { state } = useRoom({
    onLeave: async ({ reason }) => {
      const token = await getAccessToken();
      try {
        if (reason === "CLOSED") {
          const myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");

          if (walletAddress) {
            myHeaders.append("x-wallet-address", walletAddress);
            myHeaders.append("Authorization", `Bearer ${token}`);
          }

          const raw = JSON.stringify({
            address: walletAddress,
            role: role,
          });

          const requestOptions: any = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
          };

          const response = await fetchApi(
            "/feedback/get-feedback-status",
            requestOptions
          );

          const result = await response.json();

          if (result.data) {
            setShowFeedbackPopups(false);
            handlePopupRedirection();
          } else {
            setShowFeedbackPopups(true);
          }

          // if (role === "host") {
          //   setTimeout(async () => {
          //     await handleCloseMeeting(
          //       address,
          //       meetingCategory,
          //       params.roomId,
          //       daoName,
          //       hostAddress,
          //       meetingData,
          //       isRecording
          //     );
          //   }, 10000);
          // }
          setIsRecording(false);
        } else {
          router.push(`/meeting/officehours/${params.roomId}/lobby`);
        }
      } catch (e) {
        setIsRecording(false);
        console.log("error in closing room: ", e);
      }
    },
  });

  const handleFeedbackPopupsClose = async () => {
    setShowFeedbackPopups(false);
    await handlePopupRedirection();
  };

  const handlePopupRedirection = async () => {
    if (role === "host") {
      const storedStatus = sessionStorage.getItem("meetingData");
      if (storedStatus) {
        const parsedStatus = JSON.parse(storedStatus);
        if (
          parsedStatus.meetingId === params.roomId &&
          parsedStatus.isMeetingRecorded === true
        ) {
          router.push(
            `/meeting/officehours/${params.roomId}/update-session-details`
          );
        } else {
          setHostModalOpen(true);
        }
      }
    } else if (role === "speaker" || role === "listener" || role === "coHost") {
      setModalOpen(true);
    }
    const storedStatus = sessionStorage.getItem("meetingData");
    if (storedStatus) {
      const parsedStatus = JSON.parse(storedStatus);
      if (parsedStatus.meetingId === params.roomId) {
        sessionStorage.removeItem("meetingData");
      }
    }
  };

  const { updateMetadata } = useLocalPeer<{
    displayName: string;
    avatarUrl: string;
    isHandRaised: boolean;
    walletAddress: string;
  }>();

  const [reaction, setReaction] = useState("");

  useDataMessage({
    async onMessage(payload, from, label) {
      if (label === "requestToSpeak") {
        setShowAcceptRequest(true);
        setRequestedPeerId(from);
        addRequestedPeers(from);
        setTimeout(() => {
          setShowAcceptRequest(false);
        }, 5000);
      }

      if (label === "chat") {
        const { message, name } = JSON.parse(payload);
        addChatMessage({
          name: name,
          text: message,
          isUser: from === peerId,
        });
      }
      if (from === peerId) {
        if (label === "reaction") {
          setReaction(payload);
          setTimeout(() => {
            setReaction("");
          }, 5000);
        }
      }
      if (label === "recordingStatus") {
        const status = JSON.parse(payload).isRecording;
        setIsRecording(status);
      }
      if (label === "requestRecordingStatus" && role === "host") {
        sendData({
          to: [from],
          payload: JSON.stringify({ isRecording: isRecording }),
          label: "recordingStatus",
        });
      }
    },
  });

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    setCamPrefferedDevice(videoDevice.deviceId);
    if (isVideoOn) {
      disableVideo();
      const changeVideo = async () => {
        const { stream } = await fetchStream({
          mediaDeviceKind: "cam",
        });
        if (stream) {
          await enableVideo(stream);
        }
      };
      changeVideo();
    }
  }, [videoDevice]);

  useEffect(() => {
    setAudioPrefferedDevice(audioInputDevice.deviceId);
    if (isAudioOn) {
      disableAudio();
      const changeAudio = async () => {
        const { stream } = await fetchStream({
          mediaDeviceKind: "mic",
        });
        if (stream) {
          enableAudio(stream);
        }
      };
      changeAudio();
    }
  }, [audioInputDevice]);

  const handleModalClose = () => {
    setModalOpen(false);
    if (walletAddress === hostAddress) {
      push(
        `${APP_BASE_URL}/profile/${walletAddress}?active=officeHours&hours=hosted`
      );
    } else {
      push(
        `${APP_BASE_URL}/profile/${walletAddress}?active=officeHours&hours=attended`
      );
    }
  };

  useEffect(() => {
    async function verifyMeetingId() {
      try {
        const myHeaders = new Headers();
        const token = await getAccessToken();
        myHeaders.append("Content-Type", "application/json");

        if (walletAddress) {
          myHeaders.append("x-wallet-address", walletAddress);
          myHeaders.append("Authorization", `Bearer ${token}`);
        }
        const raw = JSON.stringify({
          roomId: params.roomId,
          meetingType: "office_hours",
        });

        const requestOptions: any = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        };
        const response = await fetchApi("/verify-meeting-id", requestOptions);
        const result = await response.json();

        if (result.success) {
          setMeetingData(result.data);
          setHostAddress(result.data.host_address);
          setDaoName(result.data.dao_name);
          // setDaoName("optimism");
        }

        if (result.success) {
          if (result.message === "Meeting has ended") {
            setIsAllowToEnter(false);
            setNotAllowedMessage(result.message);
          } else if (result.message === "Meeting is upcoming") {
            setIsAllowToEnter(true);
          } else if (result.message === "Meeting has been denied") {
            setIsAllowToEnter(false);
            setNotAllowedMessage(result.message);
          } else if (result.message === "Meeting does not exist") {
            setIsAllowToEnter(false);
            setNotAllowedMessage(result.message);
          } else if (result.message === "Meeting is ongoing") {
            setIsAllowToEnter(true);
          }
        } else {
          // Handle error scenarios
          setNotAllowedMessage(result.error || result.message);
          console.error("Error:", result.error || result.message);
        }
      } catch (error) {
        // Handle network errors
        console.error("Fetch error:", error);
      }
    }

    if (authenticated && walletAddress != null) {
      verifyMeetingId();
    }
  }, [params.roomId, isAllowToEnter, notAllowedMessage, walletAddress]);

  useEffect(() => {
    if (state === "idle" && isAllowToEnter) {
      push(`/meeting/officehours/${params.roomId}/lobby`);
      return;
    } else {
      updateMetadata({
        displayName: name,
        avatarUrl: avatarUrl,
        isHandRaised: metadata?.isHandRaised || false,
        walletAddress: walletAddress || "",
      });
    }
  }, [isAllowToEnter, state]);

  useEffect(() => {
    setVideoStreamTrack(videoTrack && new MediaStream([videoTrack]));
  }, [videoTrack]);

  // useEffect(() => {
  //   const storedStatus = localStorage.getItem("meetingData");
  //   if (storedStatus) {
  //     const parsedStatus = JSON.parse(storedStatus);
  //     ("storedStatus: ", parsedStatus);
  //     setRecordingStatus(parsedStatus.isMeetingRecorded);
  //     setIsRecording(parsedStatus.isMeetingRecorded);
  //   }
  // }, [recordingStatus]);

  const updateRecordingStatus = (status: any) => {
    // setIsRecording(status);
    // setMeetingRecordingStatus(status);
    sendData({
      to: "*",
      payload: JSON.stringify({ isRecording: status }),
      label: "recordingStatus",
    });
  };

  const handleMeetingModalClose = async (result: boolean) => {
    const token = await getAccessToken();
    if (role === "host") {
      setShowModal(false);
      const meetingData = {
        meetingId: params.roomId,
        isMeetingRecorded: result,
        recordingStatus: result,
      };
      sessionStorage.setItem("meetingData", JSON.stringify(meetingData));
      setIsRecording(result);
      setMeetingRecordingStatus(result);
      updateRecordingStatus(result);
      if (result) {
        startRecording(
          params.roomId,
          setIsRecording,
          walletAddress ? walletAddress : "",
          token ? token : ""
        );
      }
    }
  };

  useEffect(() => {
    // const value = meetingRecordingStatus;
    let existingValue = sessionStorage.getItem("meetingData");
    if (existingValue) {
      let parsedValue = JSON.parse(existingValue);
      if (parsedValue.meetingId === params.roomId) {
        setIsRecording(parsedValue.isMeetingRecorded);
        setMeetingRecordingStatus(parsedValue.recordingStatus);

        if (parsedValue.recordingStatus) {
          updateRecordingStatus(parsedValue.recordingStatus);
        }
      }
    }
    if (role === "speaker" || role === "listener" || role === "coHost") {
      sendData({
        to: "*",
        payload: JSON.stringify({ action: "getRecordingStatus" }),
        label: "requestRecordingStatus",
      });
    }
  }, [meetingRecordingStatus]);

  // useEffect(() => {
  //   const storedStatus = sessionStorage.getItem("meetingData");
  //   if (storedStatus) {
  //     const parsedStatus = JSON.parse(storedStatus);
  //     if (parsedStatus.meetingId === params.roomId) {
  //       setIsRecording(parsedStatus.isMeetingRecorded);
  //       setCurrentRecordingState(parsedStatus.recordingStatus);
  //     }
  //   }
  // }, [isRecording]);

  const handleAddrCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setTooltipContent("Copied");

    setAnimatingButtons((prev) => ({
      ...prev,
      [addr]: true,
    }));

    setTimeout(() => {
      setTooltipContent("Copy");
      setAnimatingButtons((prev) => ({
        ...prev,
        [addr]: false,
      }));
    }, 4000);
  };

  return (
    <>
      {isAllowToEnter ? (
        <div
          className={clsx(
            `flex flex-col h-screen font-poppins bg-contain bg-center bg-no-repeat ${
              daoName === "optimism"
                ? "bg-op-profile"
                : daoName === "arbitrum"
                ? "bg-arb-profile"
                : null
            }`
          )}
        >
          <div className="bg-[#0a0a0a] flex flex-col h-screen">
            <header className="flex items-center justify-between pt-4 px-4 md:px-6">
              <div className="flex items-center py-2 space-x-2">
                <div className="text-3xl font-semibold tracking-wide font-quanty">
                  <span className="text-white">Chora</span>
                  <span className="text-blue-shade-100">Club</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4">
                {(isRecording || meetingRecordingStatus) && (
                  <Tooltip
                    showArrow
                    content={
                      <div className="font-poppins">
                        This meeting is being recorded
                      </div>
                    }
                    placement="left"
                    className="rounded-md bg-opacity-90 max-w-96"
                    closeDelay={1}
                  >
                    <span>
                      <PiRecordFill color="#c42727" size={22} />
                    </span>
                  </Tooltip>
                )}

                <div className="flex space-x-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="flex gap-2 bg-[#202020] text-gray-200 hover:bg-gray-500/50">
                        {BasicIcons.invite}
                        <span className="hidden lg:block">Invite</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-72">
                      <div className="flex items-center space-x-2 p-2">
                        <span
                          className="flex-grow p-2  bg-[#2f2f2f] rounded-lg  text-white truncate text-sm"
                          title={`${BASE_URL}${path}`}
                        >
                          {typeof window !== "undefined" &&
                            truncateAddress(`${BASE_URL}${path}`)}
                        </span>
                        <Button
                          className="bg-[#2f2f2f] hover:bg-gray-600/50 text-white text-sm px-3 py-2"
                          onClick={handleCopy}
                        >
                          {isCopied ? "Copied" : "Copy"}
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>
            <div className="relative flex-1 w-full h-[80%] p-2">
              <Swiper
                pagination={{
                  clickable: true,
                  renderBullet: (index, className) => {
                    return `<span 
                    class="${className}" 
                    style="
                         background-color: white;
                         opacity: 0.8;
                         border-radius:50%;
                         width: 10px;
                         height: 10px;
                         display:inline-block;
                        "
                     ></span>`;
                  },
                  bulletClass: "swiper-pagination-bullet",
                  bulletActiveClass: "swiper-pagination-bullet-active",
                }}
                modules={[Pagination]}
              >
                <SwiperSlide>
                  <main
                    className={`relative transition-all ease-in-out flex items-center justify-center flex-1 duration-300 w-full h-full`}
                  >
                    {((shareStream && isFullScreen) ||
                      (shareStream && isSmallScreen)) && (
                      <div
                        ref={draggableRef}
                        className={`absolute bottom-4 left-4 bg-[#131212] bg-opacity-80 rounded-lg flex items-center justify-center min-w-[150px] min-h-[150px] z-20 cursor-move touch-none`}
                        style={{
                          transform: `translate(${draggablePosition.x}px, ${draggablePosition.y}px)`,
                        }}
                      >
                        {metadata?.avatarUrl && (
                          <div className=" rounded-full w-20 h-20">
                            <Image
                              alt="image"
                              src={metadata?.avatarUrl}
                              className="maskAvatar object-cover object-center"
                              width={100}
                              height={100}
                            />
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 text-white">
                          You
                        </span>
                      </div>
                    )}
                    <div
                      className={`relative flex flex-col lg:flex-row w-full h-full ${
                        isRemoteFullScreen && isScreenShared && isFullScreen
                          ? "bg-[#202020] rounded-lg justify-center"
                          : ""
                      } `}
                    >
                      {shareStream && (
                        <div className={`w-full `}>
                          <GridContainer className="w-full h-full relative">
                            <>
                              {!isSmallScreen && (
                                <Tooltip
                                  content={
                                    isFullScreen
                                      ? "Exit Full Screen"
                                      : "Full Screen"
                                  }
                                >
                                  <Button
                                    className="absolute bottom-4 right-4 z-10 bg-[#0a0a0a] hover:bg-[#131212] rounded-full"
                                    onClick={toggleFullScreen}
                                  >
                                    {isFullScreen ? (
                                      <Minimize2 />
                                    ) : (
                                      <Maximize2 />
                                    )}
                                  </Button>
                                </Tooltip>
                              )}
                              <Video
                                stream={videoStreamTrack}
                                name={metadata?.displayName ?? "guest"}
                              />
                            </>
                          </GridContainer>
                        </div>
                      )}
                      {peerIds.map((peerId) => (
                        <RemoteScreenShare
                          key={peerId}
                          peerId={peerId}
                          isRemoteFullScreen={isRemoteFullScreen}
                          setIsRemoteFullScreen={setIsRemoteFullScreen}
                          onVideoTrackUpdate={handleVideoTrackUpdate}
                        />
                      ))}

                      <section
                        ref={firstSlideRef}
                        className={`${
                          !isScreenShared
                            ? "grid "
                            : `${
                                isRemoteFullScreen && isScreenShared
                                  ? "hidden"
                                  : `${
                                      isFullScreen && isScreenShared
                                        ? "hidden"
                                        : "hidden lg:grid"
                                    }`
                              }`
                        } py-4 lg:py-0 lg:px-4 gap-2 w-full h-[calc(100vh-135px)] m-auto overflow-y-auto scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-blue-600 first-slide ${
                          isScreenShared
                            ? "lg:grid-cols-1 lg:w-[40%]" // Show single column if screen is shared
                            : peerIds.length === 0
                            ? "grid-cols-1"
                            : peerIds.length === 1
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 "
                            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 1.5xl:grid-cols-2"
                        }
                      `}
                      >
                        {role !== Role.BOT && (
                          <>
                            <div
                              className={`relative 
                            ${
                              isAudioOn
                                ? "p-[3px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"
                                : "bg-[#202020] bg-opacity-80"
                            }
                          rounded-lg flex min-w-[150px] min-h-[150px] overflow-hidden`}
                            >
                              <div className="bg-[#202020] flex flex-col rounded-md w-full h-full items-center justify-center">
                                <div className="absolute left-4 top-4 text-3xl z-10">
                                  {reaction}
                                </div>
                                {metadata?.isHandRaised && (
                                  <span className="absolute top-4 right-4 text-4xl text-gray-200 font-medium z-10">
                                    ✋
                                  </span>
                                )}
                                {stream && (
                                  <span className="absolute top-0 bottom-0 right-0 left-0">
                                    <Camera
                                      stream={stream}
                                      name={metadata?.displayName ?? "guest"}
                                    />
                                  </span>
                                )}

                                {!stream && (
                                  <div className="flex w-24 h-24 rounded-full">
                                    {metadata?.avatarUrl && (
                                      <div className=" rounded-full w-24 h-24">
                                        <Image
                                          alt="image"
                                          src={metadata?.avatarUrl}
                                          className="maskAvatar object-cover object-center"
                                          width={100}
                                          height={100}
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
                                <span className="absolute bottom-4 left-4 text-white font-medium">
                                  <div className="flex">
                                    {`${metadata?.displayName} (You)`}
                                    <Tooltip
                                      content={tooltipContent}
                                      placement="right"
                                      closeDelay={1}
                                      showArrow
                                    >
                                      <div
                                        className={`pl-2 pt-[2px] cursor-pointer  ${
                                          animatingButtons[
                                            metadata?.walletAddress || ""
                                          ]
                                            ? "text-blue-500"
                                            : "text-[#3E3D3D]"
                                        }`}
                                      >
                                        <IoCopy
                                          onClick={() =>
                                            handleAddrCopy(
                                              `${metadata?.walletAddress}`
                                            )
                                          }
                                        />
                                      </div>
                                    </Tooltip>
                                  </div>
                                </span>
                                <span className="absolute bottom-4 right-4">
                                  {isAudioOn
                                    ? NestedPeerListIcons.active.mic
                                    : NestedPeerListIcons.inactive.mic}
                                </span>
                              </div>
                            </div>
                          </>
                        )}

                        {isScreenShared ? (
                          <>
                            {peerIds.length > 2 ? (
                              <>
                                {peerIds.slice(0, 2).map((peerId) => (
                                  <RemotePeer
                                    key={peerId}
                                    peerId={peerId}
                                    className={clsx("sm:hidden")}
                                  />
                                ))}
                              </>
                            ) : (
                              peerIds.map((peerId) => (
                                <RemotePeer
                                  key={peerId}
                                  peerId={peerId}
                                  className={clsx("sm:hidden")}
                                />
                              ))
                            )}
                            {peerIds.length > 3 ? (
                              <>
                                {peerIds.slice(0, 3).map((peerId) => (
                                  <RemotePeer
                                    key={peerId}
                                    peerId={peerId}
                                    className={clsx("hidden sm:flex md:hidden")}
                                  />
                                ))}
                              </>
                            ) : (
                              peerIds.map((peerId) => (
                                <RemotePeer
                                  key={peerId}
                                  peerId={peerId}
                                  className={clsx("hidden sm:flex md:hidden")}
                                />
                              ))
                            )}
                            {peerIds.length > 2 ? (
                              <>
                                {peerIds.slice(0, 2).map((peerId) => (
                                  <RemotePeer
                                    key={peerId}
                                    peerId={peerId}
                                    className={clsx("hidden md:flex lg:hidden")}
                                  />
                                ))}
                              </>
                            ) : (
                              peerIds.map((peerId) => (
                                <RemotePeer
                                  key={peerId}
                                  peerId={peerId}
                                  className={clsx("hidden md:flex lg:hidden")}
                                />
                              ))
                            )}
                            {peerIds.length > 3 ? (
                              <>
                                {peerIds.slice(0, 3).map((peerId) => (
                                  <RemotePeer
                                    key={peerId}
                                    peerId={peerId}
                                    className={clsx("hidden lg:flex ")}
                                  />
                                ))}
                              </>
                            ) : (
                              peerIds.map((peerId) => (
                                <RemotePeer
                                  key={peerId}
                                  peerId={peerId}
                                  className={clsx("hidden lg:flex ")}
                                />
                              ))
                            )}
                          </>
                        ) : peerIds.length > 3 ? (
                          <>
                            {peerIds.slice(0, 3).map((peerId) => (
                              <RemotePeer key={peerId} peerId={peerId} />
                            ))}
                          </>
                        ) : (
                          peerIds.map((peerId) => (
                            <RemotePeer key={peerId} peerId={peerId} />
                          ))
                        )}
                      </section>
                    </div>
                  </main>
                </SwiperSlide>

                {isScreenShared && isSmallScreen && (
                  <>
                    {Array.from({
                      length: Math.ceil((peerIds.length - 3) / 4) + 1,
                    }).map((_, i) => (
                      <SwiperSlide key={i}>
                        <main
                          className={`relative transition-all ease-in-out flex items-center justify-center flex-1 duration-300 w-full h-full`}
                        >
                          <div
                            className={`relative flex flex-col lg:flex-row w-full h-full`}
                          >
                            <section
                              className={`py-4 lg:py-0 lg:px-4 gap-2 w-full h-[calc(100vh-135px)] m-auto overflow-y-auto scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-blue-600 first-slide grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 1.5xl:grid-cols-2 `}
                            >
                              {i === 0 && role !== Role.BOT && (
                                <>
                                  <div
                                    className={`relative 
                            ${
                              isAudioOn
                                ? "p-[3px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"
                                : "bg-[#202020] bg-opacity-80"
                            }
                          rounded-lg flex min-w-[150px] min-h-[150px] overflow-hidden`}
                                  >
                                    <div className="bg-[#202020] flex flex-col rounded-md w-full h-full items-center justify-center">
                                      <div className="absolute left-4 top-4 text-3xl z-10">
                                        {reaction}
                                      </div>
                                      {metadata?.isHandRaised && (
                                        <span className="absolute top-4 right-4 text-4xl text-gray-200 font-medium z-10">
                                          ✋
                                        </span>
                                      )}
                                      {stream && (
                                        <span className="absolute top-0 bottom-0 right-0 left-0">
                                          <Camera
                                            stream={stream}
                                            name={
                                              metadata?.displayName ?? "guest"
                                            }
                                          />
                                        </span>
                                      )}

                                      {!stream && (
                                        <div className="flex w-24 h-24 rounded-full">
                                          {metadata?.avatarUrl && (
                                            <div className=" rounded-full w-24 h-24">
                                              <Image
                                                alt="image"
                                                src={metadata?.avatarUrl}
                                                className="maskAvatar object-cover object-center"
                                                width={100}
                                                height={100}
                                              />
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      <span className="absolute bottom-4 left-4 text-white font-medium">
                                        <div className="flex">
                                          {`${metadata?.displayName} (You)`}
                                          <Tooltip
                                            content={tooltipContent}
                                            placement="right"
                                            closeDelay={1}
                                            showArrow
                                          >
                                            <div
                                              className={`pl-2 pt-[2px] cursor-pointer  ${
                                                animatingButtons[
                                                  metadata?.walletAddress || ""
                                                ]
                                                  ? "text-blue-500"
                                                  : "text-[#3E3D3D]"
                                              }`}
                                            >
                                              <IoCopy
                                                onClick={() =>
                                                  handleAddrCopy(
                                                    `${metadata?.walletAddress}`
                                                  )
                                                }
                                              />
                                            </div>
                                          </Tooltip>
                                        </div>
                                      </span>
                                      <span className="absolute bottom-4 right-4">
                                        {isAudioOn
                                          ? NestedPeerListIcons.active.mic
                                          : NestedPeerListIcons.inactive.mic}
                                      </span>
                                    </div>
                                  </div>
                                </>
                              )}
                              {i === 0
                                ? peerIds
                                    .slice(0, 3)
                                    .map((peerId) => (
                                      <RemotePeer
                                        key={peerId}
                                        peerId={peerId}
                                      />
                                    ))
                                : peerIds
                                    .slice(3 + (i - 1) * 4, 3 + (i - 1) * 4 + 4)
                                    .map((peerId) => (
                                      <RemotePeer
                                        key={peerId}
                                        peerId={peerId}
                                      />
                                    ))}
                            </section>
                          </div>
                        </main>
                      </SwiperSlide>
                    ))}
                  </>
                )}
                {!(isFullScreen || isRemoteFullScreen) &&
                  peerIds.length > 2 &&
                  ((isSmallScreen && !isScreenShared) || !isSmallScreen) && (
                    <>
                      {Array.from({
                        length: Math.ceil((peerIds.length - 2) / 4),
                      }).map((_, i) => {
                        // Calculate the peers for this slide
                        const slidePeers = peerIds.slice(
                          3 + i * 4,
                          3 + i * 4 + 4
                        );

                        // Only render the slide if there are peers to show
                        return slidePeers.length > 0 ? (
                          <SwiperSlide key={i}>
                            <main
                              className={`relative transition-all ease-in-out flex items-center justify-center flex-1 duration-300 w-full h-full`}
                            >
                              <div
                                className={`relative flex flex-col lg:flex-row w-full h-full`}
                              >
                                <section
                                  className={`py-4 lg:py-0 lg:px-4 gap-2 w-full h-[calc(100vh-135px)] m-auto overflow-y-auto scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-blue-600 first-slide grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 1.5xl:grid-cols-2`}
                                >
                                  {slidePeers.map((peerId) => (
                                    <RemotePeer key={peerId} peerId={peerId} />
                                  ))}
                                </section>
                              </div>
                            </main>
                          </SwiperSlide>
                        ) : null;
                      })}
                    </>
                  )}
              </Swiper>
              {isChatOpen && <ChatBar />}
              {isParticipantsOpen && (
                <ParticipantsBar meetingCategory={meetingCategory} />
              )}
            </div>
            <BottomBar
              daoName={daoName}
              hostAddress={hostAddress}
              // meetingStatus={meetingRecordingStatus}
              // currentRecordingStatus={currentRecordingState}
              meetingData={meetingData}
              meetingCategory={meetingCategory}
            />
            <Prompts />
            <AudioController />
          </div>
        </div>
      ) : (
        <>
          {notAllowedMessage ? (
            <div className="flex justify-center items-center h-screen font-poppins">
              <div className="text-center">
                <div className="text-6xl mb-6">☹️</div>
                <div className="text-lg font-semibold mb-8">
                  Oops, {notAllowedMessage}
                </div>
                <Link
                  // onClick={() => push(`/profile/${address}?active=info`)}
                  href={`${APP_BASE_URL}/profile/${walletAddress}?active=info`}
                  className="px-6 py-3 bg-white text-blue-shade-200 rounded-full shadow-lg hover:bg-blue-shade-200 hover:text-white transition duration-300 ease-in-out"
                >
                  Back to Profile
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-center items-center h-screen bg-[#0a0a0a]">
                <div className="text-center">
                  <div className="flex items-center justify-center pt-10">
                    <RotatingLines
                      strokeColor="#0356fc"
                      strokeWidth="5"
                      animationDuration="0.75"
                      width="60"
                      visible={true}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {role !== null && walletAddress !== undefined && showFeedbackPopups && (
        <PopupSlider
          role={role}
          address={walletAddress ? walletAddress : ""}
          daoName={daoName}
          meetingId={params.roomId}
          onClose={handleFeedbackPopupsClose}
        />
      )}

      {role === "host" && isRecording !== true && (
        <MeetingRecordingModal
          show={showModal}
          onClose={handleMeetingModalClose}
        />
      )}

      {((role === "speaker" || role === "listener" || role === "coHost") &&
        modalOpen) ||
      (role === "host" && hostModalOpen) ? (
        <AttestationModal
          isOpen={role === "host" ? hostModalOpen : modalOpen}
          onClose={handleModalClose}
          hostAddress={hostAddress}
          meetingId={params.roomId}
          role={role}
        />
      ) : null}
    </>
  );
}
