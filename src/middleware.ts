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
  console.log("request:::", request);
  console.log("request:::", request.nextUrl.origin);
  console.log("Allowed Origins:", allowedOrigins);
  console.log("Origin from request:", origin);

  // Handle CORS pre-flight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, x-wallet-address",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  // Check origin
  if (origin && !allowedOrigins.includes(origin)) {
    return new NextResponse(
      JSON.stringify({ error: "Unknown origin request. Forbidden" }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin,
        },
      }
    );
  }

  // For GET requests, proceed without authentication
  if (request.method === "GET") {
    const response = NextResponse.next();
    setCorsHeaders(response, origin);
    return response;
  }

  // For POST, PUT, DELETE requests, verify authentication
  // if (["POST", "PUT", "DELETE"].includes(request.method)) {
  //   const walletAddress = request.headers.get("x-wallet-address");
  //   const token = await getToken({
  //     req: request,
  //     secret: process.env.NEXTAUTH_SECRET,
  //   });

  //   // If no token is present
  //   if (!token) {
  //     return new NextResponse(
  //       JSON.stringify({ error: "Unauthorized - No token present" }),
  //       {
  //         status: 401,
  //         headers: {
  //           "Content-Type": "application/json",
  //           "Access-Control-Allow-Origin": origin || "*",
  //           "Access-Control-Allow-Credentials": "true",
  //         },
  //       }
  //     );
  //   }

  //   const UserAddress = token.sub;

  //   // If wallet address doesn't match
  //   if (walletAddress && UserAddress !== walletAddress) {
  //     console.log(
  //       `Forbidden access attempt: By user with address :- ${UserAddress}`
  //     );
  //     return new NextResponse(
  //       JSON.stringify({ error: "Forbidden - Address mismatch" }),
  //       {
  //         status: 403,
  //         headers: {
  //           "Content-Type": "application/json",
  //           "Access-Control-Allow-Origin": origin || "*",
  //           "Access-Control-Allow-Credentials": "true",
  //         },
  //       }
  //     );
  //   }
  // }

  // If all checks pass, proceed with the request
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
  response.headers.set("Access-Control-Allow-Credentials", "true");
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
  ],
};

// "/api/attest-offchain/:path",
// "/api/verify-meeting-id/:path",
// "/api/images/og/nft/:path",
