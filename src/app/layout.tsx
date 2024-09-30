import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Poppins } from "next/font/google";
import ProgressBarProvider from "@/components/ProgressBarProvider/ProgressBarProvider";
import { Suspense } from "react";
import RootProviders from "./providers/root-providers";
import HuddleContextProvider from "@/context/HuddleContextProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const quanty = localFont({
  src: [
    {
      path: "./fonts/quanty.ttf",
    },
  ],
  variable: "--font-quanty",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://app.chora.club/"),
  title: "Chora Club",
  description: "Discover. Learn. Engage.",
  icons: {
    icon: ["/favicon.png"],
  },
  openGraph: {
    title: "Chora Club",
    description: "Discover. Learn. Engage.",
    url: "https://app.chora.club/",
    siteName: "Chora Club",
    images: [
      {
        url: "https://gateway.lighthouse.storage/ipfs/QmZmWxpdhQZnag8HZtwZPLR5wtK2jjfgsTBMpNpmijtZ5x",
        width: 800,
        height: 600,
        alt: "img",
      },
      {
        url: "https://gateway.lighthouse.storage/ipfs/QmZmWxpdhQZnag8HZtwZPLR5wtK2jjfgsTBMpNpmijtZ5x",
        width: 1800,
        height: 1600,
        alt: "img",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${quanty.variable} ${poppins.variable} antialiased`}>
        <ProgressBarProvider>
          <Suspense>
            <RootProviders>
              <HuddleContextProvider>
                <div className="flex">
                  <div className="w-[100%] ml-auto mt-[78px] sm:mt-[64px] lg:mt-0">
                    {/* <FeedbackTile /> */}
                    <div>{children}</div>
                  </div>
                </div>
              </HuddleContextProvider>
            </RootProviders>
          </Suspense>
        </ProgressBarProvider>
        {/* {children} */}
      </body>
    </html>
  );
}
