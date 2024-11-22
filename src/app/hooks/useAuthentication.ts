import { PrivyClient } from "@privy-io/server-auth";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import React from "react";

const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.NEXT_PUBLIC_PRIVY_SECRET!
);


async function useAuthentication(req: NextRequest, address: string, privyToken: string | undefined) {
  console.log(req.nextUrl.origin);
  // const token = await getToken({
  //   req: req,
  //   secret: process.env.NEXTAUTH_SECRET,
  // });

  const verifiedUser = await privyClient.verifyAuthToken(privyToken?privyToken:'');
  const user = await privyClient.getUserById(verifiedUser.userId);

  let isAuthorized: boolean = false;
  let origin: string = req.nextUrl.origin;
  let tokenObject = null;

  const linkedWallet = user.linkedAccounts
  .filter((account) => account.type === "wallet")
  .find((wallet) => wallet.address?.toLowerCase() === address.toLowerCase());

  if(linkedWallet){
    isAuthorized=true;
    tokenObject=privyToken;
  }

  // if (address.toLowerCase() === token?.sub?.toLowerCase()) {
  //   isAuthorized = true;
  //   tokenObject = token;
  // }

  return {
    isAuthorized: isAuthorized,
    token: tokenObject,
    origin: origin,
  };
}

export default useAuthentication;
