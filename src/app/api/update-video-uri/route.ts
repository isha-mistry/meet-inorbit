import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/config/connectDB";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextApiResponse) {
  const { meetingId, video_uri } = await req.json();

  try {
    const client = await connectDB();
    const db = client.db();

    const officeHoursCollection = db.collection("office_hours");
    const officeHoursMeeting = await officeHoursCollection.findOneAndUpdate(
      { meetingId },
      { $set: { video_uri, meeting_status: "inactive" } }
    );

    const meetingsCollection = db.collection("sessions");
    const sessionMeeting = await meetingsCollection.findOneAndUpdate(
      { meetingId },
      {
        $set: {
          video_uri,
        },
      }
    );

    if (!officeHoursMeeting && !sessionMeeting) {
      return NextResponse.json(
        { message: "Meeting not found with the given meetingId" },
        { status: 404 }
      );
    }
    await client.close();
    return NextResponse.json(
      { message: "Video URI updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating video URI:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
