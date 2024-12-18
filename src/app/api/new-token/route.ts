import { AccessToken, Role } from "@huddle01/server-sdk/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const createToken = async (
  roomId: string,
  role: string,
  displayName: string,
  address: string | null // Updated type to accept string or null
) => {
  const accessToken = new AccessToken({
    apiKey: process.env.NEXT_PUBLIC_API_KEY!,
    roomId: roomId as string,
    role: role,
    permissions: {
      admin: true,
      canConsume: true,
      canProduce: true,
      canProduceSources: {
        cam: true,
        mic: true,
        screen: true,
      },
      canRecvData: true,
      canSendData: true,
      canUpdateMetadata: true,
    },
    options: {
      metadata: {
        displayName: displayName,
        walletAddress: address,
      },
    },
  });

  const token = await accessToken.toJwt();

  return token;
};

export async function POST(req: NextRequest) {
  try {
    const { roomId, role, displayName, address, meetingType } =
      await req.json();

    if (!roomId) {
      return NextResponse.json(
        { success: false, message: "Missing roomId" },
        { status: 400 }
      );
    }

    if (!role) {
      return NextResponse.json(
        { success: false, message: "Missing role" },
        { status: 400 }
      );
    }

    if (!displayName) {
      return NextResponse.json(
        { success: false, message: "Missing displayName" },
        { status: 400 }
      );
    }

    let token: string;

    try {
      if (meetingType === "session") {
        token = await createToken(
          roomId,
          role === "host" ? Role.HOST : Role.GUEST,
          displayName,
          address
        );
      } else if (meetingType === "officehours") {
        token = await createToken(
          roomId,
          role === "host" ? Role.HOST : Role.LISTENER,
          displayName,
          address
        );
      } else {
        return NextResponse.json(
          { success: false, message: "Invalid meetingType" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error in createToken:", error);
      return NextResponse.json(
        { success: false, message: "Failed to create token" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, token }, { status: 200 });
  } catch (error) {
    console.error("Error parsing request:", error);
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 }
    );
  }
}
