import { NextRequest, NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/node";

const privy = new PrivyClient({
  appId: process.env.PRIVY_APP_ID!,
  appSecret: process.env.PRIVY_APP_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = authHeader.replace("Bearer ", "");
    const claims = await privy.verifyAuthToken(accessToken);
    const userId = claims.userId;

    const user = await privy.getUser(userId);
    const existingWallet = (user as any).linkedAccounts?.find(
      (acc: any) => acc.type === "wallet" && acc.chainType === "starknet"
    );

    if (existingWallet) {
      return NextResponse.json({
        wallet: {
          id: existingWallet.id,
          publicKey: existingWallet.publicKey,
          address: existingWallet.address,
        },
      });
    }

    const newWallet = await (privy as any).wallets().create({
      chain_type: "starknet",
    });

    return NextResponse.json({
      wallet: {
        id: newWallet.id,
        publicKey: newWallet.public_key,
        address: newWallet.address,
      },
    });
  } catch (error: any) {
    console.error("Wallet creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}