import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const allowedOrigins = [
  process.env.NEXT_PUBLIC_LOCAL_BASE_URL!,
  process.env.NEXT_PUBLIC_HOSTED_BASE_URL!,
  process.env.NEXT_PUBLIC_MIDDLEWARE_BASE_URL!,
  process.env.NEXT_PUBLIC_LOCAL_APP_URL!,
  process.env.NEXT_PUBLIC_HOSTED_APP_URL!,
].filter(Boolean);

export async function middleware(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const apiKey = request.headers.get("x-api-key");
  const authorizationToken = request.headers.get("Authorization");
  const walletAddress = request.headers.get("x-wallet-address");

  console.log("Allowed Origins:", allowedOrigins);
  console.log("Origin from request:", origin);
  console.log("apiKey", apiKey);
  console.log("authorizationToken", authorizationToken);

  if (!origin || !allowedOrigins.includes(origin)) {
    console.log("Unknown origin request. Forbidden");
    return new NextResponse(
      JSON.stringify({ error: "Unknown origin request. Forbidden" }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin,
          "Referrer-Policy": "strict-origin",
        },
      }
    );
  }

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, x-wallet-address",
        "Referrer-Policy": "strict-origin",
      },
    });
  }

  if (!["POST", "PUT", "DELETE"].includes(request.method)) {
    const response = NextResponse.next();
    setCorsHeaders(response, origin);
    return response;
  }

  if (!apiKey || apiKey !== process.env.MEETING_APP_API_KEY!) {
    console.log("Invalid API key. Forbidden");
    return new NextResponse(
      JSON.stringify({ error: "Invalid API key. Forbidden" }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // const token = await getToken({
  //   req: request,
  //   secret: process.env.NEXTAUTH_SECRET,
  // });
  // console.log("token", token);
  // if (!token) {
  //   console.log("Unauthorized");
  //   return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
  //     status: 401,
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Access-Control-Allow-Origin": origin || "*",
  //     },
  //   });
  // }

  // const UserAddress = token.sub;

  // if (UserAddress !== walletAddress) {
  //   console.log(
  //     `Forbidden access attempt: By user with address :- ${UserAddress}`
  //   );
  //   return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
  //     status: 403,
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Access-Control-Allow-Origin": origin || "*",
  //     },
  //   });
  // }

  const response = NextResponse.next();
  setCorsHeaders(response, origin);
  return response;
}

function setCorsHeaders(response: NextResponse, origin: string | null) {
  response.headers.set("Access-Control-Allow-Origin", origin || "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-wallet-address"
  );
  response.headers.set("Referrer-Policy", "strict-origin");
}

export const config = {
  matcher: [
    "/api/proxy/:path*",
    "/api/end-call/:path*",
    "/api/update-meeting-status/:path*",
    "/api/update-recorded-session/:path*",
    "/api/update-recording-status/:path*",
    "/api/update-session-attendees/:path*",
    "/api/update-video-uri/:path*",
    "/api/get-attest-data/:path*",
    "/api/new-token/:path*",
    "/api/profile/:path*",
    "/api/attest-offchain/:path",
  ],
};

// "/api/verify-meeting-id/:path",
// "/api/images/og/nft/:path",
