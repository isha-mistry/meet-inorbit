import { connectDB } from "@/config/connectDB";
import { BASE_URL, SOCKET_BASE_URL } from "@/config/constants";
import { Attendee, Meeting, OfficeHoursProps } from "@/types/OfficeHoursTypes";
import { cacheWrapper } from "@/utils/cacheWrapper";
import {
  formatSlotDateAndTime,
  getDisplayNameOrAddr,
} from "@/utils/NotificationUtils";
import { NextResponse } from "next/server";
import { io } from "socket.io-client";

async function sendMeetingStartNotification({
  db,
  title,
  startTime,
  host_address,
  additionalData,
}: {
  db: any;
  title: string;
  startTime: string;
  host_address: string;
  additionalData: any;
}) {
  try {
    // Get users collection
    const usersCollection = db.collection("users");
    const notificationCollection = db.collection("notifications");

    const normalizedHostAddress = host_address.toLowerCase();

    // Get all users except the host using MongoDB query
    const allUsers = await usersCollection
      .find({
        $expr: {
          $ne: [{ $toLower: "$address" }, normalizedHostAddress],
        },
      })
      .toArray();

    // Format the time
    const localSlotTime = await formatSlotDateAndTime({
      dateInput: startTime,
    });
    const hostENSNameOrAddress = await getDisplayNameOrAddr(host_address);

    // Create base notification object
    const baseNotification = {
      content: `Lectures "${title}", hosted by ${hostENSNameOrAddress}, have now started! 📢 This session is scheduled for ${localSlotTime} UTC. Join now to connect, ask questions, and gain valuable insights!`,
      createdAt: Date.now(),
      read_status: false,
      notification_name: "officeHoursStarted",
      notification_title: "Lectures Started",
      notification_type: "officeHours",
      additionalData: {
        ...additionalData,
        host_address,
      },
    };

    // Create notifications for all users
    const notifications = allUsers.map((user: any) => ({
      ...baseNotification,
      receiver_address: user.address,
    }));

    // Insert all notifications at once
    const notificationResults = await notificationCollection.insertMany(
      notifications
    );

    console.log("Inserted notifications:", notificationResults);

    if (notificationResults.acknowledged === true) {
      // Get all inserted notifications
      const insertedNotifications = await notificationCollection
        .find({
          _id: { $in: Object.values(notificationResults.insertedIds) },
        })
        .toArray();

      // Connect to socket server and send notifications
      const socket = io(`${SOCKET_BASE_URL}`, {
        withCredentials: true,
      });

      // socket.on("connect", () => {
      //   console.log("Connected to WebSocket server from API");

      //   socket.emit("officehours_started", {
      //     notifications: insertedNotifications.map((notification: any) => ({
      //       ...notification,
      //       _id: notification._id.toString(),
      //     })),
      //   });

      //   console.log("Bulk notifications sent from API to socket server");
      //   socket.disconnect();
      // });

      // socket.on("connect_error", (err) => {
      //   console.error("WebSocket connection error:", err);
      // });

      // socket.on("error", (err) => {
      //   console.error("WebSocket error:", err);
      // });
    }

    return notificationResults;
  } catch (error) {
    console.error("Error sending meeting start notifications:", error);
    throw error;
  }
}

