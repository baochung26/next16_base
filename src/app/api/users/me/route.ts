import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          message: "Unauthorized",
          statusCode: 401,
        },
        { status: 401 }
      );
    }

    // Extract token
    const token = authHeader.replace("Bearer ", "");

    // For fake API: Extract user ID from token format "fake-jwt-token-{userId}-{random}"
    // In real backend, JWT will be decoded to get user ID
    let userId: string | null = null;

    if (token.startsWith("fake-jwt-token-")) {
      // Extract user ID from fake token
      // Format: fake-jwt-token-{userId}|{random}
      const tokenWithoutPrefix = token.replace("fake-jwt-token-", "");
      const parts = tokenWithoutPrefix.split("|");
      if (parts.length >= 1 && parts[0]) {
        userId = parts[0];
      }
    } else {
      // Real JWT token - will be handled by backend
      // For now, return error
      return NextResponse.json(
        {
          message:
            "Token validation not implemented for fake API. Please use fake token.",
          statusCode: 401,
        },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        {
          message: "Unauthorized",
          statusCode: 401,
        },
        { status: 401 }
      );
    }

    // Get user from database
    const user = getUserById(userId);
    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
          statusCode: 404,
        },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      data: userWithoutPassword,
      message: "Success",
      statusCode: 200,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      {
        message: "Có lỗi xảy ra",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}
