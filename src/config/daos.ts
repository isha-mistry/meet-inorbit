import { DAOConfig } from "../types/daos";
import { optimism, arbitrum, arbitrumSepolia, mantle } from "viem/chains";

export const daoConfigs: { [key: string]: DAOConfig } = {
  optimism: {
    name: "Optimism",
    logo: "/images/op.png", // Move images to public folder for better maintainability
    chainId: 10,
    chainName: "OP Mainnet",
    chainAddress: "0x4200000000000000000000000000000000000042",
    viemchain: optimism,
    tokenSymbol: "OP",
    alchemyAttestationUrl: process.env.NEXT_PUBLIC_OP_ATTESTATION_URL || "",
    offchainAttestationUrl: "https://optimism.easscan.org",
    attestationUrl: "https://optimism.easscan.org/offchain/attestation/view",
    eascontracAddress: "0x4200000000000000000000000000000000000021",
    blocks: [
        {
          title: "Forum",
          link: "https://gov.optimism.io/",
        },
        {
          title: "Website",
          link: "https://optimism.io/",
        },
        {
          title: "Block Explorer",
          link: "https://optimistic.etherscan.io/",
        },
        {
          title: "Optimism Twitter Profile",
          link: "https://twitter.com/Optimism",
        },
        {
          title: "Optimism DAO Twitter Profile",
          link: "https://twitter.com/OptimismGov",
        },
      ],
  },
  arbitrum: {
    name: "Arbitrum",
    logo: "/images/arb.png",
    chainId: 42161,
    chainName: "Arbitrum One",
    chainAddress: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    viemchain: arbitrum,
    tokenSymbol: "ARB",
    alchemyAttestationUrl: process.env.NEXT_PUBLIC_ARB_ATTESTATION_URL || "",
    offchainAttestationUrl: "https://arbitrum.easscan.org",
    attestationUrl: "https://arbitrum.easscan.org/offchain/attestation/view",
    attestationView:"https://optimism.easscan.org/attestation/view",
    eascontracAddress: "0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458",
    blocks: [
        {
          title: "Forum",
          link: "https://forum.arbitrum.foundation",
        },
        {
          title: "Website",
          link: "https://arbitrum.io",
        },
        {
          title: "Arbitrum Foundation Website",
          link: "https://arbitrum.foundation",
        },
        {
          title: "Block Explorer",
          link: "https://arbiscan.io",
        },
        {
          title: "Arbitrum Twitter Profile",
          link: "https://twitter.com/arbitrum",
        },
        {
          title: "Arbitrum DAO Twitter Profile",
          link: "https://x.com/arbitrumdao_gov",
        },
      ],
  },
  arbitrumSepolia: {
    name: "Arbitrum Sepolia",
    logo: "/images/arb.png", // Ensure you add this image to your public folder
    chainId: 421614,
    chainName: "Arbitrum Sepolia",
    chainAddress: "0x0000000000000000000000000000000000000000", // Replace with actual address if available
    viemchain: arbitrumSepolia,
    tokenSymbol: "ARB",
    alchemyAttestationUrl: process.env.NEXT_PUBLIC_ARB_ATTESTATION_URL || "",
    offchainAttestationUrl: "https://arbitrum.easscan.org",
    attestationUrl: "https://arbitrum.easscan.org/offchain/attestation/view",
    attestationView:"https://arbitrum.easscan.org/attestation/view",
    eascontracAddress: "0x0000000000000000000000000000000000000000", // Replace with actual address if available
  
  },
  // Easy to add new DAOs
  mantle: {
    name: "Mantle",
    logo: "/images/Mantledaologo.png",
    chainId: 5000,
    chainName: "Mantle",
    chainAddress: "0xEd459209796D741F5B609131aBd927586fcCACC5", // Replace with actual address
    viemchain: mantle,
    tokenSymbol: "MNT",
    alchemyAttestationUrl: process.env.NEXT_PUBLIC_ARB_ATTESTATION_URL || "",
    offchainAttestationUrl: "https://arbitrum.easscan.org",
    attestationUrl: "https://optimism.easscan.org/offchain/attestation/view",
    eascontracAddress: "0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458",
    blocks: [
      {
        title: "Forum",
        link: "https://gov.mantle.io/",
      },
      {
        title: "Website",
        link: "https://mantle.io/",
      },
      {
        title: "Block Explorer",
        link: "https://mantle.io/",
      },
      {
        title: "Mantle Twitter Profile",
        link: "https://twitter.com/mantle",
      },
      {
        title: "Mantle DAO Twitter Profile",
        link: "https://twitter.com/MantleGov",
      },
    ],
  },
};
