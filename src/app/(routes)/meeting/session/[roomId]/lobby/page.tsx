"use client";

import Image from "next/image";
import React, { useEffect, useState, useRef } from "react"; // Import useRef
import { useRouter } from "next-nprogress-bar";
import { Toaster, toast } from "react-hot-toast";
import { useHuddle01, useRoom, useLocalPeer } from "@huddle01/react/hooks";
import { useAccount } from "wagmi";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
// import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Role } from "@huddle01/server-sdk/auth";
import { Oval, RotatingLines } from "react-loader-spinner";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useConnection } from "@/app/hooks/useConnection";
import { fetchApi } from "@/utils/api";
import ConnectWalletWithENS from "@/components/ConnectWallet/ConnectWalletWithENS";
import { fetchEnsName } from "@/utils/ENSUtils";
import { useStudioState } from "@/store/studioState";
import arrow from "@/assets/images/instant-meet/arrow.svg";
import { truncateAddress } from "@/utils/text";
import {
  updateAttendeeStatus,
  updateMeetingStatus,
} from "@/utils/LobbyApiActions";
import { APP_BASE_URL } from "@/config/constants";
import { XMarkIcon } from "@heroicons/react/24/outline"; // Import close icon

const Lobby = ({ params }: { params: { roomId: string } }) => {
  // State Management
  const [isJoining, setIsJoining] = useState(false);
  const [meetingStatus, setMeetingStatus] = useState<string>();
  const [isAllowToEnter, setIsAllowToEnter] = useState(false);
  const [notAllowedMessage, setNotAllowedMessage] = useState<string>();
  const [profileDetails, setProfileDetails] = useState<any>();
  const [meetingData, setMeetingData] = useState<any>();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showConfirmWallet, setShowConfirmWallet] = useState(true); // New state

  // Meeting Details State
  const [hostAddress, setHostAddress] = useState<string>();
  const [daoName, setDaoName] = useState<string>();
  const [sessionType, setSessionType] = useState<string>();
  const [attendeeAddress, setAttendeeAddress] = useState<string>();
  const [hostJoinedStatus, setHostJoinedStatus] = useState<string>();
  const [attendeeJoinedStatus, setAttendeeJoinedStatus] = useState<string>();
  const [isApiCalling, setIsApiCalling] = useState<boolean>();
  const [isHost, setIsHost] = useState<boolean>();
  const [buttonText, setButtonText] = useState<string>("Join Meeting");
  const { walletAddress } = useWalletAddress();

  // Update ButtonText when walletAddress Changes
  useEffect(() => {
    if (walletAddress && meetingData) {
      if (walletAddress === meetingData.host_address) {
        setIsHost(true);
        setButtonText("Start Meeting");
      } else {
        setIsHost(false);
        setButtonText("Join Meeting");
      }
    }
  }, [walletAddress, meetingData]);

  // Hooks
  const { push } = useRouter();
  const { address, isDisconnected } = useAccount();
  // const { openConnectModal } = useConnectModal();
  const { login, authenticated } = usePrivy();
  const { data: session } = useSession();
  const { isConnected, isPageLoading, isSessionLoading, isReady } =
    useConnection();
  const { state, joinRoom } = useRoom();
  const { name, setName, avatarUrl, setAvatarUrl } = useStudioState();

  const popupRef = useRef<HTMLDivElement>(null); // Ref for the popup

  // Connection Management
  // useEffect(() => {
  //   if (
  //     !isConnected &&
  //     openConnectModal &&
  //     !isPageLoading &&
  //     !isSessionLoading
  //   ) {
  //     openConnectModal();
  //   }
  // }, [isConnected, isPageLoading, isSessionLoading]);

  useEffect(() => {
    if (!walletAddress) {
      login();
    }
  }, [authenticated, walletAddress]);

  // Verify Meeting ID
  useEffect(() => {
    const verifyMeetingId = async () => {
      if (!params.roomId) return;
      setIsApiCalling(true);
      try {
        const myHeaders = new Headers();
        const token = await getAccessToken();
        myHeaders.append("Content-Type", "application/json");
        if (walletAddress) {
          myHeaders.append("x-wallet-address", walletAddress);
          myHeaders.append("Authorization", `Bearer ${token}`);
        }

        const response = await fetchApi("/verify-meeting-id", {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify({
            roomId: params.roomId,
            meetingType: "session",
          }),
        });

        const result = await response.json();

        if (result.success) {
          const { data } = result;
          if (walletAddress === data.host_address) {
            setIsHost(true);
            setButtonText("Start Meeting");
          } else {
            setIsHost(false);
            setButtonText("Join Meeting");
          }
          setMeetingData(data);
          setHostAddress(data.host_address);
          setDaoName(data.dao_name);
          setSessionType(data.session_type);
          setHostJoinedStatus(data.host_joined_status);
          setIsApiCalling(false);
          if (data.session_type === "session") {
            setAttendeeAddress(data.attendees[0]?.attendee_address);
            setAttendeeJoinedStatus(data.attendees[0]?.attendee_joined_status);
          }

          // Handle meeting status
          if (result.message === "Meeting has ended") {
            setIsAllowToEnter(false);
            setNotAllowedMessage(result.message);
          } else if (result.message === "Meeting is upcoming") {
            setMeetingStatus("Upcoming");
            setIsAllowToEnter(true);
          } else if (result.message === "Meeting has been denied") {
            setIsAllowToEnter(false);
            setNotAllowedMessage(result.message);
          } else if (result.message === "Meeting does not exist") {
            setIsAllowToEnter(false);
            setNotAllowedMessage(result.message);
          } else if (result.message === "Meeting is ongoing") {
            setMeetingStatus("Ongoing");
            setIsAllowToEnter(true);
          }
        } else {
          setNotAllowedMessage(result.error || result.message);
          setIsApiCalling(false);
        }
      } catch (error) {
        console.error("Error verifying meeting:", error);
        setNotAllowedMessage("Failed to verify meeting");
        setIsApiCalling(false);
      }
    };

    if (authenticated && walletAddress != null) {
      verifyMeetingId();
    }
  }, [params.roomId, walletAddress, authenticated]);

  // Fetch Profile Details
  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (!isAllowToEnter || !authenticated) return;

      try {
        setIsLoadingProfile(true);
        const token = await getAccessToken();
        const response = await fetchApi(`/profile/${walletAddress}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-wallet-address": walletAddress ? walletAddress : "",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ walletAddress }),
        });

        const { data } = await response.json();

        if (Array.isArray(data)) {
          const profileWithName = data.find(
            (profile) => profile.displayName !== ""
          );
          if (profileWithName) {
            setProfileDetails(profileWithName);
            if (profileWithName.image) {
              setAvatarUrl(
                `https://gateway.lighthouse.storage/ipfs/${profileWithName.image}`
              );
            }
          }

          // Set name from ENS or truncated address
          const ensName = await fetchEnsName(walletAddress);
          setName(
            ensName?.ensName ||
              truncateAddress(walletAddress ? walletAddress : "")
          );
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile details");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileDetails();
  }, [walletAddress, authenticated, isAllowToEnter]);

  // Handle Room State Change
  useEffect(() => {
    if (state === "connected") {
      push(`/meeting/session/${params.roomId}`);
    }
  }, [state, params.roomId, push]);

  const handleStartSpaces = async () => {
    if (!authenticated) {
      return toast("Connect your wallet to join the meeting!");
    }

    try {
      setIsJoining(true);
      const role = walletAddress === hostAddress ? "host" : "guest";
      const privyToken = await getAccessToken();

      // Get room token
      const tokenResponse = await fetchApi("/new-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(walletAddress && {
            "x-wallet-address": walletAddress,
            Authorization: `Bearer ${privyToken}`,
          }),
        },
        body: JSON.stringify({
          roomId: params.roomId,
          role,
          displayName: name,
          address: walletAddress,
          meetingType: "session",
        }),
      });

      const result = await tokenResponse.json();
      const token = result.token;
      // Join room
      await joinRoom({
        roomId: params.roomId,
        token,
      });

      // Update meeting status
      if (Role.HOST) {
        const commonData = {
          callerAddress: walletAddress ?? "",
          daoName,
          sessionType,
          hostAddress,
          attendeeAddress,
          hostJoinedStatus,
          attendeeJoinedStatus,
          meetingData,
        };

        await updateMeetingStatus(
          params,
          commonData,
          walletAddress ?? "",
          privyToken
        );
      }

      // Update attendee status if guest
      if (role === "guest") {
        await updateAttendeeStatus(
          params.roomId,
          walletAddress ?? "",
          privyToken
        );
      }
    } catch (error) {
      console.error("Error starting spaces:", error);
      // toast.error("Failed to join meeting");
    } finally {
      setIsJoining(false);
    }
  };

  const handleCloseConfirmWallet = () => {
    setShowConfirmWallet(false);
  };

  const handleContinue = () => {
    setShowConfirmWallet(false);
  };

  // Render loading state
  if (isPageLoading || isSessionLoading || isApiCalling) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0a0a0a]">
        <RotatingLines
          strokeColor="#0356fc"
          strokeWidth="5"
          animationDuration="0.75"
          width="60"
          visible={true}
        />
      </div>
    );
  }

  // Render not allowed message
  if (!isAllowToEnter && notAllowedMessage) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0a0a0a] text-white">
        <div className="text-center">
          <div className="text-6xl mb-6">☹️</div>
          <div className="text-lg font-semibold mb-8">
            Oops, {notAllowedMessage}
          </div>
          <Link
            href={`${APP_BASE_URL}/profile/${walletAddress}?active=info`}
            className="px-6 py-3 bg-[#2f2f2f] text-white rounded-full shadow-lg hover:bg-[#202020] transition duration-300"
          >
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  // Render the component
  return (
    <div className="min-h-screen bg-[#0a0a0a] relative">
      {showConfirmWallet && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-40">
          {" "}
          {/* Semi-transparent overlay */}
          <div className="relative bg-[#1a1a1a] border border-[#333] p-8 rounded-xl shadow-lg w-full max-w-md text-white flex items-center flex-col">
            {" "}
            {/* Darker background, subtle border */}
            <button
              onClick={handleCloseConfirmWallet}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-center text-blue-300">
              Confirm Your Wallet
            </h2>{" "}
            {/* More prominent title */}
            <p className="mb-4 text-gray-400 text-center">
              You're currently connected with:
            </p>{" "}
            {/* Subdued description */}
            <ConnectWalletWithENS showPopup={true} />
            <p className="text-red-500 text-center mt-4 font-semibold">
              If this is not the wallet address you used to host or wish to join
              with, please switch to a different wallet.
            </p>{" "}
            {/* Improved warning text */}
            <button
              onClick={handleContinue}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full mt-6 hover:from-blue-500 hover:to-blue-300 transition duration-300"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <main
        className="flex min-h-screen flex-col text-white font-poppins"
        style={{
          filter: showConfirmWallet ? "blur(5px)" : "none", // Apply blur if popup is visible
          pointerEvents: showConfirmWallet ? "none" : "auto", // Disable interactions if popup is visible
        }}
      >
        <div className="flex justify-between px-4 md:px-6 lg:px-16 pt-4">
          <div className="text-4xl font-semibold font-quanty tracking-wide">
            <span className="text-white">Chora</span>
            <span className="text-blue-shade-100">Club</span>
          </div>
          <ConnectWalletWithENS />
        </div>

        <div className="flex w-full items-center justify-center my-auto px-4">
          <div className="flex flex-col items-center justify-center gap-4 w-full xs:w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 mt-8 lg:mt-14">
            {/* Avatar Section */}
            <div className="relative w-full rounded-2xl py-16 sm:py-20 lg:py-28 overflow-hidden">
              {/* Background blur layer */}
              <div className="absolute inset-0 bg-[#202020] opacity-50 blur-lg z-0"></div>

              {/* Avatar container */}
              <div className="relative z-10 flex items-center justify-center ">
                <div className="relative rounded-full p-1">
                  <Image
                    src={avatarUrl}
                    alt="profile-avatar"
                    width={100}
                    height={100}
                    className="maskAvatar shadow-md w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full"
                    quality={100}
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Name/Address Section */}
            <div className="flex items-center w-full flex-col">
              <div
                className={`flex flex-col justify-center w-full gap-1 text-white font-semibold`}
              >
                ENS Name / Address
                <div
                  className={`flex w-full items-center rounded-[10px]  border border-[#2f2f2f] bg-[#202020] px-3 text-gray-300 outline-none backdrop-blur-[400px]`}
                >
                  {/* <div
                    className="absolute inset-0 bg-[#202020] opacity-50 blur-lg z-0"
                  ></div> */}
                  <div className="mr-2">
                    <Image
                      alt="user-icon"
                      src="/images/user-icon.svg"
                      className="size-4 sm:size-5"
                      width={30}
                      height={30}
                    />
                  </div>
                  <div className="flex-1 bg-transparent py-2 sm:py-3 outline-none text-gray-500 text-sm sm:text-base">
                    {isLoadingProfile ? (
                      <div className="flex items-center justify-center">
                        <Oval
                          visible={true}
                          height="20"
                          width="20"
                          color="#4f4f4f"
                          secondaryColor="#2f2f2f"
                        />
                      </div>
                    ) : (
                      name
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="flex items-center w-full sm:w-2/3 lg:w-1/2 px-4 sm:px-0">
              <button
                className={`flex items-center justify-center w-full py-3 sm:py-4 px-4 sm:px-6 mt-4 text-white font-bold text-lg rounded-full transition-all duration-300
                  ${
                    isLoadingProfile
                      ? "bg-gray-700"
                      : "bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700"
                  }
                  ${
                    isLoadingProfile || isJoining
                      ? "cursor-not-allowed"
                      : "cursor-pointer"
                  }
                  transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                onClick={handleStartSpaces}
                disabled={isLoadingProfile || isJoining}
              >
                <span className="mr-2">
                  {isJoining ? "Joining Spaces..." : buttonText}
                </span>
                {!isJoining && (
                  <Image
                    alt="arrow-right"
                    width={24}
                    height={24}
                    src={arrow}
                    className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:translate-x-1"
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lobby;
