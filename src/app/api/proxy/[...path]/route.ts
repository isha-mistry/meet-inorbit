import { BASE_URL } from "@/config/constants";
import { NextRequest, NextResponse } from "next/server";

async function handler(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const method = request.method;
  const searchParams = request.nextUrl.searchParams.toString();
  console.log("path:::", path);
  let requestBody;
  if (["POST", "PUT"].includes(method)) {
    requestBody = await request.json();
  }

  // Get all headers from the incoming request
  const headers = Object.fromEntries(request.headers);

  try {
    const url = `${BASE_URL}/${path}${searchParams ? `?${searchParams}` : ""}`;
    const response = await fetch(url, {
      method,
      headers: {
        ...headers,
        Authorization: `Bearer ${process.env.API_KEY}`,
        "Content-Type": "application/json",
      },
      ...(requestBody && { body: JSON.stringify(requestBody) }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("API request failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
