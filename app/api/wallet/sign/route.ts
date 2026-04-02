import { NextRequest, NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/node";

const privy = new PrivyClient({
  appId: process.env.PRIVY_APP_ID!,
  appSecret: process.env.PRIVY_APP_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { walletId, hash } = await req.json();

    if (!walletId || !hash) {
      return NextResponse.json(
        { error: "walletId ve hash gerekli" },
        { status: 400 }
      );
    }

    const result = await (privy.wallets() as any).rawSign(walletId, {
      params: { hash },
    });

    return NextResponse.json({ signature: result.signature });
  } catch (err: any) {
    console.error("Sign API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
