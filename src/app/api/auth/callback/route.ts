import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/spotify-auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state") || "source";
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/auth?error=${error}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/auth?error=no_code`
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    // Redirect back to the app with tokens in URL params (for session storage)
    const redirectUrl = new URL(`${process.env.NEXTAUTH_URL}/auth`);
    redirectUrl.searchParams.set("tokens", JSON.stringify(tokens));
    redirectUrl.searchParams.set("account_type", state);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/auth?error=token_exchange_failed`
    );
  }
}
