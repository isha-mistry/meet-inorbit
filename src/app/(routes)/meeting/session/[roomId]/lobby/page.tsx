"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next-nprogress-bar";
import { Toaster, toast } from "react-hot-toast";
import { useHuddle01, useRoom, useLocalPeer } from "@huddle01/react/hooks";
import { useAccount } from "wagmi";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
// import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Role } from "@huddle01/server-sdk/auth";
import { Oval, TailSpin } from "react-loader-spinner";
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

const Lobby = ({ params }: { params: { roomId: string } }) => {
  // State Management
  const [isJoining, setIsJoining] = useState(false);
  const [meetingStatus, setMeetingStatus] = useState<string>();
  const [isAllowToEnter, setIsAllowToEnter] = useState(false);
  const [notAllowedMessage, setNotAllowedMessage] = useState<string>();
  const [profileDetails, setProfileDetails] = useState<any>();
  const [meetingData, setMeetingData] = useState<any>();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Meeting Details State
  const [hostAddress, setHostAddress] = useState<string>();
  const [daoName, setDaoName] = useState<string>();
  const [sessionType, setSessionType] = useState<string>();
  const [attendeeAddress, setAttendeeAddress] = useState<string>();
  const [hostJoinedStatus, setHostJoinedStatus] = useState<string>();
  const [attendeeJoinedStatus, setAttendeeJoinedStatus] = useState<string>();
  const [isApiCalling, setIsApiCalling] = useState<boolean>();

  // Hooks
  const { push } = useRouter();
  const { address, isDisconnected } = useAccount();
  // const { openConnectModal } = useConnectModal();
  const {login,authenticated}=usePrivy();
  const { data: session } = useSession();
  const { isConnected, isPageLoading, isSessionLoading, isReady } =
    useConnection();
  const { state, joinRoom } = useRoom();
  const { name, setName, avatarUrl, setAvatarUrl } = useStudioState();
  const {walletAddress}=useWalletAddress();

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

  useEffect(()=>{
    if(!authenticated){
      login()
    }
    console.log("Line 76:",walletAddress);
  },[authenticated,walletAddress])

  // Verify Meeting ID
  useEffect(() => {
    console.log(params.roomId);
    const verifyMeetingId = async () => {
      if (!params.roomId) return;
      setIsApiCalling(true);
      try {
        const myHeaders = new Headers();
        const token=await getAccessToken();
        // console.log("Line 88",token);
        myHeaders.append("Content-Type", "application/json");
        if (walletAddress) {
           myHeaders.append("x-wallet-address", walletAddress);
           myHeaders.append("Authorization",`Bearer ${token}`);
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

    if (authenticated &&  walletAddress!=null) {
      verifyMeetingId();
    }
  }, [params.roomId, walletAddress, authenticated]);

  // Fetch Profile Details
  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (!isAllowToEnter || !authenticated) return;

      try {
        setIsLoadingProfile(true);
        console.log(isAllowToEnter,walletAddress,isConnected);
        const token=await getAccessToken();
        const response = await fetchApi(`/profile/${walletAddress}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-wallet-address": walletAddress?walletAddress:'',
            "Authorization":`Bearer ${token}`
          },
          body: JSON.stringify({ walletAddress }),
        });

        console.log(response)

        const { data } = await response.json();
        console.log("171:",data);

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
          setName(ensName?.ensName || truncateAddress(walletAddress?walletAddress:''));
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
      const Privytoken=await getAccessToken();

      // Get room token
      const tokenResponse = await fetchApi("/new-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(walletAddress && { "x-wallet-address": walletAddress,"Authorization":`Bearer ${Privytoken}` }),
        },
        body: JSON.stringify({
          roomId: params.roomId,
          role,
          displayName: name,
          walletAddress,
        }),
      });

      const result = await tokenResponse.json();
      // console.log("token", result.token);
      const token = result.token;
      // Join room
      await joinRoom({
        roomId: params.roomId,
        token,
      });

      // Update meeting status
      if (Role.HOST) {
        const commonData = {
          callerAddress: walletAddress??'',
          daoName,
          sessionType,
          hostAddress,
          attendeeAddress,
          hostJoinedStatus,
          attendeeJoinedStatus,
          meetingData,
        };

        await updateMeetingStatus(params, commonData, walletAddress??'',Privytoken);
      }

      // Update attendee status if guest
      if (role === "guest") {
        await updateAttendeeStatus(params.roomId, walletAddress??'',Privytoken);
      }
    } catch (error) {
      console.error("Error starting spaces:", error);
      toast.error("Failed to join meeting");
    } finally {
      setIsJoining(false);
    }
  };

  // Render loading state
  if (isPageLoading || isSessionLoading || isApiCalling) {
    return (
      <div className="flex justify-center items-center h-screen">
        <TailSpin
          visible={true}
          height="80"
          width="80"
          color="#0500FF"
          ariaLabel="tail-spin-loading"
          radius="1"
        />
      </div>
    );
  }

  // Render not allowed message
  if (!isAllowToEnter && notAllowedMessage) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-6xl mb-6">☹️</div>
          <div className="text-lg font-semibold mb-8">
            Oops, {notAllowedMessage}
          </div>
          <Link
            href={`${APP_BASE_URL}/profile/${walletAddress}?active=info`}
            className="px-6 py-3 bg-white text-blue-shade-200 rounded-full shadow-lg hover:bg-blue-shade-200 hover:text-white transition duration-300"
          >
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  // Render main lobby
  return (
    <>
      {isAllowToEnter === true && (
        <div
          className={`h-screen bg-contain bg-center bg-no-repeat rounded-full ${
            daoName === "optimism"
              ? "bg-op-logo"
              : daoName === "arbitrum"
              ? "bg-arb-logo"
              : ""
          }`}
        >
          <main className="flex h-screen flex-col bg-lobby text-slate-100 font-poppins backdrop-blur-md">
            <div className="flex justify-between px-10 pt-4">
              <div className="text-4xl font-semibold font-quanty tracking-wide">
                <span className="text-black">Chora</span>
                <span className="text-blue-shade-100">Club</span>
              </div>
              <ConnectWalletWithENS />
            </div>

            <div className="flex w-full items-center justify-center my-auto">
              <div className="flex flex-col items-center justify-center gap-4 w-1/3 mt-14">
                {/* Avatar Section */}
                <div
                  className={`text-center flex items-center justify-center border border-white w-full rounded-2xl py-28 bg-opacity-40 ${
                    daoName === "optimism"
                      ? "bg-slate-100"
                      : daoName === "arbitrum"
                      ? "bg-slate-400"
                      : ""
                  }`}
                >
                  <div className="relative border-2 border-gray-600 rounded-full p-1">
                    <Image
                      src={avatarUrl}
                      alt="profile-avatar"
                      width={125}
                      height={125}
                      className="maskAvatar shadow-md"
                      quality={100}
                      priority
                    />
                  </div>
                </div>

                {/* Name/Address Section */}
                <div className="flex items-center w-full flex-col">
                  <div
                    className={`flex flex-col justify-center w-full gap-1 ${
                      daoName === "optimism"
                        ? "text-[#e7e7e7]"
                        : daoName === "arbitrum"
                        ? "text-[#4f4f4f]"
                        : ""
                    } font-semibold`}
                  >
                    ENS Name / Address
                    <div
                      className={`flex w-full items-center rounded-[10px] ${
                        daoName === "optimism"
                          ? "bg-slate-100"
                          : daoName === "arbitrum"
                          ? "bg-slate-400"
                          : ""
                      } bg-opacity-40 border px-3 text-slate-300 outline-none border-white backdrop-blur-[400px]`}
                    >
                      <div className="mr-2">
                        <Image
                          alt="user-icon"
                          src="/images/user-icon.svg"
                          className="w-5 h-5"
                          width={30}
                          height={30}
                        />
                      </div>
                      <div className="flex-1 bg-transparent py-3 outline-none text-[#f0f0f0]">
                        {isLoadingProfile ? (
                          <div className="flex items-center justify-center">
                            <Oval
                              visible={true}
                              height="20"
                              width="20"
                              color="#0500FF"
                              secondaryColor="#cdccff"
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
                <div className="flex items-center w-1/2">
                  <button
                    className={`flex items-center justify-center w-full py-4 px-6 mt-4
                  text-white font-bold text-lg rounded-full transition-all duration-300
                  ${
                    isLoadingProfile
                      ? "bg-gray-400"
                      : "bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500"
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
                      {isJoining ? "Joining Spaces..." : "Start Meeting"}
                    </span>
                    {!isJoining && (
                      <Image
                        alt="arrow-right"
                        width={24}
                        height={24}
                        src={arrow}
                        className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1"
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
};

export default Lobby;