export async function PUT(req: Request) {
  try {
    const walletAddress = req.headers.get("x-wallet-address");
    const updateData: OfficeHoursProps = await req.json();
    const { host_address, reference_id, attendees, ...updateFields } =
      updateData;

    console.log("updateData: ", walletAddress, updateData);

    if (cacheWrapper.isAvailable) {
      const cacheKey = `office-hours-all`;
      await cacheWrapper.delete(cacheKey);
    }

    if (!host_address || !reference_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: host_address or reference_id",
        },
        { status: 400 }
      );
    }

    if (!walletAddress) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    const client = await connectDB();
    const db = client.db();
    const collection = db.collection("office_hours");
    const delegatesCollection = db.collection("users");

    // Find the document containing the meeting with the specified reference_id
    const existingDoc = await collection.findOne({
      host_address: host_address,
      "meetings.reference_id": reference_id,
    });

    if (!existingDoc) {
      await client.close();
      return NextResponse.json(
        {
          success: false,
          message: "Meeting not found or you are not authorized to edit it",
        },
        { status: 404 }
      );
    }

    // Find the specific meeting within the document
    const existingMeeting = existingDoc.meetings.find(
      (meeting: Meeting) => meeting.reference_id === reference_id
    );

    if (!existingMeeting) {
      await client.close();
      return NextResponse.json(
        {
          success: false,
          message: "Meeting not found",
        },
        { status: 404 }
      );
    }

    const fieldsToUpdate: { [key: string]: any } = {};

    const addFieldIfChanged = (
      fieldName: string,
      value: any,
      prefix = "meetings.$[meetingElem]."
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
    addFieldIfChanged("uid_host", updateFields.uid_host);
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

      // Update host's onchain counts (without DAO-specific tracking)
      await delegatesCollection.findOneAndUpdate(
        { address: walletAddress },
        {
          $inc: {
            "meetingRecords.officeHoursHosted.onchainCounts": 1,
          },
        },
        { upsert: true }
      );

      if (cacheWrapper.isAvailable) {
        const cacheKey = `office-hours-all`;
        await cacheWrapper.delete(cacheKey);
      }
    }

    // Handle meeting status update and counts
    if (
      updateFields.meeting_status &&
      updateFields.meeting_status !== existingMeeting.meeting_status
    ) {
      addFieldIfChanged("meeting_status", updateFields.meeting_status);

      if (updateFields.meeting_status === "Ongoing") {
        try {
          await sendMeetingStartNotification({
            db,
            title: existingMeeting.title,
            startTime: existingMeeting.startTime,
            host_address,
            additionalData: existingMeeting,
          });
        } catch (error) {
          console.error("Error sending start notifications:", error);
          // Continue with the update even if notification fails
        }
      }

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
          { address: walletAddress },
          {
            $inc: {
              "meetingRecords.officeHoursHosted.totalHostedOfficeHours": 1,
            },
          },
          { upsert: true }
        );

        // Update attendees' counts
        if (existingMeeting.attendees && existingMeeting.attendees.length > 0) {
          const updatePromises = existingMeeting.attendees.map(
            (attendee: Attendee) =>
              delegatesCollection.findOneAndUpdate(
                { address: attendee.attendee_address },
                {
                  $inc: {
                    "meetingRecords.officeHoursAttended.totalAttendedOfficeHours": 1,
                  },
                },
                { upsert: true }
              )
          );

          if (cacheWrapper.isAvailable) {
            const cacheKeys = existingMeeting.attendees.map(
              (attendee: Attendee) => `profile:${attendee.attendee_address}`
            );

            await Promise.all(
              cacheKeys.map((key: string) => cacheWrapper.delete(key))
            );
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
            ...(newAttendee.attendee_uid && {
              attendee_uid: newAttendee.attendee_uid,
            }),
            ...(newAttendee.attendee_onchain_uid && {
              attendee_onchain_uid: newAttendee.attendee_onchain_uid,
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
                  "meetingRecords.officeHoursAttended.totalAttendedOfficeHours": 1,
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
            currentAttendees[existingIndex].attendee_uid =
              newAttendee.attendee_uid;
          }
          if (
            newAttendee.attendee_onchain_uid &&
            !currentAttendees[existingIndex].attendee_onchain_uid
          ) {
            currentAttendees[existingIndex].attendee_onchain_uid =
              newAttendee.attendee_onchain_uid;
            newOnchainUids.add(newAttendee.attendee_address);
          }
        }
      });

      // Update onchain counts for attendees (without DAO-specific tracking)
      for (const attendeeAddress of newOnchainUids) {
        await delegatesCollection.findOneAndUpdate(
          { address: attendeeAddress },
          {
            $inc: {
              "meetingRecords.officeHoursAttended.onchainCounts": 1,
            },
          },
          { upsert: true }
        );
      }

      fieldsToUpdate["meetings.$[meetingElem].attendees"] = currentAttendees;
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
        host_address: host_address,
        "meetings.reference_id": reference_id,
      },
      { $set: fieldsToUpdate },
      {
        arrayFilters: [{ "meetingElem.reference_id": reference_id }],
      }
    );

    const updatedDocument = await collection.findOne({
      host_address: host_address,
      "meetings.reference_id": reference_id,
    });

    await client.close();

    if (cacheWrapper.isAvailable) {
      const cacheKey = `office-hours-all` ;
      await cacheWrapper.delete(cacheKey);
    }

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
