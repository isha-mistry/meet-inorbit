import { BASE_URL } from "@/config/constants";

interface Meeting {
  sessionId: string;
  startTime: number;
  endTime: number;
}

const MAX_RETRIES = 20; // Maximum number of polling attempts
const POLLING_INTERVAL = 60000; // Poll every minute

export async function pollMeetingTimes(
  roomId: string,
  apiKey: string,
  hostAddress: string,
  token: string
): Promise<void> {
  let retries = 0;

  const pollOnce = async (): Promise<boolean> => {
    try {
      const myHeadersForMeeting = new Headers();
      myHeadersForMeeting.append("x-api-key", apiKey);

      const requestOptionsForMeeting = {
        method: "GET",
        headers: myHeadersForMeeting,
      };

      // Fetch meeting data
      const response = await fetch(
        `https://api.huddle01.com/api/v2/sdk/rooms/session-details?roomId=${roomId}`,
        requestOptionsForMeeting
      );

      if (!response.ok) {
        throw new Error("Failed to fetch meeting data");
      }

      const meetingsData: { sessions: Meeting[] } = await response.json();
      const meetings: Meeting[] = meetingsData.sessions;

      const hasValidTimes = meetings.some(
        (meeting) => meeting.startTime && meeting.endTime
      );

      if (hasValidTimes) {
        // When valid times are found, trigger the main endpoint again

        const mainEndpointResponse = await fetch(
          `${BASE_URL}/api/proxy/end-call`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-wallet-address": hostAddress,
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              roomId,
              meetingType: 2,
              hostAddress: hostAddress,
            }),
          }
        );

        if (!mainEndpointResponse.ok) {
          throw new Error("Failed to process meeting data");
        }

        return true; // Successfully found times and triggered processing
      }

      return false; // No valid times found yet
    } catch (error) {
      console.error("Error in polling meeting times:", error);
      return false;
    }
  };

  const poll = async () => {
    const success = await pollOnce();

    if (success) {
      console.log(`Successfully found meeting times for roomId ${roomId}`);
      return;
    }

    retries++;

    if (retries < MAX_RETRIES) {
      console.log(`Polling attempt ${retries} for roomId ${roomId}`);
      setTimeout(poll, POLLING_INTERVAL);
    } else {
      console.log(`Max retries reached for roomId ${roomId}`);
    }
  };

  // Start polling
  await poll();
}
