import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import React from "react";

async function useAuthentication(req: NextRequest, address: string) {
  console.log(req.nextUrl.origin);
  const token = await getToken({
    req: req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  let isAuthorized: boolean = false;
  let origin: string = req.nextUrl.origin;
  let tokenObject = null;
  if (address.toLowerCase() === token?.sub?.toLowerCase()) {
    isAuthorized = true;
    tokenObject = token;
  }

  return {
    isAuthorized: isAuthorized,
    token: tokenObject,
    origin: origin,
  };
}

export default useAuthentication;
