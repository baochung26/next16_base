import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // Test if authOptions can be loaded
    const providers = authOptions.providers;
    
    return NextResponse.json({
      success: true,
      providersCount: providers.length,
      providerNames: providers.map((p: any) => p.name || p.id),
      hasSecret: !!authOptions.secret,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
