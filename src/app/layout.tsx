import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Poppins, Tektur } from "next/font/google";
import ProgressBarProvider from "@/components/ProgressBarProvider/ProgressBarProvider";
import { Suspense } from "react";
import RootProviders from "./providers/root-providers";
import HuddleContextProvider from "@/context/HuddleContextProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-tektur",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stylus-university.vercel.app/"),
  title: "Arbitrum University",
  description: "Discover. Learn. Engage.",
  icons: {
    icon: ["/favicon.png"],
  },
  openGraph: {
    title: "Arbitrum University",
    description: "Discover. Learn. Engage.",
    url: "https://stylus-university.vercel.app/",
    siteName: "Arbitrum University",
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
      <body className={`${tektur.variable} ${poppins.variable} antialiased`}>
        <ProgressBarProvider>
          <Suspense>
            <RootProviders>
              <HuddleContextProvider>
                <div className="flex">
                  <div className="w-[100%] ml-auto">
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
