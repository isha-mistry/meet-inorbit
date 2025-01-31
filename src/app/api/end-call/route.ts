import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";
import { pollMeetingTimes } from "./polling-service";

interface Meeting {
  meetingId: string;
  startTime: number;
  endTime: number;
}

interface ParticipantMetadata {
  displayName: string;
  avatarUrl: string;
  isHandRaised: boolean;
  walletAddress: string;
}

interface Participant {
  peerId: string;
  joinTime: number;
  exitTime: number;
  metadata: ParticipantMetadata;
}

interface ParticipantWithAttestation extends Participant {
  attestation: string;
}

interface MeetingTimePerEOA {
  [key: string]: number;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const {
      roomId,
      meetingType,
      dao_name,
      hostAddress,
    }: {
      roomId: string;
      meetingType: number;
      dao_name: string;
      hostAddress: string;
    } = await req.json();

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: "roomId parameter is required" },
        { status: 400 }
      );
    }

    let meetingTypeName: string;
    let initialDelay = 0;

    if (meetingType === 1) {
      meetingTypeName = "session";
    } else if (meetingType === 2) {
      meetingTypeName = "officehours";
      initialDelay = 15 * 1000;
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid meetingType" },
        { status: 400 }
      );
    }

    if (initialDelay > 0) {
      await delay(initialDelay);
    }

    const myHeadersForMeeting = new Headers();
    myHeadersForMeeting.append(
      "x-api-key",
      process.env.NEXT_PUBLIC_API_KEY ?? ""
    );

    const requestOptionsForMeeting = {
      method: "GET",
      headers: myHeadersForMeeting,
    };

    const response = await fetch(
      `https://api.huddle01.com/api/v1/rooms/meetings?roomId=${roomId}`,
      requestOptionsForMeeting
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const meetingsData: { meetings: Meeting[] } = await response.json();
    const meetings: Meeting[] = meetingsData.meetings;

    const hasValidTimes = meetings.some(
      (meeting) => meeting.startTime && meeting.endTime
    );

    let totalMeetingTimeInMinutes = 0;
    let earliestStartTime = Infinity;
    let latestEndTime = -Infinity;

    if (hasValidTimes) {
      for (const meeting of meetings) {
        const startTime = new Date(meeting.startTime);
        const endTime = new Date(meeting.endTime);
        const durationInMinutes = Math.floor(
          (endTime.valueOf() - startTime.valueOf()) / (1000 * 60)
        );
        totalMeetingTimeInMinutes += durationInMinutes;

        earliestStartTime = Math.min(earliestStartTime, meeting.startTime);
        latestEndTime = Math.max(latestEndTime, meeting.endTime);
      }
    } else {
      earliestStartTime = Date.now();
      latestEndTime = Date.now();
    }

    const combinedParticipantLists: Participant[][] = [];
    const meetingTimePerEOA: MeetingTimePerEOA = {};

    for (const meeting of meetings) {
      const response = await fetch(
        `https://api.huddle01.com/api/v1/rooms/participant-list?meetingId=${meeting.meetingId}`,
        requestOptionsForMeeting
      );
      if (!response.ok) {
        throw new Error("Failed to fetch participant list");
      }

      const participantList: { participants: Participant[] } =
        await response.json();
      combinedParticipantLists.push(participantList.participants);

      participantList.participants.forEach((participant) => {
        const eoaAddress: string = participant?.metadata?.walletAddress;
        const joinedAt: Date = new Date(participant.joinTime);
        const exitedAt: Date = new Date(participant.exitTime);
        const durationInMinutes: number = Math.floor(
          (exitedAt.valueOf() - joinedAt.valueOf()) / (1000 * 60)
        );

        if (!meetingTimePerEOA[eoaAddress]) {
          meetingTimePerEOA[eoaAddress] = 0;
        }
        meetingTimePerEOA[eoaAddress] += durationInMinutes;
      });
    }

    const minimumAttendanceTime = totalMeetingTimeInMinutes * 0.5;

    const validParticipants: Participant[] = [];
    for (const participantList of combinedParticipantLists) {
      for (const participant of participantList) {
        if (participant?.metadata?.displayName !== "No name") {
          validParticipants.push(participant);
        }
      }
    }

    let participantsWithSufficientAttendance: ParticipantWithAttestation[] = [];
    for (const participant of validParticipants) {
      const participantMeetingTime =
        meetingTimePerEOA[participant?.metadata?.walletAddress] || 0;
      if (participantMeetingTime >= minimumAttendanceTime) {
        participantsWithSufficientAttendance.push({
          ...participant,
          attestation: "pending",
        });
      }
    }

    participantsWithSufficientAttendance =
      participantsWithSufficientAttendance.filter(
        (participant) =>
          participant?.metadata?.walletAddress &&
          participant?.metadata?.walletAddress.toLowerCase() !==
            hostAddress.toLowerCase()
      );

    const hosts: ParticipantWithAttestation[] = [];
    if (
      hostAddress &&
      combinedParticipantLists
        .flat()
        .some(
          (participant) =>
            participant?.metadata?.walletAddress &&
            participant?.metadata?.walletAddress.toLowerCase() ===
              hostAddress.toLowerCase()
        )
    ) {
      combinedParticipantLists.flat().forEach((participant) => {
        if (
          participant?.metadata?.walletAddress &&
          participant?.metadata?.walletAddress.toLowerCase() ===
            hostAddress.toLowerCase()
        ) {
          hosts.push({ ...participant, attestation: "pending" });
        }
      });
    }

    const client = await connectDB();
    const db = client.db();
    const collection = db.collection("attestation");

    const existingData = await collection.findOne({ roomId });

    const earliestStartTimeEpoch = hasValidTimes
      ? Math.floor(earliestStartTime / 1000)
      : 0;
    const latestEndTimeEpoch = hasValidTimes
      ? Math.floor(latestEndTime / 1000)
      : 0;

    const dataToStore = {
      roomId,
      participants: participantsWithSufficientAttendance,
      meetingTimePerEOA,
      totalMeetingTimeInMinutes,
      hosts,
      startTime: earliestStartTimeEpoch,
      endTime: latestEndTimeEpoch,
      meetingType: meetingTypeName,
      attestation: "pending",
      dao_name: dao_name,
      timeUpdateStatus: hasValidTimes ? "complete" : "pending",
    };

    if (existingData) {
      if (
        !existingData.startTime ||
        existingData.startTime === 0 ||
        hasValidTimes
      ) {
        await collection.updateOne({ roomId }, { $set: dataToStore });
        console.log(`Data with roomId ${roomId} updated.`);
      }
    } else {
      await collection.insertOne(dataToStore);
      console.log(`New data with roomId ${roomId} inserted.`);
    }

    await client.close();

    // Start polling for office hours meetings if times are not available
    if (meetingType === 2 && !hasValidTimes) {
      console.log(`Starting polling for office hours meeting: ${roomId}`);
      pollMeetingTimes(roomId, process.env.NEXT_PUBLIC_API_KEY ?? "").catch(
        (error) => console.error("Error initiating polling:", error)
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: participantsWithSufficientAttendance,
        meetingTimePerEOA,
        totalMeetingTimeInMinutes,
        hosts,
        startTime: earliestStartTimeEpoch,
        endTime: latestEndTimeEpoch,
        meetingType: meetingTypeName,
        dao_name: dao_name,
        timeUpdateStatus: hasValidTimes ? "complete" : "pending",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving data in end call:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
