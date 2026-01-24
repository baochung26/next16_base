import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Call backend API
    const response = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: validatedData.email,
        password: validatedData.password,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: responseData.message || "Đăng nhập thất bại",
          statusCode: response.status,
        },
        { status: response.status }
      );
    }

    // Return backend response as-is
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: error.errors[0].message,
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Có lỗi xảy ra khi đăng nhập",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}
