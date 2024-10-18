import { APP_BASE_URL } from "@/config/constants";
import { NextRequest, NextResponse } from "next/server";
// export const revalidate = 0;

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const { meetingId, host_address, title, description, thumbnail_image } =
      await req.json();
    // console.log("additionalData::", additionalData);

    const raw = JSON.stringify({
      meetingId: meetingId,
      host_address: host_address,
      title: title,
      description: description,
      thumbnail_image: thumbnail_image,
    });

    const requestOptions: any = {
      method: "PUT",
      body: raw,
      redirect: "follow",
    };
    const response = await fetch(
      `${APP_BASE_URL}/api/update-recorded-session`,
      requestOptions
    );

    // if (!response.ok) {
    //   throw new Error("Failed to fetch");
    // }

    const result = await response.json();

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving data in create-room:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
