import { NextRequest, NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/node";

const privy = new PrivyClient({
  appId: process.env.PRIVY_APP_ID!,
  appSecret: process.env.PRIVY_APP_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    // Access token'ı doğrula
    const authHeader = req.headers.get("authorization");
    const accessToken = authHeader?.replace("Bearer ", "");
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Privy'den kullanıcıyı doğrula
    const claims = await privy.verifyAuthToken(accessToken);
    const userId = claims.userId;

    // Bu kullanıcıya ait Starknet wallet'ı bul veya oluştur
    const user = await privy.getUser(userId);
    const existingWallet = user.linkedAccounts?.find(
      (a: any) => a.type === "wallet" && a.chainType === "starknet"
    );

    if (existingWallet) {
      return NextResponse.json({
        wallet: {
          id: (existingWallet as any).id,
          publicKey: (existingWallet as any).publicKey,
          address: (existingWallet as any).address,
        },
      });
    }

    // Yeni wallet oluştur
    const newWallet = await (privy.wallets() as any).create({
      chain_type: "starknet",
      user_id: userId,
    });

    return NextResponse.json({
      wallet: {
        id: newWallet.id,
        publicKey: newWallet.public_key,
        address: newWallet.address,
      },
    });
  } catch (err: any) {
    console.error("Wallet API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
