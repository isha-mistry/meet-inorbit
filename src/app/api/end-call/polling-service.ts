import { connectDB } from "@/config/connectDB";

interface Meeting {
  meetingId: string;
  startTime: number;
  endTime: number;
}


export async function pollMeetingTimes(
  roomId: string,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  const maxAttempts = 5;
  const delayBetweenAttempts = 30000; // 30 seconds

  const fetchMeetingData = async (): Promise<Meeting[]> => {
    const myHeaders = new Headers();
    myHeaders.append("x-api-key", apiKey);

    const response = await fetch(
      `https://api.huddle01.com/api/v1/rooms/meetings?roomId=${roomId}`,
      {
        method: "GET",
        headers: myHeaders,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch meeting data");
    }

    const data = await response.json();
    return data.meetings;
  };

  try {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      console.log(`Polling attempt ${attempt + 1} for roomId: ${roomId}`);

      const meetings = await fetchMeetingData();
      const validMeeting = meetings.find(
        (meeting) => meeting.startTime && meeting.endTime
      );

      if (validMeeting) {
        const client = await connectDB();
        const db = client.db();

        await db.collection("attestation").updateOne(
          { roomId },
          {
            $set: {
              startTime: Math.floor(validMeeting.startTime / 1000),
              endTime: Math.floor(validMeeting.endTime / 1000),
              timeUpdateStatus: "complete",
            },
          }
        );

        await client.close();
        console.log(`Successfully updated meeting times for roomId: ${roomId}`);
        return { success: true };
      }

      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenAttempts)
        );
      }
    }

    console.log(
      `Failed to get valid meeting times after ${maxAttempts} attempts for roomId: ${roomId}`
    );
    return {
      success: false,
      error: "Max polling attempts reached without valid times",
    };
  } catch (error) {
    console.error(`Error in pollMeetingTimes for roomId ${roomId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
