import { APP_BASE_URL } from "@/config/constants";
import { NextRequest, NextResponse } from "next/server";
export const revalidate = 0;

export async function GET(req: NextRequest, res: NextResponse) {
  const { searchParams } = req.nextUrl;
  const roomId = searchParams.get("roomId");
  try {
    const requestOptions: any = {
      method: "GET",
      redirect: "follow",
    };
    const response = await fetch(
      `${APP_BASE_URL}/api/get-watch-data/${roomId}`,
      requestOptions
    );
    // if (!response.ok) {
    //   throw new Error("Network response was not ok");
    // }
    const result = await response.json();
    console.log("result:::", result);

    // console.log(roomId);
    // Return the found documents
    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving data in create-room:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
