import { APP_BASE_URL } from "@/config/constants";
import { fetchApi } from "./api";

// Types for meeting status updates
type MeetingCommonData = {
  callerAddress: string | undefined;
  daoName: string | undefined;
  sessionType: string | undefined;
  hostAddress: string | undefined;
  attendeeAddress: string | undefined;
  hostJoinedStatus: string | undefined;
  attendeeJoinedStatus: string | undefined;
  meetingData: any;
};

/**
 * Updates the meeting status with the provided data
 * @param params Meeting parameters including roomId
 * @param additionalData Common meeting data
 * @param address Wallet address of the caller
 */
export const updateMeetingStatus = async (
  params: { roomId: string },
  additionalData: MeetingCommonData,
  address: string | undefined,
  Privytoken: string | null
) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    if (address) {
      myHeaders.append("x-wallet-address", address);
      myHeaders.append("Authorization", `Bearer ${Privytoken}`);
    }

    const requestBody = {
      meetingId: params.roomId,
      meetingType: "session",
      additionalData: additionalData,
    };

    const response = await fetchApi(`/update-meeting-status/${params.roomId}`, {
      method: "PUT",
      headers: myHeaders,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating meeting status:", error);
    throw error;
  }
};

/**
 * Updates the attendee status for a meeting
 * @param meetingId The ID of the meeting
 * @param attendeeAddress The wallet address of the attendee
 */
export const updateAttendeeStatus = async (
  meetingId: string,
  attendeeAddress: string | undefined,
  Privytoken: string | null
) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    if (attendeeAddress) {
      myHeaders.append("x-wallet-address", attendeeAddress);
      myHeaders.append("Authorization", `Bearer ${Privytoken}`);
    }

    const requestBody = {
      meetingId: meetingId,
      attendee_address: attendeeAddress,
    };

    const response = await fetchApi("/update-session-attendees", {
      method: "PUT",
      headers: myHeaders,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    return data;
  } catch (error) {
    console.error("Error updating attendee status:", error);
    throw error;
  }
};

export const updateOfficeHoursData = async (
  userAddress: string,
  privyToken: string | null,
  requestBody: any
) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    if (userAddress) {
      myHeaders.append("x-wallet-address", userAddress);
      myHeaders.append("Authorization", `Bearer ${privyToken}`);
    }

    const response = await fetchApi(`/edit-office-hours`, {
      method: "PUT",
      headers: myHeaders,
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const data = await response.text();
      return data;
    }
  } catch (error) {
    console.error("Error updating office hours data:", error);
    throw error;
  }
};
