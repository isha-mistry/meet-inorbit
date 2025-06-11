import type { Metadata } from "next";

export const DEFAULT_METADATA: Metadata = {
  metadataBase: new URL("https://inorbit-app.vercel.app/"),
  title: "Inorbit",
  description: "The requested page does not exist.",
  openGraph: {
    title: "Inorbit - Page Not Found",
    description: "The requested page does not exist.",
    url: "https://inorbit-app.vercel.app/",
    siteName: "Inorbit",
    // images: [
    //   {
    //     url: "https://gateway.lighthouse.storage/ipfs/bafybeiez3e5gvqra2r3ijbg2arrdhaalzoqqzgr5s4tc2tlysyuywnzude", // Default or error image
    //     width: 800,
    //     height: 600,
    //     alt: "img",
    //   },
    // ],
    locale: "en_US",
    type: "website",
  },
};
