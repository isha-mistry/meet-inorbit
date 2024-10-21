import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import React from "react";

async function useAuthentication(req: NextRequest, address: string) {
  console.log(req.nextUrl.origin);
  const token = await getToken({
    req: req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  console.log("token::::", token?.accessToken);
  let isAuthorized: boolean = false;
  let origin: string = req.nextUrl.origin;
  if (address.toLowerCase() === token?.sub?.toLowerCase()) {
    isAuthorized = true;
  }

  return {
    isAuthorized: isAuthorized,
    token: token,
    origin: origin,
  };
}

export default useAuthentication;
