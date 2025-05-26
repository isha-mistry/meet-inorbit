import { connectDB } from "@/config/connectDB";
import { NextRequest, NextResponse } from "next/server";

// Define the type for an individual attendee
type Attendee = {
  attendee_address: string;
  attendee_uid?: string; // Making attendee_uid optional
};

// Define the request body type for adding attendees
interface AddAttendeeRequestBody {
  meetingId: string;
  attendee_address: string; // Array of attendees
}

export async function PUT(req: NextRequest, res: NextResponse) {
  const { meetingId, attendee_address }: AddAttendeeRequestBody =
    await req.json();

  try {
    const client = await connectDB();

    const db = client.db();
    const collection = db.collection("sessions");

    const existingDocument = await collection.findOne({
      meetingId: meetingId,
    });

    if (!existingDocument) {
      client.close();
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    const attendeeExists = existingDocument.attendees.some(
      (existingAttendee: any) =>
        existingAttendee.attendee_address === attendee_address
    );

    if (attendeeExists) {
      client.close();
      return NextResponse.json(
        { success: true, data: existingDocument },
        { status: 200 }
      );
    }

    const updatedDocument = await collection.updateOne(
      { meetingId },
      {
        /* @ts-ignore */
        $push: {
          attendees: {
            attendee_address,
          },
        },
      }
    );

    client.close();

    if (updatedDocument.modifiedCount !== 1) {
      return NextResponse.json(
        { success: false, error: "Failed to update document" },
        { status: 500 }
      );
    }

    const updatedDocumentData = await collection.findOne({ meetingId });

    return NextResponse.json(
      { success: true, data: updatedDocumentData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating office hours:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
