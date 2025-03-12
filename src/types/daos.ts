import { Chain } from "viem/chains"; 

export interface DAOBlock {
    title: string;
    link: string;
  }

export interface DAOConfig {
    name: string;
    logo: string;
    chainId: number;
    chainName:string;
    viemchain:Chain;
    chainAddress: string;
    tokenSymbol: string;
    blocks?: DAOBlock[];
    attestationUrl:string;
    attestationView?:string;
    eascontracAddress:string;
    alchemyAttestationUrl:string;
    offchainAttestationUrl:string;
  }