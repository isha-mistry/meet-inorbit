import { APP_BASE_URL, BASE_URL } from "@/config/constants";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import useAuthentication from "@/app/hooks/useAuthentication";
// export const revalidate = 0;

export async function POST(req: NextRequest, res: NextResponse) {
  console.log("req object::", req);
  try {
    const { meetingId, host_address, title, description, thumbnail_image } =
      await req.json();
    console.log(meetingId, host_address, title, description, thumbnail_image);

    const { isAuthorized, token, origin } = await useAuthentication(
      req,
      host_address
    );

    console.log(isAuthorized, token, origin);

    if (isAuthorized === false) {
      return NextResponse.json(
        { success: false, error: "Unauthorized Request" },
        { status: 404 }
      );
    }

    const myHeaders = new Headers();

    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("x-api-key", process.env.NEXT_PUBLIC_TEST_API_KEY!);
    myHeaders.append(
      "Authorization",
      JSON.stringify({ token, isAuthorized, origin })
    );
    myHeaders.append("x-wallet-address", host_address);

    const raw = JSON.stringify({
      meetingId: meetingId,
      host_address: host_address,
      title: title,
      description: description,
      thumbnail_image: thumbnail_image,
    });

    const requestOptions: any = {
      method: "PUT",
      headers: myHeaders,
      body: raw,
      // redirect: "follow",
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
