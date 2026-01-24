import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
          statusCode: 401,
        },
        { status: 401 }
      );
    }

    // Extract token
    const token = authHeader.replace("Bearer ", "");

    // Call backend API /auth/profile
    const response = await fetch(`${BACKEND_API_URL}/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: responseData.message || "Unauthorized",
          statusCode: response.status,
        },
        { status: response.status }
      );
    }

    // Backend /auth/profile returns user data directly (not wrapped)
    // Return as-is to match backend format
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Có lỗi xảy ra",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}
