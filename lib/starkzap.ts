import { StarkZap } from "starkzap";

// Singleton SDK instance — mainnet
let _sdk: StarkZap | null = null;

export function getSDK(): StarkZap {
  if (!_sdk) {
    _sdk = new StarkZap({
      network: "mainnet",
      // Optional: override RPC if you have an Alchemy/Infura key
      // rpc: { nodeUrl: process.env.NEXT_PUBLIC_STARKNET_RPC_URL },
    });
  }
  return _sdk;
}
