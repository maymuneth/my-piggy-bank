import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Privy API'yi direkt fetch ile çağır
    const accessToken = authHeader.replace("Bearer ", "");

    const response = await fetch("https://auth.privy.io/api/v1/users/me", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "privy-app-id": process.env.PRIVY_APP_ID!,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userData = await response.json();
    
    // Starknet wallet bul veya oluştur
    const existingWallet = userData.linked_accounts?.find(
      (acc: any) => acc.type === "wallet" && acc.chain_type === "starknet"
    );

    if (existingWallet) {
      return NextResponse.json({
        wallet: {
          id: existingWallet.id,
          publicKey: existingWallet.public_key,
          address: existingWallet.address,
        },
      });
    }

    // Yeni wallet oluştur
    const createRes = await fetch("https://api.privy.io/v1/wallets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "privy-app-id": process.env.PRIVY_APP_ID!,
        "Authorization": "Basic " + Buffer.from(
          `${process.env.PRIVY_APP_ID}:${process.env.PRIVY_APP_SECRET}`
        ).toString("base64"),
      },
      body: JSON.stringify({ chain_type: "starknet" }),
    });

    const newWallet = await createRes.json();

    return NextResponse.json({
      wallet: {
        id: newWallet.id,
        publicKey: newWallet.public_key,
        address: newWallet.address,
      },
    });
  } catch (error: any) {
    console.error("Wallet error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}