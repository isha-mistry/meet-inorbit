import { connectDB } from "@/config/connectDB";
import { Attendee, OfficeHoursProps } from "@/types/OfficeHoursTypes";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const updateData: OfficeHoursProps = await req.json();
    const { host_address, dao_name, reference_id, attendees, ...updateFields } =
      updateData;

    // Validate required fields
    if (!host_address || !dao_name || !reference_id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: host_address, dao_name, or reference_id",
        },
        { status: 400 }
      );
    }

    const client = await connectDB();
    const db = client.db();
    const collection = db.collection("office_hours");

    // First, get the existing document
    const existingDoc = await collection.findOne({
      host_address,
      "dao.name": dao_name,
      "dao.meetings.reference_id": reference_id,
    });

    if (!existingDoc) {
      await client.close();
      return NextResponse.json(
        {
          success: false,
          message: "Meeting not found",
        },
        { status: 404 }
      );
    }

    // Find the existing meeting data
    const existingDAO = existingDoc.dao.find(
      (dao: any) => dao.name === dao_name
    );
    const existingMeeting = existingDAO?.meetings.find(
      (meeting: any) => meeting.reference_id === reference_id
    );

    if (!existingMeeting) {
      await client.close();
      return NextResponse.json(
        {
          success: false,
          message: "Meeting not found in the specified DAO",
        },
        { status: 404 }
      );
    }

    // Build update object only with provided values
    const fieldsToUpdate: { [key: string]: any } = {};

    // Helper function to add field if it exists and is different
    const addFieldIfChanged = (
      fieldName: string,
      value: any,
      prefix = "dao.$[daoElem].meetings.$[meetingElem]."
    ) => {
      if (value !== undefined && value !== existingMeeting[fieldName]) {
        fieldsToUpdate[`${prefix}${fieldName}`] = value;
      }
    };

    // Handle regular meeting field updates
    addFieldIfChanged("title", updateFields.title?.trim());
    addFieldIfChanged("description", updateFields.description?.trim());
    addFieldIfChanged("startTime", updateFields.startTime);
    addFieldIfChanged("endTime", updateFields.endTime);
    addFieldIfChanged("meeting_status", updateFields.meeting_status);
    addFieldIfChanged("video_uri", updateFields.video_uri);
    addFieldIfChanged("thumbnail_image", updateFields.thumbnail_image);
    addFieldIfChanged("isMeetingRecorded", updateFields.isMeetingRecorded);
    addFieldIfChanged("host_uid", updateFields.uid_host);
    addFieldIfChanged("host_onchain_uid", updateFields.onchain_host_uid);
    addFieldIfChanged("nft_image", updateFields.nft_image);

    // Handle attendees update
    if (attendees) {
      // Convert single attendee object to array if necessary
      const attendeesArray = Array.isArray(attendees) ? attendees : [attendees];

      // Validate each attendee has required address
      const invalidAttendee = attendeesArray.find(
        (attendee) => !attendee.attendee_address
      );
      if (invalidAttendee) {
        await client.close();
        return NextResponse.json(
          {
            success: false,
            error: "Each attendee must have an address",
          },
          { status: 400 }
        );
      }

      // Get current attendees or initialize empty array
      let currentAttendees = existingMeeting.attendees || [];

      // Process attendees to maintain unique addresses and update UIDs
      attendeesArray.forEach((newAttendee) => {
        const existingIndex = currentAttendees.findIndex(
          (existing: Attendee) =>
            existing.attendee_address.toLowerCase() ===
            newAttendee.attendee_address.toLowerCase()
        );

        if (existingIndex === -1) {
          // Add new attendee with only address if no UIDs provided
          currentAttendees.push({
            attendee_address: newAttendee.attendee_address,
            ...(newAttendee.attendee_uid && { uid: newAttendee.attendee_uid }),
            ...(newAttendee.attendee_onchain_uid && {
              onchain_uid: newAttendee.attendee_onchain_uid,
            }),
          });
        } else if (
          newAttendee.attendee_uid ||
          newAttendee.attendee_onchain_uid
        ) {
          // Only update UIDs if provided, preserve existing address
          if (newAttendee.attendee_uid) {
            currentAttendees[existingIndex].uid = newAttendee.attendee_uid;
          }
          if (newAttendee.attendee_onchain_uid) {
            currentAttendees[existingIndex].onchain_uid =
              newAttendee.attendee_onchain_uid;
          }
        }
      });

      // Update attendees field
      fieldsToUpdate["dao.$[daoElem].meetings.$[meetingElem].attendees"] =
        currentAttendees;
    }

    // Only proceed with update if there are fields to update
    if (Object.keys(fieldsToUpdate).length === 0) {
      await client.close();
      return NextResponse.json(
        {
          success: true,
          message: "No valid fields to update",
          data: existingDoc,
        },
        { status: 200 }
      );
    }

    // Add updated_at timestamp
    fieldsToUpdate["updated_at"] = new Date();

    // Update document
    const result = await collection.updateOne(
      {
        host_address,
        "dao.name": dao_name,
        "dao.meetings.reference_id": reference_id,
      },
      { $set: fieldsToUpdate },
      {
        arrayFilters: [
          { "daoElem.name": dao_name },
          { "meetingElem.reference_id": reference_id },
        ],
      }
    );

    // Fetch updated document
    const updatedDocument = await collection.findOne({
      host_address,
      "dao.name": dao_name,
      "dao.meetings.reference_id": reference_id,
    });

    await client.close();

    return NextResponse.json(
      {
        success: true,
        data: updatedDocument,
        message: "Meeting updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating meeting:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        details: error,
      },
      { status: 500 }
    );
  }
}
