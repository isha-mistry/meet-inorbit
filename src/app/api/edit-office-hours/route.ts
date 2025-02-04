import { connectDB } from "@/config/connectDB";
import { Attendee, OfficeHoursProps } from "@/types/OfficeHoursTypes";
import { cacheWrapper } from "@/utils/cacheWrapper";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const updateData: OfficeHoursProps = await req.json();
    const { host_address, dao_name, reference_id, attendees, ...updateFields } =
      updateData;

    if (cacheWrapper.isAvailable) {
      const cacheKey = `office-hours-all`;
      await cacheWrapper.delete(cacheKey);
    }

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
    const delegatesCollection = db.collection("delegates");

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

    const fieldsToUpdate: { [key: string]: any } = {};

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
    addFieldIfChanged("onchain_host_uid", updateFields.onchain_host_uid);
    addFieldIfChanged("nft_image", updateFields.nft_image);
    addFieldIfChanged(
      "deployedContractAddress",
      updateFields.deployedContractAddress
    );

    // Handle onchain_host_uid update
    if (
      updateFields.onchain_host_uid &&
      updateFields.onchain_host_uid !== existingMeeting.onchain_host_uid
    ) {
      addFieldIfChanged("onchain_host_uid", updateFields.onchain_host_uid);

      await delegatesCollection.findOneAndUpdate(
        { address: host_address },
        {
          $inc: {
            [`meetingRecords.${dao_name}.officeHoursHosted.onchainCounts`]: 1,
          },
        }
      );

      if(cacheWrapper.isAvailable){
        const cacheKey = `profile:${host_address}`;
        await cacheWrapper.delete(cacheKey);
      }

    }

    // Handle meeting status update and counts
    if (
      updateFields.meeting_status &&
      updateFields.meeting_status !== existingMeeting.meeting_status
    ) {
      addFieldIfChanged("meeting_status", updateFields.meeting_status);

      const isCompletedStatus = ["Recorded", "Finished"].includes(
        updateFields.meeting_status
      );
      const wasNotCompletedStatus = !["Recorded", "Finished"].includes(
        existingMeeting.meeting_status
      );

      // Only update counts if transitioning from non-completed to completed status
      if (isCompletedStatus && wasNotCompletedStatus) {
        // Update host's counts
        await delegatesCollection.findOneAndUpdate(
          { address: host_address },
          {
            $inc: {
              [`meetingRecords.${dao_name}.officeHoursHosted.totalHostedOfficeHours`]: 1,
            },
          },
          { upsert: true }
        );

        if(cacheWrapper.isAvailable){
          const cacheKey = `profile:${host_address}`;
          await cacheWrapper.delete(cacheKey);
        }
  

        // Update attendees' counts
        if (existingMeeting.attendees && existingMeeting.attendees.length > 0) {
          const updatePromises = existingMeeting.attendees.map(
            (attendee: Attendee) =>
              delegatesCollection.findOneAndUpdate(
                { address: attendee.attendee_address },
                {
                  $inc: {
                    [`meetingRecords.${dao_name}.officeHoursAttended.totalAttendedOfficeHours`]: 1,
                  },
                },
                { upsert: true }
              )
          );

          if (cacheWrapper.isAvailable) {
            const cacheKeys = existingMeeting.attendees.map(
              (attendee:Attendee) => `profile:${attendee.attendee_address}`
            );
            
            await Promise.all(cacheKeys.map((key:string) => cacheWrapper.delete(key)));
          } 

          await Promise.all(updatePromises);
        }
      }
    }

    // Handle attendees update
    if (attendees) {
      const attendeesArray = Array.isArray(attendees) ? attendees : [attendees];

      if (attendeesArray.find((attendee) => !attendee.attendee_address)) {
        await client.close();
        return NextResponse.json(
          {
            success: false,
            error: "Each attendee must have an address",
          },
          { status: 400 }
        );
      }

      let currentAttendees = existingMeeting.attendees || [];
      const newOnchainUids = new Set();

      // Process attendees
      attendeesArray.forEach((newAttendee) => {
        const existingIndex = currentAttendees.findIndex(
          (existing: Attendee) =>
            existing.attendee_address.toLowerCase() ===
            newAttendee.attendee_address.toLowerCase()
        );

        if (existingIndex === -1) {
          // Add new attendee
          currentAttendees.push({
            attendee_address: newAttendee.attendee_address,
            ...(newAttendee.attendee_uid && { uid: newAttendee.attendee_uid }),
            ...(newAttendee.attendee_onchain_uid && {
              onchain_uid: newAttendee.attendee_onchain_uid,
            }),
          });

          if (newAttendee.attendee_onchain_uid) {
            newOnchainUids.add(newAttendee.attendee_address);
          }

          // Update totalAttendedOfficeHours for new attendee if meeting is completed
          if (
            ["Recorded", "Finished"].includes(existingMeeting.meeting_status)
          ) {
            delegatesCollection.findOneAndUpdate(
              { address: newAttendee.attendee_address },
              {
                $inc: {
                  [`meetingRecords.${dao_name}.officeHoursAttended.totalAttendedOfficeHours`]: 1,
                },
              },
              { upsert: true }
            );
          }
        } else if (
          newAttendee.attendee_uid ||
          newAttendee.attendee_onchain_uid
        ) {
          // Update existing attendee
          if (newAttendee.attendee_uid) {
            currentAttendees[existingIndex].uid = newAttendee.attendee_uid;
          }
          if (
            newAttendee.attendee_onchain_uid &&
            !currentAttendees[existingIndex].onchain_uid
          ) {
            currentAttendees[existingIndex].onchain_uid =
              newAttendee.attendee_onchain_uid;
            newOnchainUids.add(newAttendee.attendee_address);
          }
        }
      });

      // Update onchain counts for attendees
      for (const attendeeAddress of newOnchainUids) {
        await delegatesCollection.findOneAndUpdate(
          { address: attendeeAddress },
          {
            $inc: {
              [`meetingRecords.${dao_name}.officeHoursAttended.onchainCounts`]: 1,
            },
          },
          { upsert: true }
        );
      }

      fieldsToUpdate["dao.$[daoElem].meetings.$[meetingElem].attendees"] =
        currentAttendees;
    }

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

    fieldsToUpdate["updated_at"] = new Date();

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
